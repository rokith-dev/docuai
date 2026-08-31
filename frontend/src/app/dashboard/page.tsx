"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../components/auth/AuthProvider";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useTheme } from "../../components/theme/ThemeProvider";

interface RecentDocument {
  id: number;
  document_name?: string;
  title?: string;
  is_favorite?: boolean;
}

interface TemplateField {
  name: string;
  label: string;
  content_type?: string;
}

interface TableField {
  name: string;
  label: string;
  current_value?: string;
  placeholder?: boolean;
}

type Mode = "ai" | "manual";
type Phase = "idle" | "analyzing" | "generating" | "preparing";

type Field = TemplateField | TableField;

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h4M9 13h6M9 17h6" />
      </>
    ),

    template: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),

    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 15l2 1-2 3-2-1a8 8 0 0 1-3 2v2h-4v-2a8 8 0 0 1-3-2l-2 1-2-3 2-1a8 8 0 0 1 0-4l-2-1 2-3 2 1a8 8 0 0 1 3-2V4h4v2a8 8 0 0 1 3 2l2-1 2 3-2 1a8 8 0 0 1 0 4z" />
      </>
    ),

    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-1 1-1.9 1.2-1.9 2.7M12 17h.01" />
      </>
    ),

    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),

    moon: (
      <path d="M20.5 15.3A8.5 8.5 0 1 1 8.7 3.5 8.5 8.5 0 0 0 20.5 15.3z" />
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4z" />
        <path d="M22 2 11 13" />
      </>
    ),

    upload: (
      <>
        <path d="M12 16V4M8 8l4-4 4 4M4 16v4h16v-4" />
      </>
    ),

    menu: <path d="M4 7h16M4 12h16M4 17h16" />,

    documentUpload: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M12 18v-6M9.5 14.5 12 12l2.5 2.5" />
      </>
    ),

    check: <path d="M20 6 9 17l-5-5" />,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const navigation = [
  ["Dashboard", "/dashboard", "grid"],
  ["Documents", "/documents", "file"],
  ["Templates", "/templates", "template"],
  ["Favorites", "/favorites", "star"],
] as const;

