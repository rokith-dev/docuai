from pathlib import Path
from uuid import uuid4


GENERATED_DIRECTORY = (
    Path(__file__).resolve().parents[2] / "data" / "generated"
)


def save_generated_file(source_path: str, document_name: str) -> Path:
    GENERATED_DIRECTORY.mkdir(parents=True, exist_ok=True)
    safe_name = Path(document_name).stem
    destination = GENERATED_DIRECTORY / f"{uuid4().hex}_{safe_name}.docx"
    destination.resolve().relative_to(GENERATED_DIRECTORY.resolve())
    destination.write_bytes(Path(source_path).read_bytes())
    return destination


def resolve_generated_file(file_path: str) -> Path:
    root = GENERATED_DIRECTORY.resolve()
    candidate = Path(file_path).resolve()
    candidate.relative_to(root)
    if not candidate.is_file():
        raise FileNotFoundError("Generated document file was not found.")
    return candidate