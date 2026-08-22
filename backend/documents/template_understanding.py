import re


class TemplateUnderstanding:
    """Convert extracted DOCX structure into a generic template map."""

    SECTION_PATTERNS = {
        "title": [
            r"^title$",
            r"^document title$",
            r"^name$",
        ],
        "aim": [
            r"^aim$",
            r"^objective$",
            r"^purpose$",
        ],
        "description": [
            r"^description$",
            r"^introduction$",
            r"^overview$",
        ],
        "program": [
            r"^program$",
            r"^code$",
            r"^source code$",
        ],
        "output": [
            r"^output$",
            r"^output screenshot$",
            r"^result screenshot$",
            r"^screenshots?$",
        ],
        "result": [
            r"^result$",
            r"^conclusion$",
            r"^summary$",
        ],
        "date": [
            r"^date$",
            r"^date of exercise$",
            r"^submission date$",
        ],
        "link": [
            r"^youtube link$",
            r"^video link$",
            r"^url$",
            r"^link$",
        ],
    }

    def understand(self, analysis: dict) -> dict:
        paragraphs = analysis.get("paragraphs", [])

        sections = []

        for position, paragraph in enumerate(paragraphs):
            text = paragraph["text"].strip()

            section_type = self._detect_section_type(text)

            if not section_type:
                continue

            instruction = self._find_instruction(
                paragraphs,
                position,
            )

            instruction_index = self._find_instruction_index(
                paragraphs,
                position,
            )

            sections.append(
                {
                    "type": section_type,
                    "source": "paragraph",
                    "index": paragraph["index"],
                    "label": text,
                    "instruction": instruction,
                    "instruction_index": instruction_index,
                    "content_type": self._detect_content_type(
                        section_type,
                        instruction,
                    ),
                }
            )

        return {
            "file_name": analysis.get("file_name"),
            "sections": sections,
            "tables": self._analyze_tables(
                analysis.get("tables", [])
            ),
        }

    def _find_instruction(
        self,
        paragraphs: list[dict],
        position: int,
    ) -> str | None:
        next_position = position + 1

        if next_position >= len(paragraphs):
            return None

        next_text = paragraphs[next_position]["text"].strip()

        if not next_text:
            return None

        if self._detect_section_type(next_text):
            return None

        return next_text

    def _find_instruction_index(
        self,
        paragraphs: list[dict],
        position: int,
    ) -> int | None:
        next_position = position + 1

        if next_position >= len(paragraphs):
            return None

        next_text = paragraphs[next_position]["text"].strip()

        if not next_text:
            return None

        if self._detect_section_type(next_text):
            return None

        return paragraphs[next_position]["index"]

    def _detect_content_type(
        self,
        section_type: str,
        instruction: str | None,
    ) -> str:
        if section_type == "program":
            return "code"

        if section_type == "output":
            return "image"

        if section_type == "date":
            return "date"

        if section_type == "link":
            return "url"

        if instruction:
            instruction_lower = instruction.lower()

            if any(
                word in instruction_lower
                for word in ["code", "program", "python"]
            ):
                return "code"

            if any(
                word in instruction_lower
                for word in [
                    "screenshot",
                    "image",
                    "photo",
                    "picture",
                ]
            ):
                return "image"

            if any(
                word in instruction_lower
                for word in [
                    "date",
                    "dd.mm.yyyy",
                ]
            ):
                return "date"

            if any(
                word in instruction_lower
                for word in [
                    "link",
                    "url",
                    "website",
                ]
            ):
                return "url"

        return "text"

    def _analyze_tables(self, tables: list[dict]) -> list[dict]:
        analyzed_tables = []

        for table in tables:
            rows = []

            for row in table.get("rows", []):
                cells = []

                for cell in row:
                    cells.append(
                        {
                            "text": cell,
                            "role": self._detect_table_cell_role(cell),
                        }
                    )

                rows.append(cells)

            analyzed_tables.append(
                {
                    "source": "table",
                    "index": table["index"],
                    "rows": rows,
                }
            )

        return analyzed_tables

    def _detect_table_cell_role(self, text: str) -> str:
        normalized = self._normalize(text)

        if not normalized:
            return "empty"

        if "date" in normalized:
            return "date"

        if "youtube" in normalized:
            return "url"

        if "title" in normalized:
            return "title"

        if "ex. no" in normalized:
            return "exercise_number"

        if "dd.mm.yyyy" in normalized:
            return "date"

        return "text"

    def _detect_section_type(self, text: str) -> str | None:
        normalized = self._normalize(text)

        for section_type, patterns in self.SECTION_PATTERNS.items():
            for pattern in patterns:
                if re.fullmatch(pattern, normalized):
                    return section_type

        return None

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r"\s+", " ", text)
        return text