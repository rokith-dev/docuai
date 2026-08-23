import re


class SemanticFieldDetector:
    """Detect standard semantic fields from template labels."""

    FIELD_ALIASES = {
        "registration_number": [
            "registration number",
            "registration no",
            "registration no.",
            "registration #",
            "register number",
            "register no",
            "register no.",
            "reg number",
            "reg no",
            "reg no.",
            "reg. no",
            "reg #",
            "student id",
            "student number",
            "student no",
            "student no.",
            "roll number",
            "roll no",
            "roll no.",
            "roll #",
        ],

        "title": [
            "title",
            "title of the exercise",
            "exercise title",
            "experiment title",
            "experiment name",
            "exercise name",
        ],

        "youtube_link": [
            "youtube link",
            "youtube",
            "youtube url",
            "video link",
            "video url",
        ],

        "date": [
            "date",
            "date of exercise",
            "exercise date",
            "date of experiment",
            "experiment date",
            "submission date",
        ],

        "aim": [
            "aim",
            "objective",
            "objective of the experiment",
            "purpose",
        ],

        "description": [
            "description",
            "introduction",
            "overview",
            "concept",
            "theory",
        ],

        "program": [
            "program",
            "code",
            "source code",
            "program code",
            "implementation",
            "python code",
        ],

        "output": [
            "output",
            "output screenshot",
            "screenshot",
            "output image",
            "result screenshot",
        ],

        "result": [
            "result",
            "conclusion",
            "summary",
        ],
    }

    def detect(self, label: str) -> str | None:
        normalized = self._normalize(label)

        for field_name, aliases in self.FIELD_ALIASES.items():
            for alias in aliases:
                if normalized == alias:
                    return field_name

        return None

    def detect_custom(self, label: str) -> dict:
        field_name = self.detect(label)

        if field_name:
            return {
                "name": field_name,
                "label": label,
                "standard": True,
            }

        return {
            "name": self._create_field_name(label),
            "label": label,
            "standard": False,
        }

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.lower().strip()

        # Normalize whitespace.
        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        # Remove common punctuation.
        text = text.rstrip(":")

        return text.strip()

    @staticmethod
    def _create_field_name(label: str) -> str:
        value = label.lower().strip()

        value = re.sub(
            r"[^a-z0-9]+",
            "_",
            value,
        )

        value = value.strip("_")

        return value or "custom_field"