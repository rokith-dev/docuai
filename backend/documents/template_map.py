from backend.documents.semantic_fields import SemanticFieldDetector
from backend.documents.table_field_detector import TableFieldDetector


class TemplateMapBuilder:
    """Build a semantic map of the document template."""

    def __init__(
        self,
        field_detector: SemanticFieldDetector | None = None,
        table_field_detector: TableFieldDetector | None = None,
    ):
        self.field_detector = (
            field_detector
            or SemanticFieldDetector()
        )

        self.table_field_detector = (
            table_field_detector
            or TableFieldDetector(
                self.field_detector
            )
        )

    def build(self, understanding: dict) -> dict:

        fields = []

        # ------------------------------------------
        # Paragraph sections
        # ------------------------------------------

        for section in understanding.get(
            "sections",
            [],
        ):

            detected = self.field_detector.detect_custom(
                section["label"]
            )

            fields.append(
                {
                    "name": detected["name"],
                    "label": section["label"],
                    "standard": detected["standard"],
                    "content_type": section[
                        "content_type"
                    ],
                    "location": {
                        "source": section[
                            "source"
                        ],
                        "heading_index": section[
                            "index"
                        ],
                        "content_index": section.get(
                            "instruction_index"
                        ),
                    },
                    "instruction": section.get(
                        "instruction"
                    ),
                }
            )

        # ------------------------------------------
        # Table fields
        # ------------------------------------------

        table_fields = []

        for table in understanding.get(
            "tables",
            [],
        ):

            detected_fields = (
                self.table_field_detector.detect(
                    table
                )
            )

            table_fields.extend(
                detected_fields
            )

        # ------------------------------------------
        # Final template map
        # ------------------------------------------

        return {
            "template": understanding.get(
                "file_name"
            ),
            "fields": fields,
            "table_fields": table_fields,
        }