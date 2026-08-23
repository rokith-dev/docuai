"use client";

import { useEffect, useState } from "react";

interface DocumentItem {
	id: number;
	document_name: string;
	template_name: string;
	created_at: string;
	is_favorite: boolean;
	projects?: { name: string } | null;
}

const API = "http://127.0.0.1:8000";

export default function DocumentsPage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [error, setError] = useState("");

	async function loadDocuments() {
		const response = await fetch(`${API}/api/documents`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load documents.");
		setDocuments(data.documents ?? []);
	}

	useEffect(() => { loadDocuments().catch((err) => setError(err.message)); }, []);

	async function action(id: number, path: string, method: string) {
		const suffix = path ? `/${path}` : "";
		const response = await fetch(`${API}/api/documents/${id}${suffix}`, { method });
		if (!response.ok) throw new Error("Document action failed.");
		await loadDocuments();
	}

	return (
		<main className="min-h-screen bg-gray-50 px-6 py-10">
			<div className="mx-auto max-w-5xl">
				<h1 className="text-3xl font-bold text-gray-900">Documents</h1>
				{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
				<div className="mt-6 space-y-4">
					{documents.map((document) => (
						<article key={document.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
							<h2 className="font-semibold text-gray-900">{document.document_name}</h2>
							<p className="mt-1 text-sm text-gray-500">Template: {document.template_name}</p>
							<p className="text-sm text-gray-500">Project: {document.projects?.name ?? "None"}</p>
							<p className="text-sm text-gray-500">Created: {new Date(document.created_at).toLocaleString()}</p>
							<div className="mt-4 flex gap-3">
								<a className="rounded-lg bg-black px-4 py-2 text-sm text-white" href={`${API}/api/documents/${document.id}/download`}>Download</a>
								<button className="rounded-lg border px-4 py-2 text-sm" onClick={() => action(document.id, "favorite", document.is_favorite ? "DELETE" : "POST").catch((err) => setError(err.message))}>{document.is_favorite ? "Remove favorite" : "Favorite"}</button>
								<button className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700" onClick={() => action(document.id, "", "DELETE").catch((err) => setError(err.message))}>Delete</button>
							</div>
						</article>
					))}
					{!documents.length && <p className="text-gray-500">No saved documents yet.</p>}
				</div>
			</div>
		</main>
	);
}
