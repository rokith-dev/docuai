"use client";

import { ChangeEvent, useState } from "react";

type Field = {
  name: string;
  label: string;
  content_type?: string;
  instruction?: string;
  current_value?: string;
  kind?: string;
};

type AnalysisResult = {
  status: string;
  file_name: string;
  fields: Field[];
  table_fields: Field[];
};

type Content = Record<string, string>;

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const [content, setContent] =
    useState<Content>({});

  const [outputImage, setOutputImage] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==================================================
  // SELECT TEMPLATE
  // ==================================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      event.target.files?.[0] ?? null;

    setError("");
    setMessage("");
    setAnalysis(null);
    setContent({});

    if (!selected) {
      setFile(null);
      return;
    }

    if (
      !selected.name
        .toLowerCase()
        .endsWith(".docx")
    ) {
      setFile(null);

      setError(
        "Please select a .docx file.",
      );

      return;
    }

    setFile(selected);
  }

  // ==================================================
  // ANALYZE TEMPLATE
  // ==================================================

  async function analyzeTemplate() {
    if (!file) {
      setError(
        "Please select a DOCX template first.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/templates/analyze",
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Template analysis failed.",
        );
      }

      setAnalysis(data);

      const initialContent: Content = {};

      for (
        const field of data.fields ?? []
      ) {
        initialContent[
          field.name
        ] = "";
      }

      for (
        const field of
          data.table_fields ?? []
      ) {
        initialContent[
          field.name
        ] =
          field.current_value &&
          !field.current_value
            .includes("DD.MM.YYYY")
            ? field.current_value
            : "";
      }

      setContent(
        initialContent,
      );

      setMessage(
        "Template analyzed successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze template.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // UPDATE FIELD
  // ==================================================

  function updateField(
    name: string,
    value: string,
  ) {
    setContent(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  }

  // ==================================================
  // IMAGE
  // ==================================================

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      event.target.files?.[0] ?? null;

    setOutputImage(
      selected,
    );
  }

  // ==================================================
  // GENERATE DOCUMENT
  // ==================================================

  async function generateDocument() {
    if (!file) {
      setError(
        "Please select a template.",
      );
      return;
    }

    if (!analysis) {
      setError(
        "Please analyze the template first.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "content",
        JSON.stringify(content),
      );

      if (outputImage) {
        formData.append(
          "output_image",
          outputImage,
        );
      }

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/templates/generate",
          {
            method: "POST",
            body: formData,
          },
        );

      if (!response.ok) {
        let detail =
          "Document generation failed.";

        try {
          const data =
            await response.json();

          if (data.detail) {
            detail = data.detail;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(
          detail,
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = url;

      link.download =
        `DocuAI_${file.name}`;

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url,
      );

      setMessage(
        "Document generated and downloaded successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Document generation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // FIELD INPUT
  // ==================================================

  function renderField(
    field: Field,
  ) {
    const value =
      content[field.name] ?? "";

    const type =
      field.content_type ??
      "text";

    if (type === "code") {
      return (
        <textarea
          value={value}
          onChange={(event) =>
            updateField(
              field.name,
              event.target.value,
            )
          }
          rows={14}
          placeholder="Enter your program/code"
          className="
            w-full
            rounded-xl
            border
            border-gray-300
            bg-gray-950
            p-4
            font-mono
            text-sm
            leading-6
            text-white
            outline-none
            focus:border-gray-900
          "
        />
      );
    }

    if (type === "image") {
      return (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={
              handleImageChange
            }
            className="
              block
              w-full
              rounded-xl
              border
              border-gray-300
              p-3
              text-sm
            "
          />

          {outputImage && (
            <p className="
              mt-2
              text-sm
              text-gray-600
            ">
              Selected:{" "}
              {outputImage.name}
            </p>
          )}
        </div>
      );
    }

    return (
      <textarea
        value={value}
        onChange={(event) =>
          updateField(
            field.name,
            event.target.value,
          )
        }
        rows={5}
        placeholder={`Enter ${field.label}`}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          bg-white
          p-4
          text-sm
          text-gray-900
          outline-none
          focus:border-gray-900
        "
      />
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="
      min-h-screen
      bg-gray-50
      px-6
      py-10
    ">

      <div className="
        mx-auto
        max-w-5xl
      ">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="
            text-4xl
            font-bold
            tracking-tight
            text-gray-900
          ">
            DocuAI
          </h1>

          <p className="
            mt-2
            text-gray-600
          ">
            Intelligent document generation
            powered by AI.
          </p>

        </div>


        {/* UPLOAD */}

        <section className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-8
          shadow-sm
        ">

          <h2 className="
            text-2xl
            font-semibold
            text-gray-900
          ">
            Upload Template
          </h2>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">
            Upload your DOCX template.
            DocuAI will automatically
            understand its structure.
          </p>


          <div className="mt-6">

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-gray-700
            ">
              Template File
            </label>

            <input
              type="file"
              accept=".docx"
              onChange={
                handleFileChange
              }
              className="
                block
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                p-3
                text-sm
              "
            />

          </div>


          {file && (
            <div className="
              mt-4
              rounded-xl
              bg-gray-50
              p-4
            ">

              <p className="
                text-xs
                text-gray-500
              ">
                Selected file
              </p>

              <p className="
                mt-1
                font-medium
                text-gray-900
              ">
                {file.name}
              </p>

            </div>
          )}


          {error && (
            <div className="
              mt-4
              rounded-xl
              bg-red-50
              p-4
            ">
              <p className="
                text-sm
                text-red-700
              ">
                {error}
              </p>
            </div>
          )}


          {message && (
            <div className="
              mt-4
              rounded-xl
              bg-green-50
              p-4
            ">
              <p className="
                text-sm
                text-green-700
              ">
                {message}
              </p>
            </div>
          )}


          <button
            type="button"
            onClick={
              analyzeTemplate
            }
            disabled={
              !file ||
              loading
            }
            className="
              mt-6
              rounded-xl
              bg-black
              px-6
              py-3
              font-medium
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Analyzing..."
              : "Analyze Template"}
          </button>

        </section>


        {/* ANALYSIS */}

        {analysis && (
          <section className="
            mt-8
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-8
            shadow-sm
          ">

            <div className="
              border-b
              border-gray-200
              pb-6
            ">

              <h2 className="
                text-2xl
                font-semibold
                text-gray-900
              ">
                Template Analysis
              </h2>

              <p className="
                mt-2
                text-sm
                text-gray-500
              ">
                File:{" "}
                {analysis.file_name}
              </p>

              <p className="
                mt-1
                text-sm
                font-medium
                text-green-600
              ">
                ✓ Analysis successful
              </p>

            </div>


            {/* TABLE FIELDS */}

            {analysis.table_fields
              .length > 0 && (

              <div className="mt-8">

                <h3 className="
                  text-lg
                  font-semibold
                  text-gray-900
                ">
                  Template Information
                </h3>

                <div className="
                  mt-5
                  grid
                  gap-5
                  md:grid-cols-2
                ">

                  {analysis.table_fields.map(
                    (field) => (

                      <div
                        key={
                          field.name
                        }
                      >

                        <label className="
                          mb-2
                          block
                          text-sm
                          font-medium
                          text-gray-800
                        ">
                          {field.label}
                        </label>

                        <input
                          type="text"
                          value={
                            content[
                              field.name
                            ] ?? ""
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              field.name,
                              event.target.value,
                            )
                          }
                          placeholder={
                            field.label
                          }
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            p-4
                            text-sm
                            outline-none
                            focus:border-black
                          "
                        />

                      </div>

                    ),
                  )}

                </div>

              </div>
            )}


            {/* DOCUMENT FIELDS */}

            {analysis.fields
              .length > 0 && (

              <div className="mt-10">

                <h3 className="
                  text-lg
                  font-semibold
                  text-gray-900
                ">
                  Document Fields
                </h3>

                <div className="
                  mt-5
                  space-y-8
                ">

                  {analysis.fields.map(
                    (field) => (

                      <div
                        key={
                          field.name
                        }
                      >

                        <label className="
                          mb-2
                          block
                          text-sm
                          font-medium
                          text-gray-800
                        ">
                          {field.label}
                        </label>

                        {renderField(
                          field,
                        )}

                        {field.instruction && (
                          <p className="
                            mt-2
                            text-xs
                            leading-5
                            text-gray-500
                          ">
                            {field.instruction}
                          </p>
                        )}

                      </div>

                    ),
                  )}

                </div>

              </div>
            )}


            {/* GENERATE */}

            <div className="
              mt-10
              flex
              justify-end
              border-t
              border-gray-200
              pt-6
            ">

              <button
                type="button"
                onClick={
                  generateDocument
                }
                disabled={
                  loading
                }
                className="
                  rounded-xl
                  bg-black
                  px-8
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Generating..."
                  : "Generate & Download DOCX"}
              </button>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}