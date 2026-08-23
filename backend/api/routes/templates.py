from pathlib import Path
from tempfile import NamedTemporaryFile
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.documents.docx_populator import DocxPopulator
from backend.documents.template_analyzer import TemplateAnalyzer
from backend.documents.template_understanding import TemplateUnderstanding
from backend.documents.template_map import TemplateMapBuilder
from backend.database.repositories.managed_documents import ManagedDocumentRepository
from backend.storage.local_storage import save_generated_file


router = APIRouter(
    prefix="/api/templates",
    tags=["Templates"],
)


# ==================================================
# TEMPLATE ANALYSIS HELPER
# ==================================================

def analyze_uploaded_template(
    file_path: str,
):
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


# ==================================================
# ANALYZE TEMPLATE
# ==================================================

@router.post("/analyze")
async def analyze_template(
    file: UploadFile = File(...),
):
    """
    Upload a DOCX template and analyze its
    structure and dynamically detected fields.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    if not file.filename.lower().endswith(
        ".docx"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files are supported.",
        )

    temporary_path = None

    try:
        # ------------------------------------------
        # Save uploaded DOCX temporarily
        # ------------------------------------------

        suffix = Path(
            file.filename
        ).suffix

        with NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temporary_file:

            file_data = await file.read()

            temporary_file.write(
                file_data
            )

            temporary_path = Path(
                temporary_file.name
            )

        # ------------------------------------------
        # Analyze template
        # ------------------------------------------

        template_map = (
            analyze_uploaded_template(
                str(temporary_path)
            )
        )

        # ------------------------------------------
        # Return frontend-friendly response
        # ------------------------------------------

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

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to analyze the document "
                f"template: {error}"
            ),
        ) from error

    finally:

        # ------------------------------------------
        # Remove temporary template
        # ------------------------------------------

        if (
            temporary_path
            and temporary_path.exists()
        ):

            try:
                temporary_path.unlink()

            except OSError:
                pass


# ==================================================
# GENERATE DOCUMENT
# ==================================================

@router.post("/generate")
async def generate_document(
    file: UploadFile = File(...),
    content: str = Form(...),
    output_image: UploadFile | None = File(None),
    project_id: str | None = Form(None),
    document_name: str | None = Form(None),
):
    """
    Populate the uploaded DOCX template with
    dynamic content and optionally insert an
    output screenshot.
    """

    # ----------------------------------------------
    # Validate DOCX
    # ----------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    if not file.filename.lower().endswith(
        ".docx"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files are supported.",
        )

    # ----------------------------------------------
    # Validate content
    # ----------------------------------------------

    if not content.strip():
        raise HTTPException(
            status_code=400,
            detail="No document content was provided.",
        )

    template_path = None
    output_path = None
    image_path = None

    try:

        parsed_project_id = None

        if project_id and project_id.strip():
            try:
                parsed_project_id = int(project_id)
            except ValueError as error:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid project ID.",
                ) from error

        # ==========================================
        # PARSE CONTENT JSON
        # ==========================================

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
                detail=(
                    "Content must be a JSON object."
                ),
            )

        # ==========================================
        # SAVE TEMPLATE
        # ==========================================

        with NamedTemporaryFile(
            delete=False,
            suffix=".docx",
        ) as template_file:

            template_data = await file.read()

            template_file.write(
                template_data
            )

            template_path = Path(
                template_file.name
            )

        # ==========================================
        # SAVE OUTPUT IMAGE
        # ==========================================

        if (
            output_image
            and output_image.filename
        ):

            allowed_extensions = {
                ".png",
                ".jpg",
                ".jpeg",
                ".webp",
            }

            image_suffix = Path(
                output_image.filename
            ).suffix.lower()

            if (
                image_suffix
                not in allowed_extensions
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Output screenshot must be "
                        "PNG, JPG, JPEG, or WEBP."
                    ),
                )

            with NamedTemporaryFile(
                delete=False,
                suffix=image_suffix,
            ) as image_file:

                image_data = (
                    await output_image.read()
                )

                image_file.write(
                    image_data
                )

                image_path = Path(
                    image_file.name
                )

            # --------------------------------------
            # Give DocxPopulator the actual path
            # --------------------------------------

            user_content["output"] = str(
                image_path
            )

        # ==========================================
        # ANALYZE TEMPLATE
        # ==========================================

        template_map = (
            analyze_uploaded_template(
                str(template_path)
            )
        )

        # ==========================================
        # CREATE OUTPUT FILE
        # ==========================================

        with NamedTemporaryFile(
            delete=False,
            suffix=".docx",
        ) as output_file:

            output_path = Path(
                output_file.name
            )

        # ==========================================
        # POPULATE DOCX
        # ==========================================

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

        safe_document_name = (
            document_name.strip()
            if document_name and document_name.strip()
            else f"DocuAI_{Path(file.filename).stem}"
        )

        if not safe_document_name.lower().endswith(".docx"):
            safe_document_name += ".docx"

        stored_file = save_generated_file(
            generated_file,
            safe_document_name,
        )

        ManagedDocumentRepository().create(
            document_name=safe_document_name,
            template_name=Path(file.filename).name,
            file_path=str(stored_file),
            project_id=parsed_project_id,
        )

        # ==========================================
        # RETURN GENERATED DOCX
        # ==========================================

        download_name = (
            f"DocuAI_"
            f"{Path(file.filename).stem}"
            f".docx"
        )

        return FileResponse(
            path=str(stored_file),
            media_type=(
                "application/vnd.openxmlformats-officedocument"
                ".wordprocessingml.document"
            ),
            filename=safe_document_name,
        )

    except HTTPException:
        raise

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate the document: "
                f"{error}"
            ),
        ) from error

    finally:

        # ==========================================
        # CLEAN TEMPORARY FILES
        # ==========================================

        if (
            template_path
            and template_path.exists()
        ):

            try:
                template_path.unlink()

            except OSError:
                pass

        if (
            image_path
            and image_path.exists()
        ):

            try:
                image_path.unlink()

            except OSError:
                pass

        # ------------------------------------------
        # IMPORTANT:
        # Do NOT delete output_path here.
        #
        # FileResponse still needs the generated
        # DOCX after this function returns.
        # ------------------------------------------