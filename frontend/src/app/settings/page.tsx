"use client";
import AppShell from "../../components/layout/AppShell";
import { useAuth } from "../../components/auth/AuthProvider";

export default function SettingsPage() {
    const { user } = useAuth();
    const profileName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Workspace User";

    return (
        <AppShell title="Settings">
            <div className="page-heading">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your DocuAI workspace preferences.</p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <section className="surface p-6">
                    <h2 className="text-lg font-semibold">Account</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{profileName}</p>
                    <p className="text-sm text-[var(--muted)]">{user?.email || "workspace@docuai.local"}</p>
                    <button className="primary-button mt-5" type="button">Edit Profile</button>
                </section>
                <section className="surface p-6">
                    <h2 className="text-lg font-semibold">Appearance</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">Use the theme control in the sidebar or header to switch between light and dark mode.</p>
                </section>
                <section className="surface p-6">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <label className="mt-5 flex gap-3 text-sm"><input type="checkbox" defaultChecked /> Document generation notifications</label>
                    <label className="mt-3 flex gap-3 text-sm"><input type="checkbox" defaultChecked /> AI completion notifications</label>
                </section>
                <section className="surface p-6">
                    <h2 className="text-lg font-semibold">Documents</h2>
                    <label className="mt-5 grid gap-2 text-sm">Default download format
                        <select className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                            <option>DOCX</option>
                            <option>PDF unavailable</option>
                            <option>DOC unavailable</option>
                        </select>
                    </label>
                </section>
            </div>
        </AppShell>
    );
}

