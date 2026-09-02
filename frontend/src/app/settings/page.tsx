"use client";
import AppShell from "../../components/layout/AppShell";
import { useAuth } from "../../components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const profileName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Workspace User";

    async function handleLogout() {
        await signOut();
        router.replace("/");
    }

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
                    <div className="mt-5 space-y-3">
                        <div>
                            <p className="text-sm font-medium text-[var(--muted)]">Name</p>
                            <p className="mt-1 text-sm text-[var(--text)]">{profileName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--muted)]">Email</p>
                            <p className="mt-1 text-sm text-[var(--text)]">{user?.email || "workspace@docuai.local"}</p>
                        </div>
                        <button 
                            className="mt-5 rounded-lg border border-red-600/30 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600/10"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
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

