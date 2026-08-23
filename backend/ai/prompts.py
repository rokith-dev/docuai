import json


def build_content_prompt(
    topic: str,
    fields: list[dict],
    user_instructions: str | None = None,
) -> str:
    requested_fields = []

    for field in fields:
        content_type = field.get("content_type", "text")

        if content_type in {"image", "date", "url"}:
            continue

        requested_fields.append(
            {
                "name": str(field.get("name", "")),
                "label": str(field.get("label", "")),
                "content_type": content_type,
                "instruction": field.get("instruction")
                or "Generate appropriate content for this field.",
            }
        )

    return f"""You are generating academic document content for DocuAI.

Generate content for the topic: {topic}

Requested template fields:
{json.dumps(requested_fields, ensure_ascii=False, indent=2)}

Additional user instructions:
{user_instructions or "None"}

Rules:
- Follow each field's label, content type, and template instruction.
- Generate only the requested fields. Do not invent fields.
- Text values must be concise and suitable for an academic document.
- Code fields must contain appropriate code only, with preserved formatting.
- Return only one valid JSON object with the exact requested field names.
- Do not wrap the JSON in Markdown fences or add explanations.
"""