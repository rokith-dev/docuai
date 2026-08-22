from docx import Document


class FormatAnalyzer:
    """Analyze formatting information from a DOCX template."""

    DEFAULT_FONT = "Times New Roman"
    DEFAULT_BODY_SIZE = 12
    DEFAULT_HEADING_SIZE = 14
    DEFAULT_SUBHEADING_SIZE = 13
    DEFAULT_TITLE_SIZE = 16
    DEFAULT_CODE_SIZE = 10

    def analyze(self, file_path: str) -> dict:
        document = Document(file_path)

        paragraphs = []

        for index, paragraph in enumerate(document.paragraphs):
            text = paragraph.text.strip()

            if not text:
                continue

            paragraphs.append(
                {
                    "index": index,
                    "text": text,
                    "style": paragraph.style.name,
                    "alignment": self._get_alignment(paragraph),
                    "font": self._get_font(paragraph),
                }
            )

        return {
            "file_name": file_path,
            "defaults": {
                "font_name": self.DEFAULT_FONT,
                "body_size": self.DEFAULT_BODY_SIZE,
                "heading_size": self.DEFAULT_HEADING_SIZE,
                "subheading_size": self.DEFAULT_SUBHEADING_SIZE,
                "title_size": self.DEFAULT_TITLE_SIZE,
                "code_size": self.DEFAULT_CODE_SIZE,
                "body_alignment": "JUSTIFY",
            },
            "paragraphs": paragraphs,
        }

    def _get_font(self, paragraph) -> dict:
        fonts = []

        for run in paragraph.runs:
            if not run.text.strip():
                continue

            font_name = run.font.name

            font_size = None

            if run.font.size:
                font_size = run.font.size.pt

            fonts.append(
                {
                    "name": font_name,
                    "size": font_size,
                    "bold": run.bold,
                    "italic": run.italic,
                    "underline": run.underline,
                }
            )

        if not fonts:
            return {
                "name": self.DEFAULT_FONT,
                "size": self.DEFAULT_BODY_SIZE,
                "bold": False,
                "italic": False,
                "underline": False,
            }

        return fonts[0]

    @staticmethod
    def _get_alignment(paragraph) -> str:
        if paragraph.alignment is None:
            return "DEFAULT"

        return str(paragraph.alignment).split(".")[-1].upper()