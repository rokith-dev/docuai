"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { API_BASE_URL, apiFetch } from "../../lib/api";

interface Project { id: number; name: string; description?: string; document_count?: number; }

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");

	async function load() {
		const response = await apiFetch("/api/projects");
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail || "Failed to load projects.");
		setProjects(data.projects ?? []);
	}
	useEffect(() => { load().catch((err) => setError(err.message)); }, []);

	async function create(event: FormEvent) {
		event.preventDefault();
		const response = await apiFetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
		if (!response.ok) { setError("Failed to create project."); return; }
		setName(""); setDescription(""); await load();
	}

	async function remove(id: number) {
		const response = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
		if (!response.ok) { const data = await response.json(); setError(data.detail || "Failed to delete project."); return; }
		await load();
	}

	return (
		<AppShell title="Projects"><div className="page-heading"><div><h1>Projects</h1><p>Organize your documents into projects.</p></div></div>
			<form onSubmit={create} className="surface flex flex-col gap-3 p-5 sm:flex-row">
				<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="rounded-lg border p-3" />
				<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="rounded-lg border p-3 sm:flex-1" />
				<button className="rounded-lg bg-black px-5 py-2 text-white">Create project</button>
			</form>
			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-6 grid gap-4 sm:grid-cols-2">{projects.map((project) => <article key={project.id} className="surface p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold">{project.name}</h2><p className="mt-2 text-sm text-[var(--muted)]">{project.description || "No description yet."}</p><p className="mt-5 text-xs text-[var(--muted)]">{project.document_count ?? 0} documents</p></div><button onClick={() => remove(project.id)} className="text-sm text-red-600">Delete</button></div></article>)}{!projects.length && <div className="surface empty-state sm:col-span-2"><div className="empty-icon">▰</div><h2>No projects yet</h2><p>Create a project to organize your documents.</p></div>}</div></AppShell>
	);
}
