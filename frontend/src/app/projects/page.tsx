"use client";

import { FormEvent, useEffect, useState } from "react";

interface Project { id: number; name: string; description?: string; document_count?: number; }
const API = "http://127.0.0.1:8000";

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");

	async function load() {
		const response = await fetch(`${API}/api/projects`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load projects.");
		setProjects(data.projects ?? []);
	}
	useEffect(() => { load().catch((err) => setError(err.message)); }, []);

	async function create(event: FormEvent) {
		event.preventDefault();
		const response = await fetch(`${API}/api/projects`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
		if (!response.ok) { setError("Failed to create project."); return; }
		setName(""); setDescription(""); await load();
	}

	async function remove(id: number) {
		const response = await fetch(`${API}/api/projects/${id}`, { method: "DELETE" });
		if (!response.ok) { const data = await response.json(); setError(data.detail || "Failed to delete project."); return; }
		await load();
	}

	return (
		<main className="min-h-screen bg-gray-50 px-6 py-10"><div className="mx-auto max-w-5xl">
			<h1 className="text-3xl font-bold text-gray-900">Projects</h1>
			<form onSubmit={create} className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-5 sm:flex-row">
				<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="rounded-lg border p-3" />
				<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="rounded-lg border p-3 sm:flex-1" />
				<button className="rounded-lg bg-black px-5 py-2 text-white">Create project</button>
			</form>
			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-6 space-y-4">{projects.map((project) => <article key={project.id} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">{project.name}</h2><p className="text-sm text-gray-500">{project.document_count ?? 0} documents</p></div><button onClick={() => remove(project.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button></div></article>)}</div>
		</div></main>
	);
}
