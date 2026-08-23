"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface RecentDocument {
	id: number;
	document_name?: string;
	title?: string;
	template_name?: string;
	created_at?: string;
}

type Theme = "light" | "dark";

const API = "http://127.0.0.1:8000";

function Icon({ name, size = 16 }: { name: string; size?: number }) {
	const paths: Record<string, React.ReactNode> = {
		grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
		file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 13h6M9 17h6" /></>,
		folder: <path d="M3 6h7l2 2h9v11H3z" />,
		template: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
		star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />,
		book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></>,
		settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.5v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.6 1z" /></>,
		help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-1 1-1.9 1.2-1.9 2.7M12 17h.01" /></>,
		sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
		moon: <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3z" />,
		send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
		plus: <><path d="M12 5v14M5 12h14" /></>,
		menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
		dots: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
	};

	return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navigation = [
	["Dashboard", "/dashboard", "grid"],
	["Documents", "/documents", "file"],
	["Projects", "/projects", "folder"],
	["Templates", "/templates", "template"],
	["Favorites", "/favorites", "star"],
	["Knowledge Base", "/knowledge-base", "book"],
] as const;

export default function DashboardPage() {
	const [theme, setTheme] = useState<Theme>("light");
	const [sidebarWidth, setSidebarWidth] = useState(264);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
	const resizing = useRef(false);

	useEffect(() => {
		const savedTheme = window.localStorage.getItem("docuai-theme");
		if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
		fetch(`${API}/api/documents`)
			.then((response) => response.ok ? response.json() : null)
			.then((data) => setRecentDocuments((data?.documents ?? []).slice(0, 4)))
			.catch(() => setRecentDocuments([]));
	}, []);

	useEffect(() => {
		window.localStorage.setItem("docuai-theme", theme);
	}, [theme]);

	useEffect(() => {
		function move(event: PointerEvent) {
			if (!resizing.current) return;
			setSidebarWidth(Math.min(400, Math.max(220, event.clientX)));
		}
		function stop() { resizing.current = false; }
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", stop);
		return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
	}, []);

	function toggleTheme() {
		setTheme((current) => current === "light" ? "dark" : "light");
	}

	return (
		<div className={`dashboard-shell ${theme}`}>
			{drawerOpen && <button aria-label="Close menu" className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
			<aside className={`dashboard-sidebar ${drawerOpen ? "drawer-visible" : ""}`} style={{ width: sidebarWidth }}>
				<div className="brand-row"><div className="brand-mark">D</div><span>DocuAI</span></div>
				<Link href="/create" className="new-document" onClick={() => setDrawerOpen(false)}><Icon name="plus" size={14} /> New Document</Link>
				<nav className="primary-nav" aria-label="Main navigation">
					{navigation.map(([label, href, icon]) => <Link key={label} href={href} className={label === "Dashboard" ? "active" : ""} onClick={() => setDrawerOpen(false)}><Icon name={icon} size={15} /><span>{label}</span></Link>)}
				</nav>
				<div className="recent-section">
					<p className="section-label">Recent Documents</p>
					{recentDocuments.map((document) => <Link href="/documents" className="recent-document" key={document.id} title={document.document_name || document.title || "Untitled document"} onClick={() => setDrawerOpen(false)}><Icon name="file" size={14} /><span>{document.document_name || document.title || "Untitled document"}</span><Icon name="dots" size={14} /></Link>)}
					{!recentDocuments.length && <p className="empty-recent">No documents yet</p>}
				</div>
				<div className="sidebar-bottom">
					<Link href="/dashboard"><Icon name="settings" size={15} /> Settings</Link>
					<Link href="/dashboard"><Icon name="help" size={15} /> Help &amp; Feedback</Link>
					<button className="theme-toggle" onClick={toggleTheme}><span><Icon name={theme === "light" ? "sun" : "moon"} size={15} /> {theme === "light" ? "Light" : "Dark"} mode</span><span className={`switch ${theme === "dark" ? "on" : ""}`}><i /></span></button>
					<div className="profile"><div className="avatar">JD</div><div><strong>Workspace User</strong><small>workspace@docuai.local</small></div></div>
				</div>
				<button className="resize-handle" aria-label="Resize sidebar" onPointerDown={() => { resizing.current = true; }} />
			</aside>
			<main className="dashboard-main">
				<header className="dashboard-header"><button className="mobile-menu" aria-label="Open menu" onClick={() => setDrawerOpen(true)}><Icon name="menu" size={18} /></button><div className="mobile-brand"><div className="brand-mark">D</div><span>DocuAI</span></div><div className="breadcrumb">Workspace <b>/</b> <strong>AI Document Studio</strong></div><div className="header-actions"><span className="credits">✦ 850 AI Credits</span><button aria-label="Settings" className="icon-button"><Icon name="settings" size={15} /></button><div className="mini-avatar">JD</div></div></header>
				<section className="dashboard-content">
					<div className="welcome"><p className="eyebrow">AI DOCUMENT STUDIO</p><h1>Good morning <span aria-hidden="true">👋</span></h1><p>What would you like to create today?</p></div>
					<div className="composer-wrap"><div className="composer"><input aria-label="Document prompt" placeholder="What would you like to create?" /><div className="composer-footer"><div className="composer-tools"><button aria-label="Attach file"><Icon name="plus" size={16} /></button><button aria-label="AI tools"><span>✣</span></button></div><button className="send-button" aria-label="Send"><Icon name="send" size={15} /></button></div></div><div className="quick-actions"><Link href="/create"><Icon name="plus" size={14} /> Create Document</Link><Link href="/create"><Icon name="template" size={14} /> Analyze Template</Link><Link href="/create"><span>✦</span> Generate with AI</Link></div></div>
				</section>
			</main>
			<style jsx global>{`
				.dashboard-shell { --bg: #fbfbfd; --surface: #ffffff; --sidebar: #f5f5f8; --text: #20202a; --muted: #8b8b98; --line: #e9e9ef; --accent: #7257e8; --accent-soft: #ebe7ff; min-height: 100vh; display: flex; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: background .2s, color .2s; }
				.dashboard-shell.dark { --bg: #101014; --surface: #18181e; --sidebar: #17171d; --text: #f7f7fa; --muted: #858591; --line: #292930; --accent: #8a72f4; --accent-soft: #29234d; }
				.dashboard-sidebar { background: var(--sidebar); border-right: 1px solid var(--line); min-height: 100vh; padding: 18px 12px 14px; display: flex; flex-direction: column; flex: 0 0 auto; position: relative; transition: width .05s, background .2s; }
				.brand-row, .mobile-brand { display: flex; align-items: center; gap: 8px; font-weight: 750; font-size: 14px; letter-spacing: -.02em; padding: 0 7px; }
				.brand-mark { width: 17px; height: 17px; display: grid; place-items: center; border-radius: 4px; background: var(--accent); color: white; font-size: 10px; font-weight: 800; }
				.new-document { height: 32px; margin: 22px 0 14px; border-radius: 6px; background: var(--accent); color: white; display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 11px; font-weight: 650; text-decoration: none; box-shadow: 0 2px 7px #7257e82a; }
				.primary-nav { display: grid; gap: 3px; }
				.primary-nav a, .sidebar-bottom a, .theme-toggle { border: 0; background: transparent; color: var(--muted); display: flex; align-items: center; gap: 10px; min-height: 31px; padding: 0 9px; border-radius: 6px; font: inherit; font-size: 11px; text-decoration: none; text-align: left; cursor: pointer; }
				.primary-nav a.active { color: var(--accent); background: var(--accent-soft); font-weight: 650; }
				.primary-nav a:hover, .sidebar-bottom a:hover, .theme-toggle:hover { color: var(--text); background: var(--accent-soft); }
				.recent-section { margin-top: 25px; min-width: 0; }
				.section-label, .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 8px; font-weight: 700; color: var(--muted); margin: 0 8px 10px; }
				.recent-document { display: flex; align-items: center; gap: 7px; padding: 7px 8px; color: var(--muted); text-decoration: none; font-size: 10px; min-width: 0; }
				.recent-document span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }.recent-document:hover { color: var(--text); }.empty-recent { color: var(--muted); font-size: 10px; padding: 0 8px; }
				.sidebar-bottom { margin-top: auto; border-top: 1px solid var(--line); padding-top: 12px; display: grid; gap: 2px; }.theme-toggle { justify-content: space-between; width: 100%; }.theme-toggle span:first-child { display: flex; align-items: center; gap: 10px; }.switch { width: 23px; height: 13px; border-radius: 10px; background: #d8d8df; padding: 2px; }.switch i { display: block; width: 9px; height: 9px; border-radius: 50%; background: white; transition: transform .2s; }.switch.on { background: var(--accent); }.switch.on i { transform: translateX(10px); }.profile { display: flex; align-items: center; gap: 9px; margin: 14px 7px 0; padding-top: 12px; border-top: 1px solid var(--line); }.avatar, .mini-avatar { display: grid; place-items: center; border-radius: 50%; background: #d6c8b9; color: #5e4b3b; font-size: 9px; font-weight: 750; }.avatar { width: 26px; height: 26px; }.profile strong, .profile small { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 165px; }.profile strong { font-size: 10px; }.profile small { color: var(--muted); font-size: 8px; margin-top: 2px; }.resize-handle { position: absolute; right: -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; border: 0; background: transparent; z-index: 2; }.resize-handle:hover { background: var(--accent); opacity: .35; }
				.dashboard-main { min-width: 0; flex: 1; }.dashboard-header { height: 58px; display: flex; align-items: center; padding: 0 27px; gap: 12px; }.breadcrumb { color: var(--muted); font-size: 9px; }.breadcrumb b { margin: 0 7px; color: #c5c5cc; }.breadcrumb strong { color: var(--text); font-weight: 650; }.header-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }.credits { color: var(--accent); background: var(--accent-soft); border-radius: 10px; padding: 5px 8px; font-size: 9px; font-weight: 650; }.icon-button, .mobile-menu { display: grid; place-items: center; border: 0; background: transparent; color: var(--muted); cursor: pointer; }.mini-avatar { width: 24px; height: 24px; }.mobile-menu, .mobile-brand { display: none; }.dashboard-content { min-height: calc(100vh - 58px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 24px 12vh; }.welcome { text-align: center; margin-bottom: 76px; }.welcome .eyebrow { color: var(--accent); margin-bottom: 14px; font-size: 8px; }.welcome h1 { margin: 0; font-size: clamp(27px, 3vw, 38px); letter-spacing: -.045em; line-height: 1.1; }.welcome h1 span { font-size: .82em; }.welcome p:last-child { margin: 12px 0 0; color: var(--muted); font-size: 12px; }.composer-wrap { width: min(100%, 560px); }.composer { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 7px 24px #20202a0b; padding: 14px 12px 9px; }.composer input { border: 0; outline: 0; background: transparent; color: var(--text); width: 100%; font: inherit; font-size: 11px; padding: 2px 3px 13px; }.composer input::placeholder { color: var(--muted); }.composer-footer { display: flex; align-items: center; justify-content: space-between; }.composer-tools { display: flex; gap: 5px; }.composer-tools button { border: 1px solid var(--line); color: var(--muted); background: var(--surface); border-radius: 5px; width: 25px; height: 23px; display: grid; place-items: center; cursor: pointer; }.send-button { display: grid; place-items: center; width: 25px; height: 23px; border: 0; border-radius: 5px; color: white; background: var(--accent); cursor: pointer; }.quick-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 7px; margin-top: 11px; }.quick-actions a { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 6px 10px; font-size: 9px; text-decoration: none; transition: color .2s, border .2s, transform .2s; }.quick-actions a:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-1px); }.drawer-backdrop { display: none; }
				@media (max-width: 700px) { .dashboard-shell { display: block; }.dashboard-sidebar { position: fixed; z-index: 10; left: 0; top: 0; bottom: 0; width: min(82vw, 300px) !important; transform: translateX(-105%); transition: transform .25s ease; box-shadow: 12px 0 30px #0002; }.dashboard-sidebar.drawer-visible { transform: translateX(0); }.resize-handle { display: none; }.drawer-backdrop { display: block; position: fixed; z-index: 9; inset: 0; background: #0007; border: 0; }.dashboard-header { height: 58px; padding: 0 17px; justify-content: space-between; }.mobile-menu, .mobile-brand { display: flex; }.mobile-brand { padding: 0; font-size: 12px; }.breadcrumb { position: absolute; top: 70px; left: 0; right: 0; text-align: center; font-size: 8px; }.header-actions { margin-left: 0; }.credits, .icon-button { display: none; }.dashboard-content { min-height: calc(100vh - 58px); padding: 45px 17px 10vh; justify-content: center; }.welcome { margin-bottom: 68px; }.welcome .eyebrow { display: none; }.welcome h1 { font-size: 27px; }.welcome p:last-child { font-size: 10px; }.composer-wrap { width: 100%; }.composer { padding: 13px 10px 9px; }.quick-actions { justify-content: flex-start; }.quick-actions a { flex: 1 1 auto; justify-content: center; min-width: 125px; }.recent-section { margin-top: 25px; } }
				@media (prefers-reduced-motion: reduce) { .dashboard-shell *, .dashboard-shell *::before, .dashboard-shell *::after { transition: none !important; } }
			`}</style>
		</div>
	);
}
