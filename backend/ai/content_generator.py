import json

from backend.ai.gemini import GeminiService
from backend.ai.prompts import build_content_prompt


class AIContentGenerator:
    """Generate and validate content for fields from a template map."""

    def __init__(self, gemini: GeminiService | None = None):
        self.gemini = gemini or GeminiService()

    def generate(
        self,
        topic: str,
        fields: list[dict],
        user_instructions: str | None = None,
    ) -> dict[str, str]:
        if not topic.strip():
            raise ValueError("Topic cannot be empty.")

        requested_fields = [
            field
            for field in fields
            if field.get("content_type", "text")
            not in {"image", "date", "url"}
        ]

        if not requested_fields:
            return {}

        expected_names = {
            str(field.get("name", ""))
            for field in requested_fields
            if field.get("name")
        }

        if not expected_names:
            raise ValueError("No valid content fields were provided.")

        response = self.gemini.generate(
            build_content_prompt(
                topic,
                requested_fields,
                user_instructions,
            )
        )

        data = self._parse_response(response, expected_names)
        return {name: data[name] for name in expected_names}

    @staticmethod
    def _parse_response(
        response: str,
        expected_names: set[str],
    ) -> dict[str, str]:
        cleaned = response.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            cleaned = "\n".join(
                line for line in lines if not line.strip().startswith("```")
            ).strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as error:
            raise RuntimeError("AI returned invalid JSON.") from error

        if not isinstance(data, dict):
            raise RuntimeError("AI response must be a JSON object.")

        unexpected = set(data) - expected_names
        if unexpected:
            raise RuntimeError(
                "AI returned unexpected fields: "
                + ", ".join(sorted(unexpected))
            )

        missing = expected_names - set(data)
        if missing:
            raise RuntimeError(
                "AI did not return fields: " + ", ".join(sorted(missing))
            )

        if any(not isinstance(value, str) for value in data.values()):
            raise RuntimeError("Generated field values must be text.")

        return data