"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { API_BASE_URL, apiFetch } from "../../lib/api";
import { useTheme } from "../theme/ThemeProvider";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthProvider";
import { useRouter } from "next/navigation";

const navigation = [
  ["Dashboard", "/dashboard", "□"],
  ["Documents", "/documents", "▤"],
  ["Templates", "/templates", "▥"],
  ["Favorites", "/favorites", "☆"],
];

type DocumentItem = { id: number; document_name?: string; title?: string };

export default function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [width, setWidth] = useState(264);
  const [recent, setRecent] = useState<DocumentItem[]>([]);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const resizing = useRef(false);
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const profileName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Account";
  const initials = profileName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    apiFetch("/api/documents").then((response) => response.ok ? response.json() : null)
      .then((data) => setRecent((data?.documents ?? []).slice(0, 4))).catch(() => setRecent([]));
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => { if (resizing.current) setWidth(Math.min(400, Math.max(220, event.clientX))); };
    const stop = () => { resizing.current = false; };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
  }, []);

  return (
    <ProtectedRoute><div className={`app-shell ${theme}`}>
      {drawerOpen && <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
      <aside className={`app-sidebar ${drawerOpen ? "drawer-visible" : ""}`} style={{ width }}>
        <div className="app-brand"><span className="brand-mark">D</span><strong>DocuAI</strong></div>
        <Link href="/dashboard" className="new-document" onClick={() => setDrawerOpen(false)}>＋ New Document</Link>
        <nav className="app-nav" aria-label="Main navigation">
          {navigation.map(([label, href, icon]) => <Link key={href} href={href} className={title === label ? "active" : ""} onClick={() => setDrawerOpen(false)}><span>{icon}</span>{label}</Link>)}
        </nav>
        <div className="recent-documents"><p className="nav-label">RECENT DOCUMENTS</p>{recent.map((item) => <Link href="/documents" key={item.id} title={item.document_name || item.title || "Untitled"}>▤ <span>{item.document_name || item.title || "Untitled document"}</span></Link>)}{!recent.length && <small>No documents yet</small>}</div>
        <div className="sidebar-footer"><Link href="/settings">⚙ Settings</Link><Link href="/help">? Help &amp; Feedback</Link><button className="theme-button" onClick={toggleTheme}>{theme === "light" ? "☼ Light mode" : "◐ Dark mode"}<span className={`switch ${theme === "dark" ? "on" : ""}`}><i /></span></button><button className="profile" onClick={async () => { await signOut(); router.replace("/"); }}>{avatarUrl && !avatarFailed ? <img className="avatar" src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} /> : <span className="avatar">{initials}</span>}<span><b>{profileName}</b><small>{user?.email}</small></span></button></div>
        <button className="resize-handle" aria-label="Resize sidebar" onPointerDown={() => { resizing.current = true; }} />
      </aside>
      <main className="app-main"><header className="app-header"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>☰</button><div className="mobile-brand"><span className="brand-mark">D</span> DocuAI</div><div className="crumb">Workspace <span>/</span> <b>{title}</b></div><div className="header-tools"><button aria-label="Toggle theme" onClick={toggleTheme}>{theme === "light" ? "☼" : "◐"}</button>{avatarUrl && !avatarFailed ? <img className="avatar mini" src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} /> : <span className="avatar mini">{initials}</span>}</div></header><div className="app-content">{children}</div></main>
    </div></ProtectedRoute>
  );
}
