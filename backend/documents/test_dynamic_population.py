from pathlib import Path

from backend.documents.template_analyzer import TemplateAnalyzer
from backend.documents.template_understanding import TemplateUnderstanding
from backend.documents.template_map import TemplateMapBuilder
from backend.documents.docx_populator import DocxPopulator


TEMPLATE = (
    r"C:\Users\ROKITH\Downloads\Registration Test.docx"
)

OUTPUT = (
    r"C:\Users\ROKITH\Downloads\Dynamic_Test_Output.docx"
)


def main():

    # ------------------------------------------
    # 1. Analyze template
    # ------------------------------------------

    analysis = TemplateAnalyzer().analyze(
        TEMPLATE
    )

    # ------------------------------------------
    # 2. Understand template
    # ------------------------------------------

    understanding = (
        TemplateUnderstanding().understand(
            analysis
        )
    )

    # ------------------------------------------
    # 3. Build semantic map
    # ------------------------------------------

    template_map = (
        TemplateMapBuilder().build(
            understanding
        )
    )

    # ------------------------------------------
    # 4. User-provided content
    # ------------------------------------------

    content = {
        "registration_number": "URK24AI1041",
        "title": "CNN Image Classification",

        # Optional fields intentionally empty.
        "youtube_link": "",
        "date": "",
    }

    # ------------------------------------------
    # 5. Populate document
    # ------------------------------------------

    result = DocxPopulator().populate(
        template_path=TEMPLATE,
        output_path=OUTPUT,
        template_map=template_map,
        content=content,
    )

    print(
        f"Document created: {result}"
    )


if __name__ == "__main__":
    main()