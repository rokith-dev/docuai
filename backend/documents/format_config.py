class DocumentFormatConfig:
    """Formatting configuration for generated DOCX documents."""

    def __init__(
        self,
        font_name: str = "Times New Roman",
        body_font_size: int = 12,
        heading_font_size: int = 14,
        subheading_font_size: int = 13,
        title_font_size: int = 16,
        code_font_size: int = 12,
        body_alignment: str = "JUSTIFY",
    ):
        self.font_name = font_name
        self.body_font_size = body_font_size
        self.heading_font_size = heading_font_size
        self.subheading_font_size = subheading_font_size
        self.title_font_size = title_font_size
        self.code_font_size = code_font_size
        self.body_alignment = body_alignment

    def to_dict(self) -> dict:
        return {
            "font_name": self.font_name,
            "body_font_size": self.body_font_size,
            "heading_font_size": self.heading_font_size,
            "subheading_font_size": self.subheading_font_size,
            "title_font_size": self.title_font_size,
            "code_font_size": self.code_font_size,
            "body_alignment": self.body_alignment,
        }