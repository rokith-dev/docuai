"use client";

import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { API_BASE_URL } from "../../lib/api";

interface DocumentItem { id: number; document_name: string; template_name: string; }

export default function FavoritesPage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [error, setError] = useState("");

	async function load() {
		const response = await fetch(`${API_BASE_URL}/api/favorites`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load favorites.");
		setDocuments(data.documents ?? []);
	}

	useEffect(() => { load().catch((err) => setError(err.message)); }, []);

	async function remove(id: number) {
		const response = await fetch(`${API_BASE_URL}/api/documents/${id}/favorite`, { method: "DELETE" });
		if (!response.ok) { setError("Failed to remove favorite."); return; }
		await load();
	}

	return (
		<AppShell title="Favorites"><div className="page-heading"><div><h1>Favorites</h1><p>Quick access to your important documents.</p></div></div>
			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-6 grid gap-3">{documents.map((document) => <article key={document.id} className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">★ {document.document_name}</h2><p className="mt-1 text-sm text-[var(--muted)]">Template: {document.template_name}</p></div><div className="flex gap-2"><a className="primary-button" href={`${API_BASE_URL}/api/documents/${document.id}/download`}>Download</a><button className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" onClick={() => remove(document.id)}>Remove</button></div></article>)}{!documents.length && <div className="surface empty-state"><div className="empty-icon">☆</div><h2>No favorites yet</h2><p>Star documents to access them quickly.</p></div>}</div></AppShell>
	);
}
