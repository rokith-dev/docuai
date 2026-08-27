"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import { API_BASE_URL } from "../../lib/api";

interface DocumentItem {
	id: number;
	document_name: string;
	template_name: string;
	created_at: string;
	is_favorite: boolean;
	projects?: { name: string } | null;
}


export default function DocumentsPage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");

	async function loadDocuments() {
		const response = await fetch(`${API_BASE_URL}/api/documents`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load documents.");
		setDocuments(data.documents ?? []);
	}

	useEffect(() => { loadDocuments().catch((err) => setError(err.message)); }, []);

	async function action(id: number, path: string, method: string) {
		const suffix = path ? `/${path}` : "";
		const response = await fetch(`${API_BASE_URL}/api/documents/${id}${suffix}`, { method });
		if (!response.ok) throw new Error("Document action failed.");
		await loadDocuments();
	}

	const filtered = documents.filter((document) => document.document_name.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || (filter === "Favorites" && document.is_favorite) || (filter === "Projects" && document.projects)));

	return (
		<AppShell title="Documents"><div className="page-heading"><div><h1>Documents</h1><p>Manage and access your generated documents.</p></div><Link href="/create" className="primary-button">＋ New Document</Link></div>
			<div className="surface" style={{ padding: 16 }}><div className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents..." className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-transparent p-3 text-sm outline-none" /> <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-sm"><option>All</option><option>Recent</option><option>Favorites</option><option>Projects</option></select></div>
				{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-4 grid gap-3">{filtered.map((document) => <article key={document.id} className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">▤ {document.document_name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{document.projects?.name ?? "No project"} · {new Date(document.created_at).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><a className="primary-button" href={`${API_BASE_URL}/api/documents/${document.id}/download`}>Download</a><button className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" onClick={() => action(document.id, "favorite", document.is_favorite ? "DELETE" : "POST").catch((err) => setError(err.message))}>{document.is_favorite ? "★ Favorited" : "☆ Favorite"}</button><button className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600" onClick={() => action(document.id, "", "DELETE").catch((err) => setError(err.message))}>Delete</button></div></article>)}{!filtered.length && <div className="surface empty-state"><div className="empty-icon">▤</div><h2>No documents yet</h2><p>Create your first AI-powered document.</p><Link href="/create" className="primary-button">Create Document</Link></div>}</div></div></AppShell>
	);
}
