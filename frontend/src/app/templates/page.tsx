"use client";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";

export default function TemplatesPage() {
	return <AppShell title="Templates"><div className="page-heading"><div><h1>Templates</h1><p>Upload and manage your document templates.</p></div><Link href="/create" className="primary-button">＋ Upload Template</Link></div><div className="surface empty-state"><div className="empty-icon">▥</div><h2>Your template library is ready</h2><p>Start with a DOCX template to detect fields and generate a document.</p><Link href="/create" className="primary-button">Use a Template</Link></div></AppShell>;
}
