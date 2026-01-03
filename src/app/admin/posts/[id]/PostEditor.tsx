'use client';

import { useState } from 'react';
import { savePost } from '../actions';
import { ArrowLeft, Save, Loader2, Link as IcLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PostEditor({ post, categories, authors }: any) {
    const isNew = !post?.id;
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: post?.title || '',
        slug: post?.slug || '',
        content: post?.content || '',
        excerpt: post?.excerpt || '',
        status: post?.status || 'DRAFT',
        categoryId: post?.categoryId || '',
        authorId: post?.authorId || '',
        coverImageUrl: post?.coverImageUrl || '',

        // SEO
        metaTitle: post?.seoJson?.metaTitle || '',
        metaDesc: post?.seoJson?.metaDesc || '',
    });

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await savePost(isNew ? 'new' : post.id, formData);
            if (!isNew) {
                alert("Article sauvegardé !");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="pb-12">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-20 py-4 mb-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isNew ? 'Nouvel Article' : 'Éditer l\'article'}
                        </h1>
                        <p className="text-xs text-slate-400 font-mono">
                            {formData.slug || 'slug-automatique-au-titre'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className={`text-sm font-bold px-3 py-2 rounded-lg border-none outline-none ring-1 ring-slate-200 cursor-pointer ${formData.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 ring-green-200' :
                                formData.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100'
                            }`}
                    >
                        <option value="DRAFT">BROUILLON</option>
                        <option value="PUBLISHED">PUBLIÉ</option>
                        <option value="ARCHIVED">ARCHIVÉ</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isNew ? 'Créer' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: CONTENT */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <input
                            type="text"
                            placeholder="Titre de l'article..."
                            className="w-full text-3xl font-bold placeholder-slate-300 border-none outline-none focus:ring-0 p-0"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Editor (Simple Textarea for MVP) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
                        <div className="mb-2 text-xs text-slate-400 uppercase font-bold tracking-wider">Contenu (Markdown supporté)</div>
                        <textarea
                            className="w-full flex-1 resize-none border-none outline-none focus:ring-0 text-lg leading-relaxed text-slate-700 font-mono"
                            placeholder="Écrivez votre article ici..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                </div>

                {/* RIGHT: SETTINGS */}
                <div className="space-y-6">

                    {/* Meta */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm uppercase mb-2">Configuration</h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Catégorie</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Choisir...</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Auteur</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.authorId}
                                onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                            >
                                <option value="">Choisir...</option>
                                {authors.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Image de couverture (URL)</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                placeholder="https://..."
                                value={formData.coverImageUrl}
                                onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                            />
                            {formData.coverImageUrl && (
                                <img src={formData.coverImageUrl} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover border border-slate-100" />
                            )}
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm uppercase mb-2">SEO (Google)</h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Méta Titre (70 chars)</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.metaTitle}
                                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Méta Description (160 chars)</label>
                            <textarea
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24"
                                value={formData.metaDesc}
                                onChange={e => setFormData({ ...formData, metaDesc: e.target.value })}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
