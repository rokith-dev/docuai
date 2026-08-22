import re

from backend.documents.semantic_fields import SemanticFieldDetector


class TableFieldDetector:
    """
    Detect semantic fields inside DOCX tables.

    The detector distinguishes between:

    1. Labels
       Example: "YouTube Link"

    2. Existing values
       Example: "URK24AI1041"

    3. Placeholders
       Example: "DD.MM.YYYY"

    4. Empty value cells
       Example: ["YouTube Link", ""]
    """

    DATE_PLACEHOLDERS = {
        "dd.mm.yyyy",
        "dd/mm/yyyy",
        "dd-mm-yyyy",
        "yyyy-mm-dd",
        "enter date",
        "date here",
        "insert date",
    }

    TITLE_PLACEHOLDERS = {
        "title",
        "title of the exercise",
        "exercise title",
        "experiment title",
        "experiment name",
        "exercise name",
        "title here",
        "enter title",
        "insert title",
    }

    EXERCISE_NUMBER_PATTERN = re.compile(
        r"^ex\.?\s*no\.?\s*\d+$",
        re.IGNORECASE,
    )

    def __init__(
        self,
        semantic_detector: SemanticFieldDetector | None = None,
    ):
        self.semantic_detector = (
            semantic_detector
            or SemanticFieldDetector()
        )

    # ==================================================
    # MAIN DETECTOR
    # ==================================================

    def detect(self, table: dict) -> list[dict]:
        """
        Detect fields from a single analyzed table.
        """

        rows = table.get("rows", [])

        fields = []

        for row_index, row in enumerate(rows):

            for column_index, cell in enumerate(row):

                text = self._get_cell_text(cell)

                if not text:
                    continue

                # ------------------------------------------
                # Case 1:
                # This cell is a known placeholder/value.
                # ------------------------------------------

                placeholder_field = (
                    self._detect_placeholder_field(text)
                )

                if placeholder_field:
                    field = self._build_placeholder_field(
                        table=table,
                        row_index=row_index,
                        column_index=column_index,
                        text=text,
                        field_name=placeholder_field,
                    )

                    if field:
                        fields.append(field)

                    continue

                # ------------------------------------------
                # Case 2:
                # Existing exercise number.
                #
                # Example:
                # "Ex. No. 1"
                # ------------------------------------------

                if self._is_exercise_number(text):
                    fields.append(
                        self._build_existing_value(
                            table=table,
                            row_index=row_index,
                            column_index=column_index,
                            field_name="exercise_number",
                            text=text,
                        )
                    )

                    continue

                # ------------------------------------------
                # Case 3:
                # This is a semantic label.
                # ------------------------------------------

                semantic_field = (
                    self.semantic_detector.detect(text)
                )

                if semantic_field:

                    field = self._build_label_field(
                        table=table,
                        rows=rows,
                        row_index=row_index,
                        column_index=column_index,
                        label=text,
                        field_name=semantic_field,
                    )

                    if field:
                        fields.append(field)

                    continue

                # ------------------------------------------
                # Case 4:
                # Unknown text.
                #
                # Don't automatically create a field.
                # It could simply be normal table text.
                # ------------------------------------------

        return self._remove_duplicates(fields)

    # ==================================================
    # PLACEHOLDER DETECTION
    # ==================================================

    def _detect_placeholder_field(
        self,
        text: str,
    ) -> str | None:

        normalized = self._normalize(text)

        # Date placeholder
        if normalized in self.DATE_PLACEHOLDERS:
            return "date"

        # Generic date format
        if re.fullmatch(
            r"d{2}[./-]m{2}[./-]y{4}",
            normalized,
        ):
            return "date"

        # Title placeholder
        if normalized in self.TITLE_PLACEHOLDERS:
            return "title"

        return None

    # ==================================================
    # LABEL FIELD
    # ==================================================

    def _build_label_field(
        self,
        table: dict,
        rows: list,
        row_index: int,
        column_index: int,
        label: str,
        field_name: str,
    ) -> dict | None:

        value_location = self._find_value_cell(
            rows=rows,
            row_index=row_index,
            column_index=column_index,
        )

        # ------------------------------------------
        # Example:
        #
        # YouTube Link | ""
        #
        # We have a label and an empty value cell.
        # ------------------------------------------

        if value_location:

            return {
                "name": field_name,
                "label": label,
                "standard": True,
                "kind": "label_value",
                "label_location": {
                    "table_index": table["index"],
                    "row": row_index,
                    "column": column_index,
                },
                "value_location": {
                    "table_index": table["index"],
                    "row": value_location["row"],
                    "column": value_location["column"],
                },
                "current_value": value_location["value"],
                "placeholder": self._is_placeholder(
                    value_location["value"]
                ),
            }

        # ------------------------------------------
        # Some templates may use a single cell:
        #
        # "TITLE: ______"
        #
        # We don't automatically overwrite it yet.
        # ------------------------------------------

        return None

    # ==================================================
    # PLACEHOLDER FIELD
    # ==================================================

    def _build_placeholder_field(
        self,
        table: dict,
        row_index: int,
        column_index: int,
        text: str,
        field_name: str,
    ) -> dict:

        return {
            "name": field_name,
            "label": text,
            "standard": True,
            "kind": "placeholder",
            "label_location": {
                "table_index": table["index"],
                "row": row_index,
                "column": column_index,
            },
            "value_location": {
                "table_index": table["index"],
                "row": row_index,
                "column": column_index,
            },
            "current_value": text,
            "placeholder": True,
        }

    # ==================================================
    # EXISTING VALUE
    # ==================================================

    def _build_existing_value(
        self,
        table: dict,
        row_index: int,
        column_index: int,
        field_name: str,
        text: str,
    ) -> dict:

        return {
            "name": field_name,
            "label": "Ex. No.",
            "standard": True,
            "kind": "existing_value",
            "label_location": {
                "table_index": table["index"],
                "row": row_index,
                "column": column_index,
            },
            "value_location": {
                "table_index": table["index"],
                "row": row_index,
                "column": column_index,
            },
            "current_value": text,
            "placeholder": False,
        }

    # ==================================================
    # FIND VALUE CELL
    # ==================================================

    def _find_value_cell(
        self,
        rows: list,
        row_index: int,
        column_index: int,
    ) -> dict | None:

        row = rows[row_index]

        # ------------------------------------------
        # Pattern 1:
        #
        # Label | Value
        #
        # Example:
        #
        # YouTube Link | ""
        # Date          | DD.MM.YYYY
        # ------------------------------------------

        next_column = column_index + 1

        if next_column < len(row):

            value = self._get_cell_text(
                row[next_column]
            )

            return {
                "row": row_index,
                "column": next_column,
                "value": value,
            }

        # ------------------------------------------
        # Pattern 2:
        #
        # Label
        # Value
        #
        # Example:
        #
        # Date
        # DD.MM.YYYY
        # ------------------------------------------

        next_row = row_index + 1

        if next_row < len(rows):

            next_row_data = rows[next_row]

            if column_index < len(next_row_data):

                value = self._get_cell_text(
                    next_row_data[column_index]
                )

                return {
                    "row": next_row,
                    "column": column_index,
                    "value": value,
                }

        return None

    # ==================================================
    # HELPERS
    # ==================================================

    @staticmethod
    def _get_cell_text(cell) -> str:

        if isinstance(cell, dict):
            return str(
                cell.get("text", "")
            ).strip()

        return str(cell).strip()

    @staticmethod
    def _normalize(text: str) -> str:

        text = text.lower().strip()

        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        text = text.rstrip(":")

        return text.strip()

    def _is_placeholder(
        self,
        text: str,
    ) -> bool:

        return (
            self._detect_placeholder_field(text)
            is not None
        )

    @classmethod
    def _is_exercise_number(
        cls,
        text: str,
    ) -> bool:

        return bool(
            cls.EXERCISE_NUMBER_PATTERN.fullmatch(
                text.strip()
            )
        )

    @staticmethod
    def _remove_duplicates(
        fields: list[dict],
    ) -> list[dict]:

        unique = {}

        for field in fields:

            location = field.get(
                "value_location",
                {},
            )

            key = (
                field["name"],
                location.get(
                    "table_index"
                ),
                location.get("row"),
                location.get("column"),
            )

            unique[key] = field

        return list(unique.values())