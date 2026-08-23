import os
import unittest
from unittest.mock import patch

from backend.ai.content_generator import AIContentGenerator
from backend.ai.gemini import GeminiService
from backend.ai.prompts import build_content_prompt


class AIContentGenerationTests(unittest.TestCase):
    def test_prompt_includes_topic_instruction_and_skips_images(self):
        prompt = build_content_prompt(
            "CNN Image Classification",
            [
                {
                    "name": "aim",
                    "label": "Aim",
                    "content_type": "text",
                    "instruction": "Write one concise sentence.",
                },
                {
                    "name": "output",
                    "label": "Output Screenshot",
                    "content_type": "image",
                },
            ],
        )

        self.assertIn("CNN Image Classification", prompt)
        self.assertIn("Write one concise sentence.", prompt)
        self.assertIn('"name": "aim"', prompt)
        self.assertNotIn('"name": "output"', prompt)

    def test_structured_response_is_parsed(self):
        result = AIContentGenerator._parse_response(
            "```json\n{\"aim\": \"Classify images.\"}\n```",
            {"aim"},
        )

        self.assertEqual(result, {"aim": "Classify images."})

    def test_invalid_response_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, "invalid JSON"):
            AIContentGenerator._parse_response("not json", {"aim"})

    def test_missing_api_key_is_clear(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False):
            with self.assertRaisesRegex(ValueError, "GEMINI_API_KEY"):
                GeminiService()


if __name__ == "__main__":
    unittest.main()