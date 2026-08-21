import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors


load_dotenv()


class GeminiService:
    """Reusable service for communicating with the Gemini API."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Add it to the .env file."
            )

        self.client = genai.Client(
            api_key=api_key,
            http_options={
                "timeout": 30000,
            },
        )

        self.model = "gemini-2.5-flash"

    def generate(self, prompt: str, max_retries: int = 3) -> str:
        """
        Generate a response from Gemini.

        Temporary server errors are retried automatically.
        """

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        for attempt in range(1, max_retries + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )

                if not response.text:
                    raise ValueError(
                        "Gemini returned an empty response."
                    )

                return response.text

            except errors.ServerError as error:
                print(
                    f"Gemini server error "
                    f"(attempt {attempt}/{max_retries})."
                )

                if attempt == max_retries:
                    raise RuntimeError(
                        "Gemini is temporarily unavailable. "
                        "Please try again later."
                    ) from error

                wait_time = attempt * 2

                print(
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

        raise RuntimeError("Gemini request failed.")