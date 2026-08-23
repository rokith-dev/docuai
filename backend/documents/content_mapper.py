class ContentMapper:
    """
    Map user-provided content to the fields detected
    in the DOCX template.
    """

    def map_content(
        self,
        template_map: dict,
        user_content: dict,
    ) -> dict:

        mapped = {}

        # ==================================================
        # PARAGRAPH FIELDS
        # ==================================================

        for field in template_map.get(
            "fields",
            [],
        ):

            field_name = field["name"]

            if field_name not in user_content:
                continue

            mapped[field_name] = {
                "content": user_content[field_name],
                "content_type": field.get(
                    "content_type",
                    "text",
                ),
                "location": field.get(
                    "location"
                ),
            }

        # ==================================================
        # TABLE FIELDS
        # ==================================================

        for field in template_map.get(
            "table_fields",
            [],
        ):

            field_name = field["name"]

            if field_name not in user_content:
                continue

            mapped[field_name] = {
                "content": user_content[field_name],
                "content_type": "text",
                "location": field.get(
                    "value_location"
                ),
                "label_location": field.get(
                    "label_location"
                ),
                "kind": field.get(
                    "kind"
                ),
            }

        return {
            "template": template_map.get(
                "template"
            ),
            "content": mapped,
        }