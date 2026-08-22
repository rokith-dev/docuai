import json

from backend.ai.gemini import GeminiService


class ContentGenerator:
    """Generate missing template content using Gemini."""

    def __init__(self, gemini: GeminiService | None = None):
        self.gemini = gemini or GeminiService()

    def generate(
        self,
        template_map: dict,
        user_content: dict,
    ) -> dict:
        fields = template_map.get("fields", [])

        missing_fields = []

        for field in fields:
            field_name = field["name"]

            if field_name not in user_content:
                if field["content_type"] == "text":
                    missing_fields.append(
                        {
                            "name": field_name,
                            "label": field["label"],
                            "instruction": field.get("instruction"),
                        }
                    )

        if not missing_fields:
            return {}

        prompt = self._build_prompt(
            template_map,
            user_content,
            missing_fields,
        )

        response = self.gemini.generate(prompt)

        return self._parse_response(response, missing_fields)

    def _build_prompt(
        self,
        template_map: dict,
        user_content: dict,
        missing_fields: list[dict],
    ) -> str:
        fields_text = "\n".join(
            [
                (
                    f"- {field['name']}: "
                    f"{field['instruction'] or 'Generate appropriate content.'}"
                )
                for field in missing_fields
            ]
        )

        user_text = json.dumps(
            user_content,
            ensure_ascii=False,
            indent=2,
        )

        return f"""
You are the content-generation engine for DocuAI.

DocuAI fills existing document templates.
You must generate ONLY the missing content.
Do NOT create a document.
Do NOT add Markdown.
Do NOT add explanations outside the JSON.

User-provided information:
{user_text}

Missing template fields:
{fields_text}

Return ONLY valid JSON.

The JSON keys must exactly match these field names:
{json.dumps([field["name"] for field in missing_fields])}

Generate professional, accurate content suitable for the requested document.

Rules:
- Keep the content appropriate for the field instruction.
- Do not invent user-specific facts.
- Keep the Aim concise.
- Keep the Description within the template's requested length.
- Keep the Result concise.
- Return plain text values.
"""

    def _parse_response(
        self,
        response: str,
        missing_fields: list[dict],
    ) -> dict:
        cleaned = response.strip()

        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1)
            cleaned = cleaned.replace("```", "")
            cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as error:
            raise RuntimeError(
                "Gemini returned invalid JSON."
            ) from error

        if not isinstance(data, dict):
            raise RuntimeError(
                "Gemini response must be a JSON object."
            )

        expected_fields = {
            field["name"]
            for field in missing_fields
        }

        unexpected_fields = set(data) - expected_fields

        if unexpected_fields:
            raise RuntimeError(
                "Gemini returned unexpected fields: "
                + ", ".join(sorted(unexpected_fields))
            )

        missing_response_fields = expected_fields - set(data)

        if missing_response_fields:
            raise RuntimeError(
                "Gemini did not return fields: "
                + ", ".join(sorted(missing_response_fields))
            )

        for field_name, value in data.items():
            if not isinstance(value, str):
                raise RuntimeError(
                    f"Generated field '{field_name}' must be text."
                )

        return data