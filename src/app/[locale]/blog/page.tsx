import { prisma } from '@/lib/db';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { Calendar, User } from 'lucide-react';

export default async function BlogIndexPage() {

    // Fetch Published Posts
    const posts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        include: { category: true, author: true },
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4">

                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                            Conseils & Vie Étudiante
                        </h1>
                        <p className="text-xl text-slate-600">
                            Toutes nos astuces pour trouver ton logement, obtenir tes aides (APL, CAF) et gérer ton budget étudiant.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full flex flex-col">
                                <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-full hover:shadow-lg transition-shadow duration-300">
                                    <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                                        {post.coverImageUrl ? (
                                            <img
                                                src={post.coverImageUrl}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-200">
                                                <span className="text-4xl">📝</span>
                                            </div>
                                        )}
                                        {post.category && (
                                            <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur text-indigo-600 text-xs font-bold uppercase rounded-full shadow-sm">
                                                {post.category.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                                            </div>
                                            {post.author && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {post.author.name}
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                            {post.excerpt || post.content?.slice(0, 150) + '...'}
                                        </p>

                                        <div className="text-blue-600 font-bold text-sm">Lire l'article &rarr;</div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500 text-lg">Aucun article publié pour le moment.</p>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}
