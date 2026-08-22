class FontManager:
    """Validate and normalize user-selected document fonts."""

    DEFAULT_FONT = "Times New Roman"

    @classmethod
    def resolve(cls, font_name: str | None) -> str:
        if not font_name:
            return cls.DEFAULT_FONT

        font_name = font_name.strip()

        if not font_name:
            return cls.DEFAULT_FONT

        return font_name