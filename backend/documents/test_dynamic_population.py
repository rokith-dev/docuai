from pathlib import Path

from backend.documents.template_analyzer import (
    TemplateAnalyzer,
)
from backend.documents.template_understanding import (
    TemplateUnderstanding,
)
from backend.documents.template_map import (
    TemplateMapBuilder,
)
from backend.documents.docx_populator import (
    DocxPopulator,
)


TEMPLATE = (
    r"C:\Users\ROKITH\Downloads\Record Template.docx"
)

OUTPUT = (
    r"C:\Users\ROKITH\Downloads\Dynamic_Test_Output.docx"
)


def main():

    # ==================================================
    # 1. ANALYZE TEMPLATE
    # ==================================================

    analysis = TemplateAnalyzer().analyze(
        TEMPLATE
    )

    # ==================================================
    # 2. UNDERSTAND TEMPLATE
    # ==================================================

    understanding = (
        TemplateUnderstanding().understand(
            analysis
        )
    )

    # ==================================================
    # 3. BUILD TEMPLATE MAP
    # ==================================================

    template_map = (
        TemplateMapBuilder().build(
            understanding
        )
    )

    print("\nDetected table fields:\n")

    for field in template_map.get(
        "table_fields",
        [],
    ):

        print(
            field["name"],
            "->",
            field["value_location"],
        )

    # ==================================================
    # 4. CONTENT
    # ==================================================

    content = {

        "exercise_number":
            "Ex. No. 1",

        "title":
            "CNN Image Classification",

        "youtube_link":
            "",

        "date":
            "23.08.2026",

        "aim":
            "To develop a CNN model for image classification.",

        "description":
            (
                "A convolutional neural network is used "
                "to learn visual features from images "
                "and classify them into different categories."
            ),

        "program":
            'print("CNN Image Classification")',

        "output":
            "",

        "result":
            (
                "The CNN model successfully classified "
                "the images and achieved the intended objective."
            ),
    }

    # ==================================================
    # 5. POPULATE DOCX
    # ==================================================

    result = DocxPopulator().populate(
        template_path=TEMPLATE,
        output_path=OUTPUT,
        template_map=template_map,
        content=content,
    )

    print(
        f"\nDocument created successfully:\n{result}"
    )


if __name__ == "__main__":
    main()