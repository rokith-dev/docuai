from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt

from backend.documents.format_config import DocumentFormatConfig
from backend.documents.font_manager import FontManager


class DocxPopulator:
    """Populate an existing DOCX template with configurable formatting."""

    def __init__(
        self,
        format_config: DocumentFormatConfig | None = None,
    ):
        self.format_config = (
            format_config
            or DocumentFormatConfig()
        )

        self.font_name = FontManager.resolve(
            self.format_config.font_name
        )

    def populate(
        self,
        template_path: str,
        output_path: str,
        template_map: dict,
        content: dict,
    ) -> str:
        template = Path(template_path)
        output = Path(output_path)

        if not template.exists():
            raise FileNotFoundError(
                f"Template file not found: {template_path}"
            )

        if template.suffix.lower() != ".docx":
            raise ValueError(
                "Only .docx templates are supported."
            )

        document = Document(template_path)

        self._populate_paragraph_fields(
            document=document,
            template_map=template_map,
            content=content,
        )

        self._populate_table_fields(
            document=document,
            template_map=template_map,
            content=content,
        )

        output.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        document.save(output_path)

        return str(output)

    # --------------------------------------------------
    # Paragraph fields
    # --------------------------------------------------

    def _populate_paragraph_fields(
        self,
        document: Document,
        template_map: dict,
        content: dict,
    ) -> None:

        for field in template_map.get("fields", []):
            field_name = field["name"]

            if field_name not in content:
                continue

            location = field["location"]

            if location.get("source") != "paragraph":
                continue

            # IMPORTANT:
            # Keep the heading.
            # Replace the instruction/content paragraph.
            paragraph_index = location.get(
                "content_index"
            )

            # Fallback for templates where heading and
            # content are stored in the same paragraph.
            if paragraph_index is None:
                paragraph_index = location.get(
                    "heading_index"
                )

            if paragraph_index is None:
                continue

            if paragraph_index >= len(
                document.paragraphs
            ):
                continue

            paragraph = document.paragraphs[
                paragraph_index
            ]

            value = content[field_name]

            if isinstance(value, dict):
                value = value.get(
                    "content",
                    "",
                )

            value = str(value)

            content_type = field.get(
                "content_type",
                "text",
            )

            # Images
            if content_type == "image":
                self._replace_paragraph_with_image(
                    paragraph,
                    value,
                )

            # Text / code
            else:
                self._replace_paragraph_content(
                    paragraph,
                    value,
                    content_type,
                )

    # --------------------------------------------------
    # Text / Code replacement
    # --------------------------------------------------

    def _replace_paragraph_content(
        self,
        paragraph,
        value: str,
        content_type: str,
    ) -> None:
        """
        Completely remove the template instruction and
        insert the generated/user content.

        Normal text:
            Times New Roman
            12 pt
            Justified

        Code:
            Times New Roman
            10 pt
            Left aligned
            Preserve line breaks
        """

        # Remove ALL existing runs.
        #
        # This completely removes text such as:
        #
        # "Write 1–2 lines..."
        #
        # "Paste the complete Python code..."
        #
        for run in list(paragraph.runs):
            run_element = run._element
            run_element.getparent().remove(
                run_element
            )

        # Add the actual content.
        run = paragraph.add_run(value)

        # --------------------------------------------------
        # Font
        # --------------------------------------------------

        run.font.name = self.font_name

        # --------------------------------------------------
        # Font size
        # --------------------------------------------------

        if content_type == "code":
            run.font.size = Pt(
                self.format_config.code_font_size
            )
        else:
            run.font.size = Pt(
                self.format_config.body_font_size
            )

        # --------------------------------------------------
        # Text style
        # --------------------------------------------------

        run.bold = False
        run.italic = False
        run.underline = False

        # --------------------------------------------------
        # Alignment
        # --------------------------------------------------

        if content_type == "code":
            # NEVER justify source code.
            paragraph.alignment = (
                WD_ALIGN_PARAGRAPH.LEFT
            )
        else:
            # Normal document content.
            paragraph.alignment = (
                self._get_alignment()
            )

    # --------------------------------------------------
    # Image replacement
    # --------------------------------------------------

    def _replace_paragraph_with_image(
        self,
        paragraph,
        image_path: str,
    ) -> None:
        """Remove instruction text and insert an image."""

        image = Path(image_path)

        if not image.exists():
            raise FileNotFoundError(
                f"Image file not found: {image_path}"
            )

        # Remove existing instruction text.
        for run in list(paragraph.runs):
            run_element = run._element
            run_element.getparent().remove(
                run_element
            )

        # Insert image.
        run = paragraph.add_run()

        run.add_picture(
            str(image),
            width=Inches(5.5),
        )

        # Images should not be justified.
        paragraph.alignment = (
            WD_ALIGN_PARAGRAPH.CENTER
        )

    # --------------------------------------------------
    # Table fields
    # --------------------------------------------------

    def _populate_table_fields(
        self,
        document: Document,
        template_map: dict,
        content: dict,
    ) -> None:
        """Populate existing table cells."""

        for field in template_map.get(
            "table_fields",
            [],
        ):

            field_name = field["name"]

            if field_name not in content:
                continue

            location = field["location"]

            table_index = location[
                "table_index"
            ]

            row_index = location[
                "row"
            ]

            column_index = location[
                "column"
            ]

            # Check table.
            if table_index >= len(
                document.tables
            ):
                continue

            table = document.tables[
                table_index
            ]

            # Check row.
            if row_index >= len(
                table.rows
            ):
                continue

            row = table.rows[
                row_index
            ]

            # Check column.
            if column_index >= len(
                row.cells
            ):
                continue

            cell = row.cells[
                column_index
            ]

            value = content[field_name]

            if isinstance(value, dict):
                value = value.get(
                    "content",
                    "",
                )

            self._replace_cell_content(
                cell,
                str(value),
            )

    # --------------------------------------------------
    # Table cell replacement
    # --------------------------------------------------

    def _replace_cell_content(
        self,
        cell,
        value: str,
    ) -> None:
        """Replace text inside an existing table cell."""

        if not cell.paragraphs:
            cell.text = value
            return

        paragraph = cell.paragraphs[0]

        # Remove existing cell text.
        for run in list(paragraph.runs):
            run_element = run._element
            run_element.getparent().remove(
                run_element
            )

        # Add new text.
        run = paragraph.add_run(value)

        run.font.name = self.font_name

        run.font.size = Pt(
            self.format_config.body_font_size
        )

        run.bold = False
        run.italic = False

        # Table text is left aligned by default.
        paragraph.alignment = (
            WD_ALIGN_PARAGRAPH.LEFT
        )

    # --------------------------------------------------
    # Alignment helper
    # --------------------------------------------------

    def _get_alignment(self):
        """Convert configuration alignment to Word alignment."""

        alignment = (
            self.format_config.body_alignment
            .upper()
            .strip()
        )

        if alignment == "CENTER":
            return WD_ALIGN_PARAGRAPH.CENTER

        if alignment == "RIGHT":
            return WD_ALIGN_PARAGRAPH.RIGHT

        if alignment == "LEFT":
            return WD_ALIGN_PARAGRAPH.LEFT

        # Default = Justify
        return WD_ALIGN_PARAGRAPH.JUSTIFY