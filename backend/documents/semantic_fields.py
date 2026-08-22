import re


class SemanticFieldDetector:
    """Detect standard document fields from template labels."""

    FIELD_ALIASES = {
        "registration_number": [
            "registration number",
            "register number",
            "reg no",
            "reg. no",
            "reg no.",
            "registration no",
            "registration no.",
            "student id",
            "student number",
            "roll number",
            "roll no",
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
            "video link",
            "video url",
        ],
        "date": [
            "date",
            "date of exercise",
            "exercise date",
            "submission date",
        ],
        "aim": [
            "aim",
            "objective",
            "purpose",
        ],
        "description": [
            "description",
            "introduction",
            "overview",
            "concept",
        ],
        "program": [
            "program",
            "code",
            "source code",
            "implementation",
            "python code",
        ],
        "output": [
            "output",
            "output screenshot",
            "screenshot",
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
        text = re.sub(r"\s+", " ", text)

        text = text.replace(":", "")
        text = text.strip()

        return text

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