import { ReactNode } from 'react';
import { Shield, LayoutDashboard, FileText, Users, LogOut, MapPin, Building } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import '../globals.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
    // Note: Middleware already protects this route, but we can double check or get user info here if needed.
    // Ideally we fetch the user session to display "Hello Admin"

    return (
        <html lang="fr">
            <body>
                <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
                    {/* Sidebar */}
                    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Admin Connect</span>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                            </Link>

                            <Link
                                href="/admin/leads"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                            >
                                <Users className="w-5 h-5" />
                                Dossiers / Leads
                            </Link>

                            <Link
                                href="/admin/residences"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                            >
                                <Building className="w-5 h-5" />
                                Résidences
                            </Link>


                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Contenu SEO
                            </div>

                            <Link
                                href="/admin/villes"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                            >
                                <MapPin className="w-5 h-5" />
                                Villes
                            </Link>

                            <Link
                                href="/admin/posts"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                            >
                                <FileText className="w-5 h-5" />
                                Blog
                            </Link>
                        </nav>

                        <div className="p-4 border-t border-slate-800">
                            <form action="/auth/signout" method="post">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors">
                                    <LogOut className="w-5 h-5" />
                                    Déconnexion
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 ml-64 p-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