const manualSections = ["Topic", "Aim", "Description", "Program", "Result"];

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [avatarFailed, setAvatarFailed] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [outputImage, setOutputImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [tableFields, setTableFields] = useState<TableField[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  const [phase, setPhase] = useState<Phase>("idle");

  const [resultUrl, setResultUrl] = useState("");
  const [resultName, setResultName] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  async function loadRecentDocuments() {
    const response = await apiFetch("/api/documents");

    const data = response.ok ? await response.json() : null;

    setRecentDocuments((data?.documents ?? []).slice(0, 4));
  }

  function resetWorkspace() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setPrompt("");
    setFile(null);
    setOutputImage(null);
    setImageUrl("");

    setFields([]);
    setTableFields([]);
    setContent({});

    setResultUrl("");
    setResultName("");

    setMessage("");
    setError("");
    setPhase("idle");

    if (fileInput.current) {
      fileInput.current.value = "";
    }

    if (imageInput.current) {
      imageInput.current.value = "";
    }

    setTimeout(() => {
      promptRef.current?.focus();
    }, 0);
  }

  /*
   * ============================================================
   * TEMPLATE FILE SELECTION
   * ============================================================
   *
   * This is the important part for your first issue.
   *
   * The visible "Choose Template" button calls:
   *
   * fileInput.current?.click()
   *
   * The hidden input below then opens the Windows file picker.
   */

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      return;
    }

    const isSupported =
      /\.(docx|doc|pdf)$/i.test(selected.name) ||
      selected.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selected.type === "application/msword" ||
      selected.type === "application/pdf";

    if (!isSupported) {
      setError("Please select a DOCX, DOC, or PDF file.");
      setFile(null);
      return;
    }

    setFile(selected);

    setFields([]);
    setTableFields([]);
    setContent({});

    setResultUrl("");
    setResultName("");

    setMessage(`Selected: ${selected.name}`);
    setError("");
    setPhase("idle");
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setOutputImage(selected);
    setImageUrl(URL.createObjectURL(selected));
    setError("");
  }

  /*
   * ============================================================
   * ANALYZE TEMPLATE
   * ============================================================
   */

  async function analyzeTemplate() {
    if (!file) {
      setError("Choose a DOCX template first.");
      return;
    }

    /*
     * The current backend endpoint is the template analyzer.
     * Your backend currently appears to expect a DOCX template.
     *
     * Therefore DOCX should be used for template analysis.
     */

    if (!/\.docx$/i.test(file.name)) {
      setError(
        "Template analysis currently requires a .docx Word template. Please select a DOCX file."
      );
      return;
    }

    setPhase("analyzing");
    setError("");
    setMessage("Analyzing template...");

    try {
      const body = new FormData();

      body.append("file", file);

      const response = await apiFetch("/api/templates/analyze", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Template analysis failed."
        );
      }

      const detectedFields = data.fields ?? [];
      const detectedTableFields = data.table_fields ?? [];

      const initial: Record<string, string> = {};

      [...detectedFields, ...detectedTableFields].forEach(
        (field: TemplateField & TableField) => {
          initial[field.name] = field.placeholder
            ? ""
            : field.current_value ?? "";
        }
      );

      setFields(detectedFields);
      setTableFields(detectedTableFields);
      setContent(initial);

      setMessage("Template analyzed successfully");
      setError("");
      setPhase("idle");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Template analysis failed."
      );

      setMessage("");
      setPhase("idle");
    }
  }

  /*
   * ============================================================
   * AI CONTENT GENERATION
   * ============================================================
   */

  async function generateAIContent() {
    if (!prompt.trim()) {
      setError(
        "Describe the document you want to create first."
      );
      return;
    }

    if (!fields.length && !tableFields.length) {
      setError(
        "Upload and analyze your DOCX template first."
      );
      return;
    }

    setPhase("generating");
    setError("");
    setMessage("Generating your document...");

    try {
      const response = await apiFetch(
        "/api/ai/generate-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: prompt.trim(),
            fields,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI content generation failed."
        );
      }

      setContent((previous) => ({
        ...previous,
        ...(data.content ?? {}),
      }));

      setMessage("Your document content is ready");
      setPhase("idle");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "AI generation failed."
      );

      setMessage("");
      setPhase("idle");
    }
  }

  /*
   * ============================================================
   * DOCUMENT GENERATION
   * ============================================================
   */

  async function generateDocument(event?: FormEvent) {
    event?.preventDefault();

    if (!file) {
      setError("Choose a DOCX template first.");
      return;
    }

    if (!fields.length && !tableFields.length) {
      setError("Analyze your DOCX template first.");
      return;
    }

    setPhase("preparing");
    setError("");
    setMessage("Preparing your DOCX...");

    try {
      const body = new FormData();

      body.append("file", file);
      body.append("content", JSON.stringify(content));

      if (outputImage) {
        body.append("output_image", outputImage);
      }

      const response = await apiFetch(
        "/api/templates/generate",
        {
          method: "POST",
          body,
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.detail || "Document generation failed."
        );
      }

      const url = URL.createObjectURL(
        await response.blob()
      );

      setResultUrl(url);

      setResultName(
        `DocuAI_${file.name.replace(/\.docx$/i, "")}.docx`
      );

      setMessage("Your document is ready.");
      setPhase("idle");

      await loadRecentDocuments();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Document generation failed."
      );

      setMessage("");
      setPhase("idle");
    }
  }

  function updateField(name: string, value: string) {
    setContent((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePromptKey(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void generateAIContent();
    }
  }

  function fieldContent(field: Field) {
    return content[field.name] ?? "";
  }

  useEffect(() => {
    loadRecentDocuments().catch(() => {
      setRecentDocuments([]);
    });
  }, []);

  const detectedFields: Field[] = [
    ...tableFields,
    ...fields,
  ];

  const editorFields: Field[] = detectedFields.length
    ? detectedFields
    : mode === "manual"
      ? manualSections.map((label) => ({
          name: label.toLowerCase(),
          label,
        }))
      : [];

  const profileName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Account";

  const profileInitials = profileName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  return (
    <ProtectedRoute>
      <div className={`dashboard-shell ${theme}`}>

        {drawerOpen && (
          <button
            aria-label="Close menu"
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside
          className={`dashboard-sidebar ${
            drawerOpen ? "drawer-visible" : ""
          }`}
        >
          <div className="brand-row">
            <div className="brand-mark">D</div>
            <span>DocuAI</span>
          </div>

          <button
            className="new-document"
            onClick={() => {
              resetWorkspace();
              setDrawerOpen(false);
            }}
          >
            <Icon name="plus" size={15} />
            New Document
          </button>

          <nav
            className="primary-nav"
            aria-label="Main navigation"
          >
            {navigation.map(
              ([label, href, icon]) => (
                <Link
                  key={label}
                  href={href}
                  className={
                    label === "Dashboard"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setDrawerOpen(false)
                  }
                >
                  <Icon
                    name={icon}
                    size={15}
                  />
                  <span>{label}</span>
                </Link>
              )
            )}
          </nav>

          <div className="recent-section">
            <p className="section-label">
              Recent Documents
            </p>

            {recentDocuments.map(
              (document) => (
                <Link
                  href={`/documents#${document.id}`}
                  className="recent-document"
                  key={document.id}
                >
                  <Icon
                    name="file"
                    size={14}
                  />

                  <span>
                    {document.document_name ||
                      document.title ||
                      "Untitled document"}
                  </span>

                  {document.is_favorite && (
                    <Icon
                      name="star"
                      size={12}
                    />
                  )}
                </Link>
              )
            )}

            {!recentDocuments.length && (
              <p className="empty-recent">
                No documents yet
              </p>
            )}
          </div>

          <div className="sidebar-bottom">

            <Link href="/dashboard">
              <Icon
                name="settings"
                size={15}
              />
              Settings
            </Link>

            <Link href="/dashboard">
              <Icon
                name="help"
                size={15}
              />
              Help &amp; Feedback
            </Link>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
            >
              <span>
                <Icon
                  name={
                    theme === "light"
                      ? "sun"
                      : "moon"
                  }
                  size={15}
                />

                {theme === "light"
                  ? "Light"
                  : "Dark"}{" "}
                mode
              </span>

              <span
                className={`switch ${
                  theme === "dark"
                    ? "on"
                    : ""
                }`}
              >
                <i />
              </span>
            </button>

            <button
              className="profile"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
            >
              {avatarUrl &&
              !avatarFailed ? (
                <img
                  className="avatar"
                  src={avatarUrl}
                  alt=""
                  onError={() =>
                    setAvatarFailed(true)
                  }
                />
              ) : (
                <div className="avatar">
                  {profileInitials}
                </div>
              )}

              <div>
                <strong>
                  {profileName}
                </strong>

                <small>
                  {user?.email}
                </small>
              </div>
            </button>
          </div>
        </aside>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="dashboard-main">

          <header className="dashboard-header">

            <button
              className="mobile-menu"
              aria-label="Open menu"
              onClick={() =>
                setDrawerOpen(true)
              }
            >
              <Icon
                name="menu"
                size={19}
              />
            </button>

            <div className="mobile-brand">
              <div className="brand-mark">
                D
              </div>

              <span>DocuAI</span>
            </div>

            <div className="breadcrumb">
              Workspace <b>/</b>{" "}
              <strong>
                Create Document
              </strong>
            </div>

            <div className="header-actions">

              <button
                aria-label="Toggle theme"
                className="header-theme"
                onClick={toggleTheme}
              >
                <Icon
                  name={
                    theme === "light"
                      ? "sun"
                      : "moon"
                  }
                  size={16}
                />
              </button>

              {avatarUrl &&
              !avatarFailed ? (
                <img
                  className="mini-avatar"
                  src={avatarUrl}
                  alt=""
                  onError={() =>
                    setAvatarFailed(true)
                  }
                />
              ) : (
                <div className="mini-avatar">
                  {profileInitials}
                </div>
              )}

            </div>
          </header>

          <section className="dashboard-content">

            <div className="studio-heading">
              <p className="eyebrow">
                AI DOCUMENT STUDIO
              </p>

              <h1>
                Create your document
              </h1>

              <p>
                Describe what you need and
                let DocuAI shape the first
                draft.
              </p>
            </div>

            {/* =================================================
                MODE TABS
            ================================================== */}

            <div
              className="mode-tabs"
              role="tablist"
            >
              <button
                className={
                  mode === "ai"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setMode("ai")
                }
              >
                AI GENERATION
              </button>

              <button
                className={
                  mode === "manual"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setMode("manual")
                }
              >
                MANUAL CONTENT
              </button>
            </div>

            <div className="generation-layout">

              {/* =================================================
                  CONVERSATION PANEL
              ================================================== */}

              <section className="conversation-panel">

                {/* =================================================
                    NEW TEMPLATE UPLOAD CARD

                    THIS FIXES YOUR FIRST ISSUE.
                ================================================== */}

                {mode === "ai" && (
                  <div className="template-card">

                    <div className="template-card-top">

                      <div>
                        <span className="field-kicker">
                          DOCUMENT TEMPLATE
                        </span>

                        <strong>
                          <Icon
                            name="documentUpload"
                            size={17}
                          />

                          {file
                            ? file.name
                            : "Upload a Word template"}
                        </strong>

                        <p className="file-meta">
                          {file
                            ? `${(
                                file.size /
                                1024
                              ).toFixed(1)} KB`
                            : "DOCX, DOC or PDF • Max file size depends on server configuration"}
                        </p>
                      </div>

                      {file && (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            setFile(null);
                            setFields([]);
                            setTableFields([]);
                            setContent({});
                            setMessage("");
                            setError("");

                            if (
                              fileInput.current
                            ) {
                              fileInput.current.value =
                                "";
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    {/* VISIBLE FILE BUTTON */}

                    <button
                      type="button"
                      className="choose-button"
                      onClick={() =>
                        fileInput.current?.click()
                      }
                    >
                      <Icon
                        name="upload"
                        size={15}
                      />

                      {file
                        ? "Choose another file"
                        : "Choose Word / PDF file"}
                    </button>

                    {/* ANALYZE BUTTON */}

                    <button
                      type="button"
                      className="analyze-button"
                      onClick={() =>
                        void analyzeTemplate()
                      }
                      disabled={
                        phase !== "idle" ||
                        !file
                      }
                    >
                      {phase ===
                      "analyzing" ? (
                        <>
                          <span className="spinner" />
                          Analyzing template...
                        </>
                      ) : (
                        <>
                          <Icon
                            name="check"
                            size={15}
                          />
                          Analyze Template
                        </>
                      )}
                    </button>

                    {file &&
                      /\.docx$/i.test(
                        file.name
                      ) &&
                      fields.length +
                        tableFields.length >
                        0 && (
                        <div className="analysis-note">
                          <span className="checkmark">
                            ✓
                          </span>

                          <div>
                            <strong>
                              Template analyzed
                            </strong>

                            <span>
                              {
                                fields.length
                              }{" "}
                              fields and{" "}
                              {
                                tableFields.length
                              }{" "}
                              table fields detected.
                            </span>
                          </div>
                        </div>
                      )}

                    {file &&
                      !/\.docx$/i.test(
                        file.name
                      ) && (
                        <div className="file-warning">
                          <strong>
                            PDF/DOC selected
                          </strong>

                          <span>
                            The current template
                            analyzer requires
                            DOCX. Use a .docx
                            Word template for
                            analysis.
                          </span>
                        </div>
                      )}

                  </div>
                )}

                {/* =================================================
                    CHAT / MANUAL
                ================================================== */}

                {mode === "ai" ? (
                  <>
                    <div className="chat-history">

                      <div className="assistant-message">
                        <span className="message-avatar">
                          D
                        </span>

                        <div>
                          <strong>
                            DocuAI
                          </strong>

                          <p>
                            Upload and analyze
                            your Word template,
                            then tell me what
                            document you want to
                            create.
                          </p>
                        </div>
                      </div>

                      {prompt && (
                        <div className="user-message">
                          <strong>
                            You
                          </strong>

                          <p>
                            {prompt}
                          </p>
                        </div>
                      )}

                      {Object.values(
                        content
                      ).some(Boolean) && (
                        <div className="assistant-message">
                          <span className="message-avatar">
                            D
                          </span>

                          <div>
                            <strong>
                              DocuAI
                            </strong>

                            <p>
                              I've generated
                              the content.
                              Review it in
                              the document
                              preview.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                    <form
                      className="chat-composer"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void generateAIContent();
                      }}
                    >

                      <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={(event) =>
                          setPrompt(
                            event.target.value
                          )
                        }
                        onKeyDown={
                          handlePromptKey
                        }
                        placeholder={
                          file
                            ? "Describe the document you want to create..."
                            : "Upload and analyze a DOCX template first..."
                        }
                        aria-label="Document instruction"
                      />

                      <div className="composer-bottom">

                        <div className="composer-tools">

                          {/* IMAGE UPLOAD */}

                          <button
                            type="button"
                            aria-label="Attach output screenshot"
                            onClick={() =>
                              imageInput.current?.click()
                            }
                          >
                            <Icon
                              name="plus"
                              size={17}
                            />
                          </button>

                          {outputImage && (
                            <span className="attachment-chip">

                              <img
                                src={imageUrl}
                                alt=""
                              />

                              {outputImage.name}

                              <button
                                type="button"
                                aria-label="Remove screenshot"
                                onClick={() => {
                                  if (
                                    imageUrl
                                  ) {
                                    URL.revokeObjectURL(
                                      imageUrl
                                    );
                                  }

                                  setOutputImage(
                                    null
                                  );

                                  setImageUrl(
                                    ""
                                  );
                                }}
                              >
                                ×
                              </button>

                            </span>
                          )}

                        </div>

                        <button
                          className="generate-button"
                          disabled={
                            phase !==
                              "idle" ||
                            !detectedFields.length
                          }
                        >
                          <Icon
                            name="send"
                            size={14}
                          />

                          {phase ===
                          "generating"
                            ? "Generating..."
                            : "Generate with AI"}
                        </button>

                      </div>
                    </form>
                  </>
                ) : (
                  <div className="manual-editor">

                    <div className="manual-heading">
                      <strong>
                        Manual document
                        content
                      </strong>

                      <span>
                        Edit each section
                        before generating
                        your DOCX.
                      </span>
                    </div>

                    {editorFields.map(
                      (field) => (
                        <label
                          key={field.name}
                        >
                          <span>
                            {field.label}
                          </span>

                          <textarea
                            className={
                              field.label.toLowerCase() ===
                              "program"
                                ? "code-field"
                                : ""
                            }
                            rows={
                              field.label.toLowerCase() ===
                              "program"
                                ? 8
                                : 3
                            }
                            value={fieldContent(
                              field
                            )}
                            onChange={(
                              event
                            ) =>
                              updateField(
                                field.name,
                                event.target
                                  .value
                              )
                            }
                            placeholder={`Enter your ${field.label.toLowerCase()}...`}
                          />
                        </label>
                      )
                    )}

                    <label>
                      <span>
                        Output Screenshot
                      </span>

                      <button
                        className="upload-box"
                        type="button"
                        onClick={() =>
                          imageInput.current?.click()
                        }
                      >
                        <Icon
                          name="upload"
                          size={19}
                        />

                        {outputImage
                          ? outputImage.name
                          : "Attach PNG, JPG, JPEG or WEBP"}
                      </button>
                    </label>

                    <button
                      className="generate-button manual-generate"
                      type="button"
                      onClick={() =>
                        void generateDocument()
                      }
                      disabled={
                        phase !==
                          "idle" ||
                        !detectedFields.length
                      }
                    >
                      {phase ===
                      "preparing"
                        ? "Preparing your DOCX..."
                        : "Generate Document"}
                    </button>

                  </div>
                )}

                {/* =================================================
                    HIDDEN FILE INPUTS

                    The inputs are intentionally hidden.
                    The visible buttons above open them.
                ================================================== */}

                <input
                  ref={fileInput}
                  type="file"
                  accept=".docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                  onChange={chooseFile}
                  style={{
                    display: "none",
                  }}
                />

                <input
                  ref={imageInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={chooseImage}
                  style={{
                    display: "none",
                  }}
                />

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="error-message">
                    <span>
                      {error}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setError("")
                      }
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* =================================================
                    STATUS
                ================================================== */}

                {message && (
                  <div className="status-message">
                    {phase !== "idle" && (
                      <span className="spinner" />
                    )}

                    {message}
                  </div>
                )}

              </section>

              {/* =================================================
                  PREVIEW PANEL
              ================================================== */}

              <section className="preview-panel">

                <div className="preview-header">

                  <div>
                    <span className="field-kicker">
                      DOCUMENT PREVIEW
                    </span>

                    <h2>
                      {resultUrl
                        ? "Generated Document"
                        : "Document preview"}
                    </h2>
                  </div>

                  {resultUrl && (
                    <span className="ready-badge">
                      Ready
                    </span>
                  )}

                </div>

                {editorFields.length ? (
                  <div className="document-sheet">

                    {editorFields.map(
                      (field) => (
                        <div
                          className="preview-section"
                          key={field.name}
                        >
                          <h3>
                            {field.label}
                          </h3>

                          {field.label.toLowerCase() ===
                          "program" ? (
                            <pre>
                              {fieldContent(
                                field
                              ) ||
                                "Your generated program will appear here."}
                            </pre>
                          ) : (
                            <p>
                              {fieldContent(
                                field
                              ) ||
                                "Content will appear here after generation."}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    {outputImage &&
                      imageUrl && (
                        <div className="preview-section">

                          <h3>
                            Output Screenshot
                          </h3>

                          <img
                            className="output-preview"
                            src={imageUrl}
                            alt="Uploaded output screenshot"
                          />

                        </div>
                      )}

                  </div>
                ) : (
                  <div className="preview-empty">

                    <Icon
                      name="file"
                      size={24}
                    />

                    <strong>
                      Your document preview
                    </strong>

                    <span>
                      Generated content
                      will appear here.
                    </span>

                  </div>
                )}

                {resultUrl && (
                  <div className="result-actions">

                    <a
                      className="download-button"
                      href={resultUrl}
                      download={resultName}
                    >
                      Download DOCX
                    </a>

                    <button
                      className="another-button"
                      onClick={resetWorkspace}
                    >
                      Generate Another
                    </button>

                  </div>
                )}

              </section>

            </div>
          </section>
        </main>

        <style jsx global>{styles}</style>

      </div>
    </ProtectedRoute>
  );
}

const styles = `
.dashboard-shell{
  --bg:#f1f4f8;
  --surface:#fff;
  --sidebar:#f8fafc;
  --text:#1d2940;
  --muted:#738097;
  --line:#dfe5ee;
  --accent:#7056df;
  --accent-soft:#eeeaff;

  min-height:100vh;
  display:flex;
  background:var(--bg);
  color:var(--text);
  font-family:"Avenir Next",Avenir,"Segoe UI",sans-serif;
}

.dashboard-shell.dark{
  --bg:#141923;
  --surface:#1d2532;
  --sidebar:#19212d;
  --text:#f1f3f8;
  --muted:#98a4b7;
  --line:#303a4a;
  --accent:#9a85f5;
  --accent-soft:#302951;
}

.dashboard-sidebar{
  width:248px;
  flex:0 0 248px;
  padding:24px 14px 16px;
  background:var(--sidebar);
  border-right:1px solid var(--line);
  display:flex;
  flex-direction:column;
}

.brand-row,
.mobile-brand{
  display:flex;
  align-items:center;
  gap:9px;
  padding:0 9px;
  font-weight:800;
  font-size:16px;
}

.brand-mark{
  display:grid;
  place-items:center;
  width:23px;
  height:23px;
  border-radius:7px;
  background:var(--accent);
  color:#fff;
  font-size:12px;
}

.new-document{
  height:40px;
  margin:28px 0 18px;
  border:0;
  border-radius:9px;
  background:var(--accent);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  font:inherit;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 7px 16px #7056df28;
}

.primary-nav,
.sidebar-bottom{
  display:grid;
  gap:3px;
}

.primary-nav a,
.sidebar-bottom a,
.theme-toggle{
  display:flex;
  align-items:center;
  gap:11px;
  min-height:36px;
  padding:0 11px;
  border:0;
  border-radius:8px;
  background:transparent;
  color:var(--muted);
  font:inherit;
  font-size:12px;
  text-decoration:none;
  text-align:left;
  cursor:pointer;
}

.primary-nav a:hover,
.sidebar-bottom a:hover,
.theme-toggle:hover,
.primary-nav a.active{
  color:var(--accent);
  background:var(--accent-soft);
}

.recent-section{
  margin-top:30px;
}

.section-label,
.eyebrow,
.field-kicker{
  margin:0 10px 11px;
  color:var(--muted);
  font-size:9px;
  font-weight:800;
  letter-spacing:.14em;
  text-transform:uppercase;
}

.recent-document{
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px 10px;
  color:var(--muted);
  font-size:11px;
  text-decoration:none;
}

.recent-document span{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  flex:1;
}

.empty-recent{
  padding:0 10px;
  color:var(--muted);
  font-size:11px;
}

.sidebar-bottom{
  margin-top:auto;
  padding-top:14px;
  border-top:1px solid var(--line);
}

.theme-toggle{
  justify-content:space-between;
  width:100%;
}

.theme-toggle span:first-child{
  display:flex;
  align-items:center;
  gap:11px;
}

.switch{
  width:25px;
  height:14px;
  padding:2px;
  border-radius:99px;
  background:#cbd2dd;
}

.switch i{
  display:block;
  width:10px;
  height:10px;
  border-radius:50%;
  background:#fff;
  transition:transform .2s;
}

.switch.on{
  background:var(--accent);
}

.switch.on i{
  transform:translateX(11px);
}

.profile{
  display:flex;
  align-items:center;
  gap:9px;
  margin:13px 8px 0;
  padding-top:13px;
  border:0;
  border-top:1px solid var(--line);
  background:transparent;
  color:var(--text);
  text-align:left;
  cursor:pointer;
}

.avatar,
.mini-avatar{
  display:grid;
  place-items:center;
  border-radius:50%;
  background:#d9c9ba;
  color:#5d4b3c;
  font-size:9px;
  font-weight:800;
  object-fit:cover;
}

.avatar{
  width:29px;
  height:29px;
  flex:0 0 29px;
}

.profile strong,
.profile small{
  display:block;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:160px;
}

.profile strong{
  font-size:11px;
}

.profile small{
  margin-top:2px;
  color:var(--muted);
  font-size:9px;
}

.dashboard-main{
  flex:1;
  min-width:0;
}

.dashboard-header{
  height:68px;
  display:flex;
  align-items:center;
  padding:0 38px;
  border-bottom:1px solid var(--line);
}

.breadcrumb{
  color:var(--muted);
  font-size:11px;
}

.breadcrumb b{
  margin:0 9px;
  color:var(--line);
}

.breadcrumb strong{
  color:var(--text);
}

.header-actions{
  display:flex;
  align-items:center;
  gap:17px;
  margin-left:auto;
}

.header-theme,
.mobile-menu{
  border:0;
  background:none;
  color:var(--muted);
  cursor:pointer;
}

.mini-avatar{
  width:29px;
  height:29px;
}

.mobile-menu,
.mobile-brand,
.drawer-backdrop{
  display:none;
}

.dashboard-content{
  width:min(1240px,100%);
  margin:auto;
  padding:48px 34px 74px;
}

.studio-heading{
  margin-bottom:28px;
}

.studio-heading .eyebrow{
  margin-left:0;
  color:var(--accent);
}

.studio-heading h1{
  margin:0;
  font-size:36px;
  letter-spacing:-.045em;
}

.studio-heading>p:last-child{
  margin:9px 0 0;
  color:var(--muted);
  font-size:13px;
}

.mode-tabs{
  display:flex;
  width:max-content;
  gap:4px;
  padding:4px;
  margin-bottom:17px;
  border:1px solid var(--line);
  border-radius:10px;
  background:var(--surface);
}

.mode-tabs button{
  border:0;
  border-radius:7px;
  padding:10px 16px;
  background:transparent;
  color:var(--muted);
  font:inherit;
  font-size:10px;
  font-weight:800;
  letter-spacing:.06em;
  cursor:pointer;
}

.mode-tabs button.selected{
  background:var(--accent);
  color:#fff;
}

.generation-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(360px,.88fr);
  gap:18px;
  align-items:start;
}

.conversation-panel,
.preview-panel{
  min-width:0;
}

/* ============================================================
   TEMPLATE UPLOAD CARD
============================================================ */

.template-card,
.chat-composer,
.manual-editor,
.preview-panel{
  border:1px solid var(--line);
  border-radius:13px;
  background:var(--surface);
  box-shadow:0 8px 24px #26344b0a;
}

.template-card{
  padding:16px;
  margin-bottom:14px;
}

.template-card-top{
  display:flex;
  justify-content:space-between;
  gap:12px;
}

.template-card-top>div{
  min-width:0;
  flex:1;
}

.field-kicker{
  display:block;
  margin:0 0 7px;
  font-size:8px;
}

.template-card strong{
  display:flex;
  align-items:center;
  gap:7px;
  font-size:12px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.text-button{
  border:0;
  background:none;
  color:var(--accent);
  font:inherit;
  font-size:10px;
  cursor:pointer;
}

.file-meta{
  margin:7px 0 12px;
  color:var(--muted);
  font-size:10px;
}

.choose-button,
.analyze-button{
  width:100%;
  margin-top:8px;
  border-radius:8px;
  padding:10px;
  font:inherit;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}

.choose-button{
  border:1px solid var(--accent);
  background:transparent;
  color:var(--accent);
}

.choose-button:hover{
  background:var(--accent-soft);
}

.analyze-button{
  border:1px solid var(--accent);
  background:var(--accent);
  color:#fff;
}

.analyze-button:hover:not(:disabled){
  filter:brightness(.96);
}

.analyze-button:disabled{
  opacity:.55;
  cursor:not-allowed;
}

.analysis-note{
  display:flex;
  align-items:center;
  gap:9px;
  margin:12px 0 0;
  padding:10px 12px;
  border:1px solid #b7dfcb;
  border-radius:9px;
  background:#effaf4;
}

.checkmark{
  display:grid;
  place-items:center;
  width:22px;
  height:22px;
  border-radius:50%;
  background:#39a56b;
  color:#fff;
  font-size:12px;
  flex:0 0 22px;
}

.analysis-note strong,
.analysis-note span{
  display:block;
}

.analysis-note strong{
  color:#27744f;
  font-size:11px;
}

.analysis-note span{
  margin-top:2px;
  color:#5b8b72;
  font-size:10px;
}

.file-warning{
  display:flex;
  flex-direction:column;
  gap:3px;
  margin-top:12px;
  padding:10px 12px;
  border:1px solid #ead7a5;
  border-radius:9px;
  background:#fff9e8;
}

.file-warning strong{
  color:#8a6918;
  font-size:10px;
}

.file-warning span{
  color:#947d45;
  font-size:9px;
  line-height:1.4;
}

/* ============================================================
   CHAT
============================================================ */

.chat-history{
  display:grid;
  gap:12px;
  min-height:160px;
  padding:20px 4px;
}

.assistant-message,
.user-message{
  display:flex;
  gap:9px;
  max-width:92%;
  font-size:11px;
}

.assistant-message p,
.user-message p{
  margin:4px 0 0;
  color:var(--muted);
  line-height:1.5;
}

.user-message{
  display:block;
  align-self:end;
  margin-left:auto;
  padding:10px 12px;
  border-radius:10px;
  background:var(--accent-soft);
}

.user-message p{
  color:var(--text);
}

.message-avatar{
  display:grid;
  place-items:center;
  flex:0 0 23px;
  width:23px;
  height:23px;
  border-radius:7px;
  background:var(--accent);
  color:#fff;
  font-size:10px;
  font-weight:800;
}

.chat-composer{
  padding:13px;
}

.chat-composer textarea{
  width:100%;
  min-height:86px;
  resize:vertical;
  border:0;
  outline:0;
  background:transparent;
  color:var(--text);
  font:inherit;
  font-size:13px;
  line-height:1.55;
}

.chat-composer textarea::placeholder{
  color:var(--muted);
}

.composer-bottom{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

.composer-tools{
  display:flex;
  align-items:center;
  gap:7px;
  min-width:0;
}

.composer-tools>button{
  display:grid;
  place-items:center;
  width:30px;
  height:28px;
  border:1px solid var(--line);
  border-radius:7px;
  background:transparent;
  color:var(--muted);
  cursor:pointer;
}

.attachment-chip{
  display:flex;
  align-items:center;
  gap:5px;
  max-width:210px;
  padding:4px 7px;
  border:1px solid var(--line);
  border-radius:6px;
  color:var(--muted);
  font-size:9px;
  overflow:hidden;
}

.attachment-chip img{
  width:19px;
  height:19px;
  object-fit:cover;
  border-radius:3px;
}

.attachment-chip button{
  border:0;
  background:none;
  color:var(--muted);
  font-size:14px;
  cursor:pointer;
}

/* ============================================================
   BUTTONS
============================================================ */

.generate-button,
.download-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border:0;
  border-radius:8px;
  padding:10px 14px;
  background:var(--accent);
  color:#fff;
  font:inherit;
  font-size:11px;
  font-weight:750;
  cursor:pointer;
  text-decoration:none;
}

.generate-button:disabled{
  opacity:.55;
  cursor:not-allowed;
}

/* ============================================================
   MANUAL EDITOR
============================================================ */

.manual-editor{
  display:grid;
  gap:12px;
  padding:17px;
}

.manual-heading{
  display:grid;
  gap:4px;
  margin-bottom:3px;
}

.manual-heading strong{
  font-size:13px;
}

.manual-heading span{
  color:var(--muted);
  font-size:10px;
}

.manual-editor label{
  display:grid;
  gap:7px;
  color:var(--text);
  font-size:10px;
  font-weight:750;
}

.manual-editor textarea{
  width:100%;
  resize:vertical;
  min-height:68px;
  padding:10px;
  border:1px solid var(--line);
  border-radius:7px;
  outline:0;
  background:transparent;
  color:var(--text);
  font:inherit;
  font-size:12px;
  line-height:1.5;
}

.manual-editor textarea:focus{
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-soft);
}

.manual-editor .code-field{
  min-height:145px;
  background:#202938;
  color:#e0e9f3;
  border-color:#202938;
  font-family:Consolas,"Courier New",monospace;
  line-height:1.7;
}

.upload-box{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  min-height:70px;
  border:1px dashed #aeb9cb;
  border-radius:8px;
  background:transparent;
  color:var(--accent);
  font:inherit;
  font-size:10px;
  cursor:pointer;
}

.manual-generate{
  width:100%;
  margin-top:4px;
}

/* ============================================================
   PREVIEW
============================================================ */

.preview-panel{
  padding:17px;
}

.preview-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom:14px;
}

.preview-header h2{
  margin:0;
  font-size:16px;
  letter-spacing:-.02em;
}

.ready-badge{
  padding:5px 8px;
  border-radius:20px;
  background:#effaf4;
  color:#27744f;
  font-size:9px;
  font-weight:800;
}

.document-sheet{
  min-height:420px;
  padding:22px 20px;
  border:1px solid #e2e4e8;
  background:#fff;
  color:#202938;
  box-shadow:0 5px 15px #26344b12;
}

.preview-section{
  padding:0 0 15px;
  margin-bottom:15px;
  border-bottom:1px solid #edf0f3;
}

.preview-section:last-child{
  margin-bottom:0;
  border-bottom:0;
}

.preview-section h3{
  margin:0 0 7px;
  color:var(--accent);
  font-size:9px;
  font-weight:800;
  letter-spacing:.1em;
  text-transform:uppercase;
}

.preview-section p{
  margin:0;
  color:#526075;
  font-size:11px;
  line-height:1.6;
  white-space:pre-wrap;
}

.preview-section pre{
  margin:0;
  padding:11px;
  border-radius:6px;
  background:#202938;
  color:#e0e9f3;
  font-family:Consolas,"Courier New",monospace;
  font-size:10px;
  line-height:1.6;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}

.output-preview{
  display:block;
  width:100%;
  max-height:180px;
  object-fit:contain;
  border-radius:6px;
}

.preview-empty{
  display:grid;
  place-items:center;
  gap:9px;
  min-height:420px;
  border:1px dashed #b7c1d0;
  border-radius:8px;
  color:var(--muted);
  text-align:center;
}

.preview-empty strong{
  color:var(--text);
  font-size:13px;
}

.preview-empty span{
  font-size:10px;
}

.result-actions{
  display:flex;
  gap:8px;
  margin-top:14px;
}

.result-actions a,
.another-button{
  flex:1;
}

.another-button{
  border:1px solid var(--line);
  border-radius:8px;
  background:transparent;
  color:var(--muted);
  font:inherit;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
}

/* ============================================================
   MESSAGES
============================================================ */

.error-message,
.status-message{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-top:13px;
  padding:10px 12px;
  border-radius:8px;
  font-size:10px;
}

.error-message{
  background:#fff0ed;
  color:#b34e46;
}

.error-message button{
  border:0;
  background:none;
  color:inherit;
  font:inherit;
  font-weight:800;
  text-decoration:underline;
  cursor:pointer;
}

.status-message{
  justify-content:flex-start;
  background:var(--accent-soft);
  color:var(--accent);
}

.spinner{
  width:12px;
  height:12px;
  border:2px solid currentColor;
  border-right-color:transparent;
  border-radius:50%;
  animation:spin .7s linear infinite;
  flex:0 0 12px;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media(max-width:900px){

  .generation-layout{
    grid-template-columns:1fr;
  }

  .preview-panel{
    order:2;
  }

  .conversation-panel{
    order:1;
  }
}

@media(max-width:700px){

  .dashboard-shell{
    display:block;
  }

  .dashboard-sidebar{
    position:fixed;
    z-index:20;
    inset:0 auto 0 0;
    width:min(84vw,300px);
    transform:translateX(-105%);
    transition:transform .2s;
    box-shadow:16px 0 35px #0003;
  }

  .dashboard-sidebar.drawer-visible{
    transform:translateX(0);
  }

  .drawer-backdrop{
    display:block;
    position:fixed;
    z-index:19;
    inset:0;
    border:0;
    background:#0008;
  }

  .dashboard-header{
    height:60px;
    padding:0 17px;
    justify-content:space-between;
  }

  .mobile-menu,
  .mobile-brand{
    display:flex;
    align-items:center;
  }

  .mobile-brand{
    gap:8px;
    padding:0;
    font-size:13px;
  }

  .breadcrumb{
    display:none;
  }

  .dashboard-content{
    padding:35px 17px 55px;
  }

  .studio-heading{
    margin-bottom:24px;
  }

  .studio-heading h1{
    font-size:29px;
  }

  .studio-heading>p:last-child{
    font-size:12px;
    line-height:1.5;
  }

  .mode-tabs{
    width:100%;
  }

  .mode-tabs button{
    flex:1;
    padding:10px 5px;
  }

  .template-card{
    padding:14px;
  }

  .chat-history{
    min-height:130px;
    padding:15px 2px;
  }

  .chat-composer{
    padding:12px;
  }

  .composer-bottom{
    align-items:flex-end;
  }

  .generate-button{
    white-space:normal;
    text-align:center;
  }

  .attachment-chip{
    max-width:150px;
  }

  .document-sheet{
    padding:17px 14px;
  }

  .result-actions{
    flex-direction:column;
  }

  .result-actions a,
  .another-button{
    width:100%;
    min-height:38px;
  }

  .preview-empty{
    min-height:250px;
  }

  .manual-editor{
    padding:14px;
  }

  .template-card-top{
    align-items:flex-start;
  }
}

@media(prefers-reduced-motion:reduce){

  .dashboard-shell *{
    animation:none!important;
    transition:none!important;
  }
}
`;