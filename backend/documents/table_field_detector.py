import re

from backend.documents.semantic_fields import SemanticFieldDetector


class TableFieldDetector:
    """Detect semantic fields and their value locations in tables."""

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
        semantic_detector=None,
    ):
        self.semantic_detector = (
            semantic_detector
            or SemanticFieldDetector()
        )

    # ==================================================
    # MAIN DETECTOR
    # ==================================================

    def detect(self, table: dict) -> list[dict]:

        rows = table.get("rows", [])

        fields = []

        for row_index, row in enumerate(rows):

            for column_index, cell in enumerate(row):

                text = self._get_cell_text(cell)

                if not text:
                    continue

                # ------------------------------------------
                # Existing exercise number
                # ------------------------------------------

                if self._is_exercise_number(text):

                    fields.append(
                        self._build_existing_value(
                            table,
                            row_index,
                            column_index,
                            "exercise_number",
                            text,
                        )
                    )

                    continue

                # ------------------------------------------
                # IMPORTANT:
                #
                # First check whether the text is a
                # semantic LABEL.
                #
                # This must happen BEFORE placeholder
                # detection.
                #
                # "Title" = label
                # "Title of the Exercise" = placeholder
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
                # Placeholder/value
                # ------------------------------------------

                placeholder_field = (
                    self._detect_placeholder_field(text)
                )

                if placeholder_field:

                    fields.append(
                        self._build_placeholder_field(
                            table,
                            row_index,
                            column_index,
                            text,
                            placeholder_field,
                        )
                    )

        return self._remove_duplicates(fields)

    # ==================================================
    # LABEL → VALUE
    # ==================================================

    def _build_label_field(
        self,
        table,
        rows,
        row_index,
        column_index,
        label,
        field_name,
    ):

        value_location = self._find_value_cell(
            rows,
            row_index,
            column_index,
        )

        if value_location is None:
            return None

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

    # ==================================================
    # PLACEHOLDER
    # ==================================================

    def _build_placeholder_field(
        self,
        table,
        row_index,
        column_index,
        text,
        field_name,
    ):

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
        table,
        row_index,
        column_index,
        field_name,
        text,
    ):

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
        rows,
        row_index,
        column_index,
    ):

        row = rows[row_index]

        # ------------------------------------------
        # Horizontal layout:
        #
        # LABEL | VALUE
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
        # Vertical layout:
        #
        # LABEL
        # VALUE
        # ------------------------------------------

        next_row = row_index + 1

        if next_row < len(rows):

            next_row_data = rows[next_row]

            if column_index < len(
                next_row_data
            ):

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
    # PLACEHOLDER DETECTION
    # ==================================================

    def _detect_placeholder_field(
        self,
        text,
    ):

        normalized = self._normalize(text)

        # Date placeholders
        if normalized in self.DATE_PLACEHOLDERS:
            return "date"

        if re.fullmatch(
            r"d{2}[./-]m{2}[./-]y{4}",
            normalized,
        ):
            return "date"

        # Title placeholders
        if normalized in self.TITLE_PLACEHOLDERS:
            return "title"

        return None

    def _is_placeholder(
        self,
        text,
    ):

        return (
            self._detect_placeholder_field(text)
            is not None
        )

    # ==================================================
    # EXERCISE NUMBER
    # ==================================================

    @classmethod
    def _is_exercise_number(
        cls,
        text,
    ):

        return bool(
            cls.EXERCISE_NUMBER_PATTERN.fullmatch(
                text.strip()
            )
        )

    # ==================================================
    # HELPERS
    # ==================================================

    @staticmethod
    def _get_cell_text(cell):

        if isinstance(cell, dict):

            return str(
                cell.get("text", "")
            ).strip()

        return str(cell).strip()

    @staticmethod
    def _normalize(text):

        text = text.lower().strip()

        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        text = text.rstrip(":")

        return text.strip()

    @staticmethod
    def _remove_duplicates(
        fields,
    ):

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