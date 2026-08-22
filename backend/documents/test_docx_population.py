from backend.documents.template_analyzer import TemplateAnalyzer
from backend.documents.template_understanding import TemplateUnderstanding
from backend.documents.template_map import TemplateMapBuilder
from backend.documents.docx_populator import DocxPopulator
from backend.documents.format_config import DocumentFormatConfig


template_path = r"C:\Users\ROKITH\Downloads\Record Template.docx"

output_path = (
    r"C:\Users\ROKITH\Downloads\DocuAI_Test_Output.docx"
)


# --------------------------------------------------
# 1. Analyze the template
# --------------------------------------------------

analysis = TemplateAnalyzer().analyze(
    template_path
)


# --------------------------------------------------
# 2. Understand the template
# --------------------------------------------------

understanding = TemplateUnderstanding().understand(
    analysis
)


# --------------------------------------------------
# 3. Build the template map
# --------------------------------------------------

template_map = TemplateMapBuilder().build(
    understanding
)


# --------------------------------------------------
# 4. User / AI content
# --------------------------------------------------

content = {
    "aim": (
        "To develop and evaluate a "
        "Convolutional Neural Network "
        "for image classification."
    ),

    "description": (
        "A Convolutional Neural Network "
        "is a deep learning model commonly "
        "used for image classification."
    ),

    "program": (
        "import tensorflow as tf\n\n"
        "print('CNN Image Classification')"
    ),

    "result": (
        "The CNN model was successfully "
        "developed and evaluated for "
        "image classification."
    ),

    "title": "CNN Image Classification",
}


# --------------------------------------------------
# 5. Formatting configuration
# --------------------------------------------------

format_config = DocumentFormatConfig(
    font_name="Times New Roman",
    body_font_size=12,
    heading_font_size=14,
    subheading_font_size=13,
    title_font_size=16,
    code_font_size=10,
    body_alignment="JUSTIFY",
)


# --------------------------------------------------
# 6. Generate the completed document
# --------------------------------------------------

populator = DocxPopulator(
    format_config=format_config
)


result = populator.populate(
    template_path=template_path,
    output_path=output_path,
    template_map=template_map,
    content=content,
)


print(f"Document created: {result}")