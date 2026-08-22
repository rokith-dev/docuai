class TemplateMapBuilder:
    """Build a clean field map from the understood template."""

    def build(self, understanding: dict) -> dict:
        fields = []

        for section in understanding.get("sections", []):
            fields.append(
                {
                    "name": section["type"],
                    "label": section["label"],
                    "content_type": section["content_type"],
                    "location": {
                        "source": section["source"],
                        "index": section["index"],
                    },
                    "instruction": section.get("instruction"),
                }
            )

        table_fields = []

        for table in understanding.get("tables", []):
            for row_index, row in enumerate(table.get("rows", [])):
                for column_index, cell in enumerate(row):
                    if cell["role"] == "empty":
                        continue

                    table_fields.append(
                        {
                            "name": cell["role"],
                            "label": cell["text"],
                            "location": {
                                "table_index": table["index"],
                                "row": row_index,
                                "column": column_index,
                            },
                        }
                    )

        return {
            "template": understanding.get("file_name"),
            "fields": fields,
            "table_fields": table_fields,
        }