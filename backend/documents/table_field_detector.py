from __future__ import annotations

from typing import Any


class TableFieldDetector:
    """
    Detect semantic fields inside DOCX tables.

    The detector understands common academic-template fields such as:
        - Exercise Number
        - Title
        - YouTube Link
        - Date

    Important:
    The detector must return the actual VALUE cell location,
    not the label cell location.
    """

    def __init__(self, field_detector=None):
        self.field_detector = field_detector

    # ==========================================================
    # PUBLIC API
    # ==========================================================

    def detect(self, table: dict) -> list[dict]:
        """
        Detect fields from one analyzed table.

        Expected input:

        {
            "source": "table",
            "index": 0,
            "rows": [
                [
                    {"text": "Ex. No. 1", "role": "exercise_number"},
                    {"text": "TITLE OF THE EXERCISE", "role": "title"}
                ],
                [
                    {"text": "YouTube Link", "role": "url"},
                    {"text": "", "role": "empty"}
                ],
                [
                    {"text": "Date of Exercise", "role": "date"},
                    {"text": "DD.MM.YYYY", "role": "date"}
                ]
            ]
        }
        """

        rows = table.get("rows", [])
        table_index = table.get("index", 0)

        if not rows:
            return []

        fields: list[dict] = []

        for row_index, row in enumerate(rows):

            if not isinstance(row, list):
                continue

            for column_index, cell in enumerate(row):

                if not isinstance(cell, dict):
                    continue

                text = self._normalize(
                    cell.get("text", "")
                )

                role = self._normalize(
                    cell.get("role", "")
                )

                if not text and not role:
                    continue

                # --------------------------------------------------
                # Exercise number
                # --------------------------------------------------

                if self._is_exercise_number(
                    text,
                    role,
                ):
                    fields.append(
                        self._build_existing_value_field(
                            name="exercise_number",
                            label=text,
                            table_index=table_index,
                            row=row_index,
                            column=column_index,
                            current_value=text,
                        )
                    )

                    continue

                # --------------------------------------------------
                # Title
                # --------------------------------------------------

                if self._is_title(
                    text,
                    role,
                ):

                    value_row, value_column = (
                        self._find_title_value_location(
                            rows=rows,
                            label_row=row_index,
                            label_column=column_index,
                        )
                    )

                    fields.append(
                        self._build_field(
                            name="title",
                            label=text,
                            kind="label_value",
                            table_index=table_index,
                            label_row=row_index,
                            label_column=column_index,
                            value_row=value_row,
                            value_column=value_column,
                            current_value=self._get_cell_text(
                                rows,
                                value_row,
                                value_column,
                            ),
                        )
                    )

                    continue

                # --------------------------------------------------
                # YouTube link
                # --------------------------------------------------

                if self._is_youtube(
                    text,
                    role,
                ):

                    value_row, value_column = (
                        self._find_adjacent_value_location(
                            rows=rows,
                            label_row=row_index,
                            label_column=column_index,
                        )
                    )

                    fields.append(
                        self._build_field(
                            name="youtube_link",
                            label=text,
                            kind="label_value",
                            table_index=table_index,
                            label_row=row_index,
                            label_column=column_index,
                            value_row=value_row,
                            value_column=value_column,
                            current_value=self._get_cell_text(
                                rows,
                                value_row,
                                value_column,
                            ),
                        )
                    )

                    continue

                # --------------------------------------------------
                # Date
                # --------------------------------------------------

                if self._is_date(
                    text,
                    role,
                ):

                    # "Date of Exercise" is the label.
                    # "DD.MM.YYYY" is the value cell.
                    if self._is_date_label(text):

                        value_row, value_column = (
                            self._find_adjacent_value_location(
                                rows=rows,
                                label_row=row_index,
                                label_column=column_index,
                            )
                        )

                        fields.append(
                            self._build_field(
                                name="date",
                                label=text,
                                kind="label_value",
                                table_index=table_index,
                                label_row=row_index,
                                label_column=column_index,
                                value_row=value_row,
                                value_column=value_column,
                                current_value=self._get_cell_text(
                                    rows,
                                    value_row,
                                    value_column,
                                ),
                                placeholder=self._is_date_placeholder(
                                    self._get_cell_text(
                                        rows,
                                        value_row,
                                        value_column,
                                    )
                                ),
                            )
                        )

                        continue

                    # "DD.MM.YYYY" directly identifies the date
                    # placeholder.
                    if self._is_date_placeholder(text):

                        # Avoid creating duplicate date fields
                        # when the label was already detected.
                        if self._date_field_exists(fields):
                            continue

                        fields.append(
                            self._build_field(
                                name="date",
                                label=text,
                                kind="placeholder",
                                table_index=table_index,
                                label_row=row_index,
                                label_column=column_index,
                                value_row=row_index,
                                value_column=column_index,
                                current_value=text,
                                placeholder=True,
                            )
                        )

        return self._remove_duplicate_fields(fields)

    # ==========================================================
    # FIELD BUILDERS
    # ==========================================================

    @staticmethod
    def _build_field(
        name: str,
        label: str,
        kind: str,
        table_index: int,
        label_row: int,
        label_column: int,
        value_row: int,
        value_column: int,
        current_value: str = "",
        placeholder: bool = False,
    ) -> dict:

        return {
            "name": name,
            "label": label,
            "standard": True,
            "kind": kind,
            "label_location": {
                "table_index": table_index,
                "row": label_row,
                "column": label_column,
            },
            "value_location": {
                "table_index": table_index,
                "row": value_row,
                "column": value_column,
            },
            "current_value": current_value,
            "placeholder": placeholder,
        }

    @staticmethod
    def _build_existing_value_field(
        name: str,
        label: str,
        table_index: int,
        row: int,
        column: int,
        current_value: str,
    ) -> dict:

        return {
            "name": name,
            "label": label,
            "standard": True,
            "kind": "existing_value",
            "label_location": {
                "table_index": table_index,
                "row": row,
                "column": column,
            },
            "value_location": {
                "table_index": table_index,
                "row": row,
                "column": column,
            },
            "current_value": current_value,
            "placeholder": False,
        }

    # ==========================================================
    # LOCATION DETECTION
    # ==========================================================

    @staticmethod
    def _find_title_value_location(
        rows: list,
        label_row: int,
        label_column: int,
    ) -> tuple[int, int]:
        """
        Find the cell where the title value belongs.

        For the user's template:

            Row 0:
                Ex. No. 1 | TITLE OF THE EXERCISE

        The actual title belongs in:

            row 0, column 1

        We intentionally keep it in the SAME CELL because
        the template's title cell is itself the value cell.
        """

        return (
            label_row,
            label_column,
        )

    @staticmethod
    def _find_adjacent_value_location(
        rows: list,
        label_row: int,
        label_column: int,
    ) -> tuple[int, int]:
        """
        Find the value cell next to a label.

        Example:

            YouTube Link | empty

        becomes:

            value_location = row 1, column 1
        """

        # First try the cell immediately to the right.
        if (
            label_row < len(rows)
            and label_column + 1 < len(
                rows[label_row]
            )
        ):
            return (
                label_row,
                label_column + 1,
            )

        # If there is no right-side cell,
        # look for an empty cell in the same row.
        if label_row < len(rows):

            for column_index, cell in enumerate(
                rows[label_row]
            ):

                if column_index == label_column:
                    continue

                if not self._normalize(
                    cell.get("text", "")
                ):
                    return (
                        label_row,
                        column_index,
                    )

        # Last fallback: keep the label cell.
        return (
            label_row,
            label_column,
        )

    # ==========================================================
    # SEMANTIC DETECTION
    # ==========================================================

    @staticmethod
    def _is_exercise_number(
        text: str,
        role: str,
    ) -> bool:

        if role in {
            "exercise_number",
            "exercise number",
            "ex_no",
        }:
            return True

        normalized = text.lower()

        return (
            normalized.startswith("ex. no.")
            or normalized.startswith("ex no.")
            or normalized.startswith("exercise no.")
            or normalized.startswith("exercise number")
        )

    @staticmethod
    def _is_title(
        text: str,
        role: str,
    ) -> bool:

        if role == "title":
            return True

        normalized = text.lower()

        return (
            "title of the exercise"
            in normalized
            or normalized == "title"
        )

    @staticmethod
    def _is_youtube(
        text: str,
        role: str,
    ) -> bool:

        if role in {
            "url",
            "youtube",
            "youtube_link",
            "youtube link",
        }:
            return True

        normalized = text.lower()

        return (
            "youtube" in normalized
            or "video link" in normalized
        )

    @staticmethod
    def _is_date(
        text: str,
        role: str,
    ) -> bool:

        if role == "date":
            return True

        normalized = text.lower()

        return (
            "date" in normalized
            or normalized == "dd.mm.yyyy"
        )

    @staticmethod
    def _is_date_label(
        text: str,
    ) -> bool:

        normalized = text.lower().strip()

        return (
            normalized.startswith("date")
            and normalized != "dd.mm.yyyy"
        )

    @staticmethod
    def _is_date_placeholder(
        text: str,
    ) -> bool:

        normalized = text.lower().strip()

        return normalized in {
            "dd.mm.yyyy",
            "dd/mm/yyyy",
            "dd-mm-yyyy",
            "date",
        }

    # ==========================================================
    # HELPERS
    # ==========================================================

    @staticmethod
    def _get_cell_text(
        rows: list,
        row: int,
        column: int,
    ) -> str:

        if row < 0 or row >= len(rows):
            return ""

        current_row = rows[row]

        if column < 0 or column >= len(
            current_row
        ):
            return ""

        cell = current_row[column]

        if not isinstance(cell, dict):
            return ""

        return str(
            cell.get("text", "")
        ).strip()

    @staticmethod
    def _normalize(
        value: Any,
    ) -> str:

        if value is None:
            return ""

        return " ".join(
            str(value).strip().split()
        )

    @staticmethod
    def _date_field_exists(
        fields: list[dict],
    ) -> bool:

        return any(
            field.get("name") == "date"
            for field in fields
        )

    @staticmethod
    def _remove_duplicate_fields(
        fields: list[dict],
    ) -> list[dict]:

        unique: list[dict] = []
        seen: set[tuple] = set()

        for field in fields:

            key = (
                field.get("name"),
                (
                    field.get(
                        "value_location",
                        {},
                    ).get("table_index")
                ),
                (
                    field.get(
                        "value_location",
                        {},
                    ).get("row")
                ),
                (
                    field.get(
                        "value_location",
                        {},
                    ).get("column")
                ),
            )

            if key in seen:
                continue

            seen.add(key)
            unique.append(field)

        return unique