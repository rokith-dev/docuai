from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor

from backend.documents.format_config import DocumentFormatConfig
from backend.documents.font_manager import FontManager


class DocxPopulator:
    """Populate DOCX templates while preserving template formatting."""

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

    # ==================================================
    # MAIN
    # ==================================================

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
            document,
            template_map,
            content,
        )

        self._populate_table_fields(
            document,
            template_map,
            content,
        )

        output.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        document.save(output_path)

        return str(output)

    # ==================================================
    # PARAGRAPH FIELDS
    # ==================================================

    def _populate_paragraph_fields(
        self,
        document,
        template_map,
        content,
    ):

        for field in template_map.get(
            "fields",
            [],
        ):

            field_name = field["name"]

            if field_name not in content:
                continue

            location = field["location"]

            if location.get("source") != "paragraph":
                continue

            paragraph_index = location.get(
                "content_index"
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

            if not value.strip():
                continue

            content_type = field.get(
                "content_type",
                "text",
            )

            if content_type == "image":

                self._replace_paragraph_with_image(
                    paragraph,
                    value,
                )

            else:

                self._replace_paragraph_content(
                    paragraph,
                    value,
                    content_type,
                )

    # ==================================================
    # PARAGRAPH CONTENT
    # ==================================================

    def _replace_paragraph_content(
        self,
        paragraph,
        value,
        content_type,
    ):

        # Capture formatting from the template.
        style = self._capture_run_style(
            paragraph
        )

        # Code must preserve indentation,
        # newlines and spacing.
        if content_type == "code":
            value = str(value)

        else:
            value = self._clean_text(value)

        # Remove the template instruction.
        self._remove_runs(paragraph)

        # Apply template capitalization only
        # to normal text.
        if content_type != "code":

            value = self._apply_capitalization(
                value,
                style.get("capitalization"),
            )

        run = paragraph.add_run(value)

        # Restore template formatting.
        self._apply_run_style(
            run,
            style,
        )

        if content_type == "code":

            run.font.size = Pt(
                self.format_config.code_font_size
            )

            paragraph.alignment = (
                WD_ALIGN_PARAGRAPH.LEFT
            )

        else:

            if not style.get("size"):
                run.font.size = Pt(
                    self.format_config.body_font_size
                )

            paragraph.alignment = (
                self._get_alignment()
            )

    # ==================================================
    # TABLE FIELDS
    # ==================================================

    def _populate_table_fields(
        self,
        document,
        template_map,
        content,
    ):

        for field in template_map.get(
            "table_fields",
            [],
        ):

            field_name = field["name"]

            # Field not supplied by user.
            # Leave template unchanged.
            if field_name not in content:
                continue

            value = content[field_name]

            if isinstance(value, dict):
                value = value.get(
                    "content",
                    "",
                )

            value = str(value)

            # Optional blank field.
            if not value.strip():
                continue

            location = field.get(
                "value_location"
            )

            if not location:
                continue

            self._set_table_cell_value(
                document,
                location,
                value,
                field_name,
            )

    # ==================================================
    # TABLE CELL VALUE
    # ==================================================

    def _set_table_cell_value(
        self,
        document,
        location,
        value,
        field_name,
    ):

        table_index = location[
            "table_index"
        ]

        row_index = location[
            "row"
        ]

        column_index = location[
            "column"
        ]

        if table_index >= len(
            document.tables
        ):
            return

        table = document.tables[
            table_index
        ]

        if row_index >= len(
            table.rows
        ):
            return

        row = table.rows[
            row_index
        ]

        if column_index >= len(
            row.cells
        ):
            return

        cell = row.cells[
            column_index
        ]

        self._replace_cell_text(
            cell,
            value,
            field_name,
        )

    # ==================================================
    # TABLE CELL FORMATTING
    # ==================================================

    def _replace_cell_text(
        self,
        cell,
        value,
        field_name,
    ):

        if not cell.paragraphs:
            cell.text = self._clean_text(value)
            return

        paragraph = cell.paragraphs[0]

        # Capture existing formatting.
        style = self._capture_run_style(
            paragraph
        )

        # Preserve paragraph alignment.
        original_alignment = (
            paragraph.alignment
        )

        # Clean normal table text.
        value = self._clean_text(value)

        # Apply template capitalization.
        value = self._apply_capitalization(
            value,
            style.get("capitalization"),
        )

        # Remove existing placeholder/value.
        self._remove_runs(paragraph)

        # Insert new value.
        run = paragraph.add_run(value)

        # Restore font, size, color, etc.
        self._apply_run_style(
            run,
            style,
        )

        # Center only title-like fields.
        if self._is_title_field(field_name):

            paragraph.alignment = (
                WD_ALIGN_PARAGRAPH.CENTER
            )

        else:

            paragraph.alignment = (
                original_alignment
            )

    @staticmethod
    def _is_title_field(
        field_name: str,
    ) -> bool:

        normalized_name = str(
            field_name
        ).strip().lower()

        return "title" in normalized_name

    # ==================================================
    # CLEAN NORMAL TEXT
    # ==================================================

    @staticmethod
    def _clean_text(
        value: str,
    ) -> str:
        """
        Clean normal document text.

        This is intentionally NOT used for code,
        because code indentation and line breaks
        must remain unchanged.
        """

        value = str(value)

        # Convert tabs to spaces.
        value = value.replace(
            "\t",
            " ",
        )

        # Normalize repeated spaces.
        value = " ".join(
            value.split()
        )

        return value.strip()

    # ==================================================
    # CAPTURE TEMPLATE STYLE
    # ==================================================

    def _capture_run_style(
        self,
        paragraph,
    ) -> dict:

        if not paragraph.runs:

            return {
                "font_name": None,
                "size": None,
                "bold": None,
                "italic": None,
                "underline": None,
                "color": None,
                "capitalization": "normal",
            }

        source_run = None

        # Prefer a run containing actual text.
        for run in paragraph.runs:

            if run.text.strip():
                source_run = run
                break

        if source_run is None:
            source_run = paragraph.runs[0]

        color = None

        try:

            if (
                source_run.font.color.type
                is not None
                and source_run.font.color.rgb
            ):
                color = str(
                    source_run.font.color.rgb
                )

        except Exception:
            color = None

        return {
            "font_name": source_run.font.name,

            "size": (
                source_run.font.size.pt
                if source_run.font.size
                else None
            ),

            "bold": source_run.bold,

            "italic": source_run.italic,

            "underline": source_run.underline,

            "color": color,

            "capitalization": (
                self._detect_capitalization(
                    source_run.text
                )
            ),
        }

    # ==================================================
    # APPLY TEMPLATE STYLE
    # ==================================================

    def _apply_run_style(
        self,
        run,
        style,
    ):

        # Font name
        if style.get("font_name"):

            run.font.name = style[
                "font_name"
            ]

        else:

            run.font.name = self.font_name

        # Font size
        if style.get("size"):

            run.font.size = Pt(
                style["size"]
            )

        else:

            run.font.size = Pt(
                self.format_config.body_font_size
            )

        # Bold
        run.bold = style.get(
            "bold"
        )

        # Italic
        run.italic = style.get(
            "italic"
        )

        # Underline
        run.underline = style.get(
            "underline"
        )

        # Font color
        color = style.get(
            "color"
        )

        if color:

            try:

                run.font.color.rgb = (
                    RGBColor.from_string(
                        color
                    )
                )

            except ValueError:
                pass

    # ==================================================
    # CAPITALIZATION DETECTION
    # ==================================================

    @staticmethod
    def _detect_capitalization(
        text: str,
    ) -> str:

        text = text.strip()

        if not text:
            return "normal"

        letters = [
            character
            for character in text
            if character.isalpha()
        ]

        if not letters:
            return "normal"

        # Example:
        #
        # TITLE OF THE EXERCISE
        #

        if all(
            character.isupper()
            for character in letters
        ):
            return "uppercase"

        # Example:
        #
        # title of the exercise
        #

        if all(
            character.islower()
            for character in letters
        ):
            return "lowercase"

        # Example:
        #
        # Title Of The Exercise
        #

        words = text.split()

        if words and all(
            word[:1].isupper()
            for word in words
            if word
        ):

            return "titlecase"

        return "normal"

    # ==================================================
    # APPLY CAPITALIZATION
    # ==================================================

    @staticmethod
    def _apply_capitalization(
        value: str,
        capitalization: str | None,
    ) -> str:

        if capitalization == "uppercase":
            return value.upper()

        if capitalization == "lowercase":
            return value.lower()

        if capitalization == "titlecase":
            return value.title()

        return value

    # ==================================================
    # REMOVE RUNS
    # ==================================================

    @staticmethod
    def _remove_runs(
        paragraph,
    ):

        for run in list(
            paragraph.runs
        ):

            run_element = run._element

            run_element.getparent().remove(
                run_element
            )

    # ==================================================
    # IMAGE
    # ==================================================

    def _replace_paragraph_with_image(
        self,
        paragraph,
        image_path,
    ):

        image = Path(image_path)

        if not image.exists():

            raise FileNotFoundError(
                f"Image file not found: {image_path}"
            )

        self._remove_runs(
            paragraph
        )

        run = paragraph.add_run()

        run.add_picture(
            str(image),
            width=Inches(5.5),
        )

        paragraph.alignment = (
            WD_ALIGN_PARAGRAPH.CENTER
        )

    # ==================================================
    # BODY ALIGNMENT
    # ==================================================

    def _get_alignment(self):

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

        return WD_ALIGN_PARAGRAPH.JUSTIFY