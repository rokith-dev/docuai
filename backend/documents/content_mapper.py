class ContentMapper:
    """Map user-provided content to template fields."""

    def map_content(
        self,
        template_map: dict,
        user_content: dict,
    ) -> dict:
        mapped = {}

        for field in template_map.get("fields", []):
            field_name = field["name"]

            if field_name in user_content:
                mapped[field_name] = {
                    "content": user_content[field_name],
                    "content_type": field["content_type"],
                    "location": field["location"],
                }

        for field in template_map.get("table_fields", []):
            field_name = field["name"]

            if field_name in user_content:
                mapped[field_name] = {
                    "content": user_content[field_name],
                    "location": field["location"],
                }

        return {
            "template": template_map.get("template"),
            "content": mapped,
        }