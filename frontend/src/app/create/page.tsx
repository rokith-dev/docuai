"use client";

import {
  ChangeEvent,
  useState,
} from "react";


type TemplateField = {
  name: string;
  label: string;
  standard?: boolean;
  content_type?: string;
  instruction?: string;
  location?: {
    source?: string;
    heading_index?: number;
    content_index?: number;
  };
};


type TableField = {
  name: string;
  label: string;
  standard?: boolean;
  kind?: string;
  current_value?: string;
  placeholder?: boolean;

  label_location?: {
    table_index?: number;
    row?: number;
    column?: number;
  };

  value_location?: {
    table_index?: number;
    row?: number;
    column?: number;
  };
};


type AnalysisResponse = {
  status: string;
  file_name: string;
  fields: TemplateField[];
  table_fields: TableField[];
};


type UserContent = Record<
  string,
  string
>;


export default function CreatePage() {

  // ==================================================
  // STATE
  // ==================================================

  const [file, setFile] =
    useState<File | null>(null);

  const [outputImage, setOutputImage] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<AnalysisResponse | null>(
      null,
    );

  const [content, setContent] =
    useState<UserContent>({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // FILE SELECTION
  // ==================================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {

    const selectedFile =
      event.target.files?.[0];

    setError("");
    setSuccess("");
    setResult(null);
    setContent({});
    setOutputImage(null);

    if (!selectedFile) {

      setFile(null);

      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".docx")
    ) {

      setFile(null);

      setError(
        "Please select a DOCX file.",
      );

      return;
    }

    setFile(selectedFile);
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
    setSuccess("");
    setResult(null);
    setContent({});
    setOutputImage(null);

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

      setResult(data);

      // ----------------------------------------------
      // Initialize detected fields
      // ----------------------------------------------

      const initialContent:
        UserContent = {};

      for (
        const field of
          data.fields ?? []
      ) {

        initialContent[
          field.name
        ] = "";
      }

      for (
        const field of
          data.table_fields ?? []
      ) {

        if (
          field.current_value &&
          !field.placeholder
        ) {

          initialContent[
            field.name
          ] =
            field.current_value;

        } else {

          initialContent[
            field.name
          ] = "";
        }
      }

      setContent(
        initialContent,
      );

      setSuccess(
        "Template analyzed successfully.",
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze the template.",
      );

    } finally {

      setLoading(false);
    }
  }


  // ==================================================
  // UPDATE FIELD
  // ==================================================

  function updateContent(
    fieldName: string,
    value: string,
  ) {

    setContent(
      (previous) => ({
        ...previous,
        [fieldName]:
          value,
      }),
    );
  }


  // ==================================================
  // OUTPUT IMAGE
  // ==================================================

  function handleOutputImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {

    const image =
      event.target.files?.[0] ??
      null;

    setOutputImage(
      image,
    );

    setError("");
    setSuccess("");
  }


  // ==================================================
  // DOCUMENT FIELD INPUT
  // ==================================================

  function renderInput(
    field: TemplateField,
  ) {

    const value =
      content[field.name] ??
      "";

    const contentType =
      field.content_type ??
      "text";


    // ----------------------------------------------
    // CODE
    // ----------------------------------------------

    if (
      contentType === "code"
    ) {

      return (
        <textarea
          value={value}
          onChange={(event) =>
            updateContent(
              field.name,
              event.target.value,
            )
          }
          placeholder={
            `Enter ${field.label}`
          }
          rows={14}
          spellCheck={false}
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
            focus:border-black
            focus:ring-1
            focus:ring-black
          "
        />
      );
    }


    // ----------------------------------------------
    // IMAGE
    // ----------------------------------------------

    if (
      contentType === "image"
    ) {

      return (
        <div>

          <input
            type="file"
            accept="
              image/png,
              image/jpeg,
              image/webp
            "
            onChange={
              handleOutputImageChange
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

          {outputImage && (
            <div className="mt-3">

              <p className="text-sm text-gray-500">
                Selected:
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {outputImage.name}
              </p>

            </div>
          )}

        </div>
      );
    }


    // ----------------------------------------------
    // NORMAL TEXT
    // ----------------------------------------------

    return (
      <textarea
        value={value}
        onChange={(event) =>
          updateContent(
            field.name,
            event.target.value,
          )
        }
        placeholder={
          `Enter ${field.label}`
        }
        rows={5}
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
          focus:border-black
          focus:ring-1
          focus:ring-black
        "
      />
    );
  }


  // ==================================================
  // TABLE FIELD INPUT
  // ==================================================

  function renderTableInput(
    field: TableField,
  ) {

    const value =
      content[field.name] ??
      "";

    const name =
      field.name.toLowerCase();

    const label =
      field.label.toLowerCase();


    // ----------------------------------------------
    // YOUTUBE LINK
    // ----------------------------------------------

    if (
      name.includes("youtube") ||
      name.includes("url") ||
      label.includes("youtube") ||
      label.includes("link")
    ) {

      return (
        <input
          type="url"
          value={value}
          onChange={(event) =>
            updateContent(
              field.name,
              event.target.value,
            )
          }
          placeholder="https://youtube.com/..."
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
            focus:border-black
            focus:ring-1
            focus:ring-black
          "
        />
      );
    }


    // ----------------------------------------------
    // DATE
    // ----------------------------------------------

    if (
      name.includes("date") ||
      label.includes("date")
    ) {

      return (
        <input
          type="text"
          value={value}
          onChange={(event) =>
            updateContent(
              field.name,
              event.target.value,
            )
          }
          placeholder="DD.MM.YYYY"
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
            focus:border-black
            focus:ring-1
            focus:ring-black
          "
        />
      );
    }


    // ----------------------------------------------
    // NORMAL TABLE VALUE
    // ----------------------------------------------

    return (
      <input
        type="text"
        value={value}
        onChange={(event) =>
          updateContent(
            field.name,
            event.target.value,
          )
        }
        placeholder={
          `Enter ${field.label}`
        }
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
          focus:border-black
          focus:ring-1
          focus:ring-black
        "
      />
    );
  }


  // ==================================================
  // GENERATE DOCUMENT
  // ==================================================

  async function handleGenerate() {

    if (!file) {

      setError(
        "Please select a DOCX template first.",
      );

      return;
    }

    if (!result) {

      setError(
        "Please analyze the template first.",
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      // --------------------------------------------
      // Create multipart form
      // --------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "content",
        JSON.stringify(
          content,
        ),
      );


      // --------------------------------------------
      // Add screenshot
      // --------------------------------------------

      if (outputImage) {

        formData.append(
          "output_image",
          outputImage,
        );
      }


      // --------------------------------------------
      // Send request
      // --------------------------------------------

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/templates/generate",
          {
            method: "POST",
            body: formData,
          },
        );


      // --------------------------------------------
      // Handle error
      // --------------------------------------------

      if (!response.ok) {

        let message =
          "Document generation failed.";

        try {

          const data =
            await response.json();

          if (data.detail) {

            message =
              data.detail;
          }

        } catch {
          // Response wasn't JSON.
        }

        throw new Error(
          message,
        );
      }


      // --------------------------------------------
      // Receive DOCX
      // --------------------------------------------

      const blob =
        await response.blob();


      // --------------------------------------------
      // Create download
      // --------------------------------------------

      const downloadUrl =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href =
        downloadUrl;

      link.download =
        `DocuAI_${file.name.replace(
          /\.docx$/i,
          "",
        )}.docx`;

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl,
      );


      setSuccess(
        "Document generated and downloaded successfully.",
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate the document.",
      );

    } finally {

      setLoading(false);
    }
  }


  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-5xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-gray-900">
            DocuAI
          </h1>

          <p className="mt-2 text-gray-600">
            AI-powered intelligent document
            generation.
          </p>

        </div>


        {/* ==========================================
            UPLOAD
        ========================================== */}

        <section className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-8
          shadow-sm
        ">

          <h2 className="text-2xl font-semibold text-gray-900">
            Upload Template
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload a DOCX template and DocuAI
            will automatically detect its fields.
          </p>


          <div className="mt-6">

            <label
              htmlFor="template-file"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              Template File
            </label>

            <input
              id="template-file"
              type="file"
              accept=".docx"
              onChange={
                handleFileChange
              }
              className="
                block
                w-full
                cursor-pointer
                rounded-xl
                border
                border-gray-300
                bg-white
                p-3
                text-sm
              "
            />

          </div>


          {/* Selected file */}

          {file && (
            <div className="
              mt-4
              rounded-xl
              bg-gray-50
              p-4
            ">

              <p className="text-sm text-gray-500">
                Selected file
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {file.name}
              </p>

            </div>
          )}


          {/* Error */}

          {error && (
            <div className="
              mt-4
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
            ">

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}


          {/* Success */}

          {success && (
            <div className="
              mt-4
              rounded-xl
              border
              border-green-200
              bg-green-50
              p-4
            ">

              <p className="text-sm text-green-700">
                {success}
              </p>

            </div>
          )}


          {/* Analyze */}

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
              ? "Processing..."
              : "Analyze Template"}
          </button>

        </section>


        {/* ==========================================
            DYNAMIC FORM
        ========================================== */}

        {result && (
          <section className="
            mt-8
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-8
            shadow-sm
          ">

            {/* Header */}

            <div className="
              border-b
              border-gray-200
              pb-6
            ">

              <h2 className="text-2xl font-semibold text-gray-900">
                Document Content
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Fill in the fields detected
                from your template.
              </p>

              <p className="mt-2 text-sm font-medium text-gray-800">
                {result.file_name}
              </p>

            </div>


            {/* ======================================
                TABLE FIELDS
            ====================================== */}

            {result.table_fields.length >
              0 && (

              <div className="mt-8">

                <h3 className="text-lg font-semibold text-gray-900">
                  Template Information
                </h3>

                <div className="mt-5 space-y-5">

                  {result.table_fields.map(
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

                        {renderTableInput(
                          field,
                        )}

                      </div>

                    ),
                  )}

                </div>

              </div>
            )}


            {/* ======================================
                DOCUMENT FIELDS
            ====================================== */}

            {result.fields.length >
              0 && (

              <div className="mt-10">

                <h3 className="text-lg font-semibold text-gray-900">
                  Document Sections
                </h3>

                <div className="mt-5 space-y-8">

                  {result.fields.map(
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

                        {renderInput(
                          field,
                        )}

                        {field.instruction && (
                          <div className="
                            mt-2
                            rounded-lg
                            bg-gray-50
                            p-3
                          ">

                            <p className="
                              text-xs
                              font-medium
                              text-gray-500
                            ">
                              Template Instruction
                            </p>

                            <p className="
                              mt-1
                              text-xs
                              leading-5
                              text-gray-600
                            ">
                              {
                                field.instruction
                              }
                            </p>

                          </div>
                        )}

                      </div>

                    ),
                  )}

                </div>

              </div>
            )}


            {/* ======================================
                GENERATE
            ====================================== */}

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
                  handleGenerate
                }
                disabled={
                  !file ||
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
                  ? "Generating Document..."
                  : "Generate Document"}

              </button>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}