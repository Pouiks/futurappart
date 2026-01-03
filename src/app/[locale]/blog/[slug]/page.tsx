import { prisma } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ReactMarkdown from 'react-markdown';

export async function generateMetadata({ params }: any) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug }, select: { seoJson: true, title: true, excerpt: true } });

    if (!post) return {};

    const seo = (post.seoJson as any) || {};

    return {
        title: seo.metaTitle || post.title,
        description: seo.metaDesc || post.excerpt,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true, author: true }
    });

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />

            <main className="pt-24 pb-20">

                {/* HERO */}
                <div className="container mx-auto px-4 mb-12 max-w-4xl">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour au blog
                    </Link>

                    {post.category && (
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold uppercase text-xs rounded-full">
                                {post.category.name}
                            </span>
                        </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-6 border-b border-slate-100 pb-8">
                        {post.author && (
                            <div className="flex items-center gap-3">
                                {post.author.avatarUrl ? (
                                    <img src={post.author.avatarUrl} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-sm text-slate-900">{post.author.name}</div>
                                    <div className="text-xs text-slate-500">{post.author.role}</div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                        </div>
                    </div>
                </div>

                {/* FEATURED IMAGE */}
                {post.coverImageUrl && (
                    <div className="container mx-auto px-4 max-w-5xl mb-12">
                        <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-lg">
                            <img src={post.coverImageUrl} className="w-full h-full object-cover" alt={post.title} />
                        </div>
                    </div>
                )}

                {/* CONTENT */}
                <article className="container mx-auto px-4 max-w-3xl prose prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-blue">
                    <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </article>

            </main>

            <Footer />
        </div>
    );
}
