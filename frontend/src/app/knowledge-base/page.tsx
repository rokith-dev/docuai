"use client";
import AppShell from "../../components/layout/AppShell";

export default function KnowledgeBasePage() {
	return <AppShell title="Knowledge Base"><div className="page-heading"><div><h1>Knowledge Base</h1><p>Store information DocuAI can use when creating documents.</p></div><button className="primary-button" type="button">＋ Add Knowledge</button></div><div className="surface empty-state"><div className="empty-icon">▱</div><h2>No knowledge added yet</h2><p>Add documents, notes and references to give DocuAI more context.</p><button className="primary-button" type="button">Add Knowledge</button></div></AppShell>;
}
