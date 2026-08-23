"use client";

import { useEffect, useState } from "react";

interface DocumentItem { id: number; document_name: string; template_name: string; }
const API = "http://127.0.0.1:8000";

export default function FavoritesPage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [error, setError] = useState("");

	async function load() {
		const response = await fetch(`${API}/api/favorites`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load favorites.");
		setDocuments(data.documents ?? []);
	}

	useEffect(() => { load().catch((err) => setError(err.message)); }, []);

	async function remove(id: number) {
		const response = await fetch(`${API}/api/documents/${id}/favorite`, { method: "DELETE" });
		if (!response.ok) { setError("Failed to remove favorite."); return; }
		await load();
	}

	return (
		<main className="min-h-screen bg-gray-50 px-6 py-10"><div className="mx-auto max-w-5xl">
			<h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-6 space-y-4">
				{documents.map((document) => <article key={document.id} className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">{document.document_name}</h2><p className="text-sm text-gray-500">Template: {document.template_name}</p><div className="mt-4 flex gap-3"><a className="rounded-lg bg-black px-4 py-2 text-sm text-white" href={`${API}/api/documents/${document.id}/download`}>Download</a><button className="rounded-lg border px-4 py-2 text-sm" onClick={() => remove(document.id)}>Remove favorite</button></div></article>)}
				{!documents.length && <p className="text-gray-500">No favorite documents yet.</p>}
			</div>
		</div></main>
	);
}
