"use client";

import {
  ChangeEvent,
  useState,
} from "react";


// ==================================================
// TYPES
// ==================================================

interface TemplateField {
  name: string;
  label: string;
  standard?: boolean;
  content_type?: string;
  location?: {
    source?: string;
    heading_index?: number;
    content_index?: number;
  };
  instruction?: string;
}

interface TableField {
  name: string;
  label: string;
  standard?: boolean;
  kind?: string;
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
  current_value?: string;
  placeholder?: boolean;
}

interface TemplateAnalysis {
  status: string;
  file_name: string;
  fields: TemplateField[];
  table_fields: TableField[];
}

interface UserContent {
  [key: string]: string;
}


// ==================================================
// PAGE
// ==================================================

export default function CreatePage() {

  // ==================================================
  // STATE
  // ==================================================

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<TemplateAnalysis | null>(null);

  const [content, setContent] =
    useState<UserContent>({});

  const [outputImage, setOutputImage] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // FILE CHANGE
  // ==================================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {

    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);

    setResult(null);
    setContent({});
    setOutputImage(null);
    setError("");
    setSuccess("");
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


      // ==================================================
      // INITIALIZE DETECTED FIELDS
      // ==================================================

      const initialContent:
        UserContent = {};


      // Document fields

      for (
        const field of
          data.fields ?? []
      ) {

        initialContent[
          field.name
        ] = "";
      }


      // Table fields

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


    // ==================================================
    // CODE
    // ==================================================

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
          rows={16}
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


    // ==================================================
    // IMAGE
    // ==================================================

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
              text-gray-700
            "
          />

          {outputImage && (

            <div
              className="
                mt-3
                rounded-xl
                bg-gray-50
                p-4
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Selected image
              </p>

              <p
                className="
                  mt-1
                  font-medium
                  text-gray-900
                "
              >
                {outputImage.name}
              </p>

            </div>
          )}

        </div>
      );
    }


    // ==================================================
    // NORMAL TEXT
    // ==================================================

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


    // ==================================================
    // EXISTING VALUE
    // ==================================================

    if (
      field.kind === "existing_value"
    ) {

      return (
        <input
          type="text"
          value={value}
          readOnly
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            bg-gray-100
            p-4
            text-sm
            font-medium
            text-gray-600
            outline-none
          "
        />
      );
    }


    // ==================================================
    // TITLE
    // ==================================================

    if (
      name.includes("title") ||
      label.includes("title")
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
          placeholder="Enter title of the exercise"
          className="
            w-full
            rounded-xl
            border
            border-gray-300
            bg-white
            p-4
            text-sm
            font-medium
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
    // YOUTUBE LINK
    // ==================================================

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


    // ==================================================
    // DATE
    // ==================================================

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


    // ==================================================
    // NORMAL TABLE VALUE
    // ==================================================

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

      // ==================================================
      // FORM DATA
      // ==================================================

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


      // ==================================================
      // OUTPUT IMAGE
      // ==================================================

      if (outputImage) {

        formData.append(
          "output_image",
          outputImage,
        );
      }


      // ==================================================
      // SEND REQUEST
      // ==================================================

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/templates/generate",
          {
            method: "POST",
            body: formData,
          },
        );


      // ==================================================
      // HANDLE ERROR
      // ==================================================

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


      // ==================================================
      // RECEIVE DOCX
      // ==================================================

      const blob =
        await response.blob();


      // ==================================================
      // CREATE DOWNLOAD
      // ==================================================

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
    <main
      className="
        min-h-screen
        bg-gray-50
        px-6
        py-10
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <h1
            className="
              text-4xl
              font-bold
              text-gray-900
            "
          >
            DocuAI
          </h1>

          <p
            className="
              mt-2
              text-gray-600
            "
          >
            AI-powered intelligent document
            generation.
          </p>

        </div>


        {/* ==================================================
            UPLOAD TEMPLATE
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-8
            shadow-sm
          "
        >

          <h2
            className="
              text-2xl
              font-semibold
              text-gray-900
            "
          >
            Upload Template
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Upload a DOCX template and DocuAI
            will automatically detect its fields.
          </p>


          {/* FILE */}

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


          {/* SELECTED FILE */}

          {file && (

            <div
              className="
                mt-4
                rounded-xl
                bg-gray-50
                p-4
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Selected file
              </p>

              <p
                className="
                  mt-1
                  font-medium
                  text-gray-900
                "
              >
                {file.name}
              </p>

            </div>
          )}


          {/* ERROR */}

          {error && (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
              "
            >

              <p
                className="
                  text-sm
                  text-red-700
                "
              >
                {error}
              </p>

            </div>
          )}


          {/* SUCCESS */}

          {success && (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-green-200
                bg-green-50
                p-4
              "
            >

              <p
                className="
                  text-sm
                  text-green-700
                "
              >
                {success}
              </p>

            </div>
          )}


          {/* ANALYZE */}

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


        {/* ==================================================
            DYNAMIC FORM
        ================================================== */}

        {result && (

          <section
            className="
              mt-8
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

            {/* HEADER */}

            <div
              className="
                border-b
                border-gray-200
                pb-6
              "
            >

              <h2
                className="
                  text-2xl
                  font-semibold
                  text-gray-900
                "
              >
                Document Content
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                Fill in the fields detected
                from your template.
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  font-medium
                  text-gray-800
                "
              >
                {result.file_name}
              </p>

            </div>


            {/* ==================================================
                TEMPLATE INFORMATION
            ================================================== */}

            {result.table_fields &&
              result.table_fields.length > 0 && (

              <div className="mt-8">

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  Template Information
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Information detected from
                  the template header table.
                </p>

                <div
                  className="
                    mt-5
                    space-y-5
                  "
                >

                  {result.table_fields.map(
                    (field, index) => (

                      <div
                        key={`${field.name}-${field.label}-${index}`}
                      >

                        <label
                          className="
                            mb-2
                            block
                            text-sm
                            font-medium
                            text-gray-800
                          "
                        >
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


            {/* ==================================================
                DOCUMENT SECTIONS
            ================================================== */}

            {result.fields &&
              result.fields.length > 0 && (

              <div className="mt-10">

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  Document Sections
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Complete each section detected
                  from your DOCX template.
                </p>

                <div
                  className="
                    mt-5
                    space-y-8
                  "
                >

                  {result.fields.map(
                    (field, index) => (

                      <div
                        key={`${field.name}-${index}`}
                      >

                        <label
                          className="
                            mb-2
                            block
                            text-sm
                            font-medium
                            text-gray-800
                          "
                        >
                          {field.label}
                        </label>


                        {/* FIELD TYPE */}

                        {renderInput(
                          field,
                        )}


                        {/* INSTRUCTION */}

                        {field.instruction && (

                          <div
                            className="
                              mt-2
                              rounded-lg
                              bg-gray-50
                              p-3
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-medium
                                text-gray-500
                              "
                            >
                              Template Instruction
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-gray-600
                              "
                            >
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


            {/* ==================================================
                GENERATE BUTTON
            ================================================== */}

            <div
              className="
                mt-10
                flex
                justify-end
                border-t
                border-gray-200
                pt-6
              "
            >

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