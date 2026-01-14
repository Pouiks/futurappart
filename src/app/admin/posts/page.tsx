export const dynamic = 'force-dynamic';

import { getAdminPosts, bootstrapBlog } from './actions';
import Link from 'next/link';
import { Edit, Plus, FileText, Calendar } from 'lucide-react';

export default async function AdminPostsPage() {
    // Quick seed categories if clean DB
    await bootstrapBlog();

    const posts = await getAdminPosts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Articles de Blog</h1>
                    <p className="text-slate-500 mt-1">Gérez votre stratégie de contenu SEO.</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel Article
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 font-semibold text-slate-600">Titre</th>
                            <th className="p-4 font-semibold text-slate-600">Statut</th>
                            <th className="p-4 font-semibold text-slate-600">Catégorie</th>
                            <th className="p-4 font-semibold text-slate-600">Dernière Modif</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Aucun article pour le moment. Créez le premier !
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                                                <div className="text-xs text-slate-400 font-mono">/blog/{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                            post.status === 'ARCHIVED' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {post.category ? (
                                            <span className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">
                                                {post.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Sans catégorie</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.updatedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/posts/${post.id}`}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
