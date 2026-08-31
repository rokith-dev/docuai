from pathlib import Path
from tempfile import NamedTemporaryFile
import json
import logging

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse

from backend.api.dependencies import get_current_user
from backend.database.repositories.managed_documents import (
    ManagedDocumentRepository,
)
from backend.documents.docx_populator import DocxPopulator
from backend.documents.template_analyzer import TemplateAnalyzer
from backend.documents.template_map import TemplateMapBuilder
from backend.documents.template_understanding import TemplateUnderstanding
from backend.storage.local_storage import save_generated_file


router = APIRouter(
    prefix="/api/templates",
    tags=["Templates"],
)

logger = logging.getLogger(__name__)


# ============================================================
# TEMPLATE ANALYSIS HELPER
# ============================================================

def analyze_uploaded_template(file_path: str) -> dict:
    """
    Analyze a DOCX template and build its
    dynamic semantic map.
    """

    analysis = TemplateAnalyzer().analyze(
        file_path
    )

    understanding = (
        TemplateUnderstanding().understand(
            analysis
        )
    )

    template_map = (
        TemplateMapBuilder().build(
            understanding
        )
    )

    return template_map


# ============================================================
# ANALYZE TEMPLATE
# ============================================================

@router.post("/analyze")
async def analyze_template(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Upload a DOCX template and analyze its
    structure and dynamically detected fields.
    """

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    # --------------------------------------------------------
    # Only DOCX templates are supported
    # --------------------------------------------------------

    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files are supported.",
        )

    temporary_path: Path | None = None

    try:
        # ====================================================
        # SAVE UPLOADED DOCX TEMPORARILY
        # ====================================================

        suffix = Path(file.filename).suffix

        with NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temporary_file:

            file_data = await file.read()

            if not file_data:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded DOCX file is empty.",
                )

            temporary_file.write(
                file_data
            )

            temporary_path = Path(
                temporary_file.name
            )

        logger.info(
            "Analyzing DOCX template: %s",
            file.filename,
        )

        # ====================================================
        # ANALYZE TEMPLATE
        # ====================================================

        template_map = (
            analyze_uploaded_template(
                str(temporary_path)
            )
        )

        # ====================================================
        # FRONTEND-FRIENDLY RESPONSE
        # ====================================================

        return {
            "status": "success",
            "file_name": file.filename,
            "fields": template_map.get(
                "fields",
                [],
            ),
            "table_fields": template_map.get(
                "table_fields",
                [],
            ),
        }

    except HTTPException:
        raise

    except FileNotFoundError as error:
        logger.exception(
            "Template file was not found during analysis."
        )

        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except ValueError as error:
        logger.exception(
            "Invalid template during analysis."
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:
        logger.exception(
            "DOCX template analysis failed for %s",
            file.filename,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to analyze the document template: "
                f"{error}"
            ),
        ) from error

    finally:
        # ====================================================
        # REMOVE TEMPORARY TEMPLATE
        # ====================================================

        if (
            temporary_path is not None
            and temporary_path.exists()
        ):
            try:
                temporary_path.unlink()
            except OSError:
                logger.warning(
                    "Could not remove temporary template: %s",
                    temporary_path,
                )


# ============================================================
# GENERATE DOCUMENT
# ============================================================

@router.post("/generate")
async def generate_document(
    file: UploadFile = File(...),
    content: str = Form(...),
    output_image: UploadFile | None = File(None),
    user: dict = Depends(get_current_user),
    project_id: str | None = Form(None),
    document_name: str | None = Form(None),
):
    """
    Populate the uploaded DOCX template with
    dynamic content and optionally insert an
    output screenshot.
    """

    # ========================================================
    # VALIDATE TEMPLATE FILE
    # ========================================================

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files are supported.",
        )

    # ========================================================
    # VALIDATE CONTENT
    # ========================================================

    if not content or not content.strip():
        raise HTTPException(
            status_code=400,
            detail="No document content was provided.",
        )

    # ========================================================
    # TEMPORARY FILE PATHS
    # ========================================================

    template_path: Path | None = None
    output_path: Path | None = None
    image_path: Path | None = None

    try:
        # ====================================================
        # PROJECT ID
        # ====================================================

        parsed_project_id: int | None = None

        if project_id and project_id.strip():

            try:
                parsed_project_id = int(
                    project_id.strip()
                )

            except ValueError as error:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid project ID.",
                ) from error

        # ====================================================
        # PARSE CONTENT JSON
        # ====================================================

        try:
            user_content = json.loads(
                content
            )

        except json.JSONDecodeError as error:
            raise HTTPException(
                status_code=400,
                detail="Invalid content JSON.",
            ) from error

        if not isinstance(
            user_content,
            dict,
        ):
            raise HTTPException(
                status_code=400,
                detail="Content must be a JSON object.",
            )

        # ====================================================
        # SAVE TEMPLATE TEMPORARILY
        # ====================================================

        with NamedTemporaryFile(
            delete=False,
            suffix=".docx",
        ) as template_file:

            template_data = await file.read()

            if not template_data:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded DOCX file is empty.",
                )

            template_file.write(
                template_data
            )

            template_path = Path(
                template_file.name
            )

        logger.info(
            "Generating document from template: %s",
            file.filename,
        )

        # ====================================================
        # OPTIONAL OUTPUT IMAGE
        # ====================================================

        if (
            output_image is not None
            and output_image.filename
        ):

            allowed_extensions = {
                ".png",
                ".jpg",
                ".jpeg",
                ".webp",
            }

            image_suffix = (
                Path(
                    output_image.filename
                )
                .suffix
                .lower()
            )

            if image_suffix not in allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Output screenshot must be "
                        "PNG, JPG, JPEG, or WEBP."
                    ),
                )

            image_data = await output_image.read()

            if not image_data:
                raise HTTPException(
                    status_code=400,
                    detail="The output screenshot is empty.",
                )

            with NamedTemporaryFile(
                delete=False,
                suffix=image_suffix,
            ) as image_file:

                image_file.write(
                    image_data
                )

                image_path = Path(
                    image_file.name
                )

            # ------------------------------------------------
            # Give DocxPopulator the actual image path
            # ------------------------------------------------

            user_content["output"] = str(
                image_path
            )

        # ====================================================
        # ANALYZE TEMPLATE
        # ====================================================

        template_map = (
            analyze_uploaded_template(
                str(template_path)
            )
        )

        # ====================================================
        # CHECK THAT TEMPLATE HAS DETECTED FIELDS
        # ====================================================

        detected_fields = template_map.get(
            "fields",
            [],
        )

        detected_table_fields = template_map.get(
            "table_fields",
            [],
        )

        if (
            not detected_fields
            and not detected_table_fields
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "No editable fields were detected "
                    "in the DOCX template."
                ),
            )

        # ====================================================
        # CREATE TEMPORARY OUTPUT FILE
        # ====================================================

        with NamedTemporaryFile(
            delete=False,
            suffix=".docx",
        ) as output_file:

            output_path = Path(
                output_file.name
            )

        # ====================================================
        # POPULATE DOCX
        # ====================================================

        generated_file = (
            DocxPopulator().populate(
                template_path=str(
                    template_path
                ),
                output_path=str(
                    output_path
                ),
                template_map=template_map,
                content=user_content,
            )
        )

        # ====================================================
        # VERIFY GENERATED FILE
        # ====================================================

        if generated_file is None:
            raise RuntimeError(
                "DOCX generator returned no output file."
            )

        generated_path = Path(
            generated_file
        )

        if not generated_path.exists():
            raise FileNotFoundError(
                f"Generated DOCX was not found: "
                f"{generated_path}"
            )

        # ====================================================
        # DOCUMENT NAME
        # ====================================================

        if (
            document_name
            and document_name.strip()
        ):
            safe_document_name = (
                document_name.strip()
            )
        else:
            safe_document_name = (
                f"DocuAI_{Path(file.filename).stem}"
            )

        if not safe_document_name.lower().endswith(
            ".docx"
        ):
            safe_document_name += ".docx"

        # ====================================================
        # STORE GENERATED FILE
        # ====================================================

        stored_file = save_generated_file(
            generated_file,
            safe_document_name,
        )

        if not stored_file:
            raise RuntimeError(
                "Generated file could not be stored."
            )

        stored_path = Path(
            stored_file
        )

        if not stored_path.exists():
            raise FileNotFoundError(
                f"Stored generated DOCX was not found: "
                f"{stored_path}"
            )

        logger.info(
            "Generated DOCX stored at: %s",
            stored_path,
        )

        # ====================================================
        # SAVE DOCUMENT METADATA
        # ====================================================

        repository = ManagedDocumentRepository()

        repository.create(
            document_name=safe_document_name,
            template_name=Path(
                file.filename
            ).name,
            file_path=str(
                stored_path
            ),
            content=json.dumps(
                user_content
            ),
            project_id=parsed_project_id,
            user_id=user["id"],
        )

        logger.info(
            "Document metadata saved successfully: %s",
            safe_document_name,
        )

        # ====================================================
        # RETURN GENERATED DOCX
        # ====================================================

        return FileResponse(
            path=str(
                stored_path
            ),
            media_type=(
                "application/vnd.openxmlformats-officedocument"
                ".wordprocessingml.document"
            ),
            filename=safe_document_name,
        )

    # ========================================================
    # HTTP EXCEPTION
    # ========================================================

    except HTTPException:
        raise

    # ========================================================
    # FILE NOT FOUND
    # ========================================================

    except FileNotFoundError as error:

        logger.exception(
            "Generated file was not found."
        )

        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    # ========================================================
    # VALUE ERROR
    # ========================================================

    except ValueError as error:

        logger.exception(
            "Invalid value during DOCX generation."
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    # ========================================================
    # ALL OTHER ERRORS
    # ========================================================

    except Exception as error:

        logger.exception(
            "DOCX generation failed for template %s",
            file.filename,
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # During development, return the actual error.
        # ----------------------------------------------------

        raise HTTPException(
            status_code=500,
            detail=(
                f"Document generation failed: {error}"
            ),
        ) from error

    # ========================================================
    # CLEAN TEMPORARY FILES
    # ========================================================

    finally:

        # ----------------------------------------------------
        # Remove temporary template
        # ----------------------------------------------------

        if (
            template_path is not None
            and template_path.exists()
        ):
            try:
                template_path.unlink()
            except OSError:
                logger.warning(
                    "Could not remove temporary template: %s",
                    template_path,
                )

        # ----------------------------------------------------
        # Remove temporary image
        # ----------------------------------------------------

        if (
            image_path is not None
            and image_path.exists()
        ):
            try:
                image_path.unlink()
            except OSError:
                logger.warning(
                    "Could not remove temporary image: %s",
                    image_path,
                )

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # DO NOT DELETE output_path here.
        #
        # DocxPopulator may use it as its generated file,
        # and save_generated_file may depend on it.
        # ----------------------------------------------------