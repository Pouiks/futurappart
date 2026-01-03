'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { PostStatus, Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';

// --- HELPERS ---

// 1. LIST: Get Posts list
export async function getAdminPosts() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            category: true,
            author: true
        }
    });
    return posts;
}

// 2. READ: Get Single Post
export async function getAdminPost(id: string) {
    return prisma.blogPost.findUnique({
        where: { id },
        include: { category: true, author: true }
    });
}

// 3. CREATE/UPDATE: Save Post
export async function savePost(id: string | 'new', formData: any) {

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const data: Prisma.BlogPostCreateInput = {
        title: formData.title,
        slug,
        status: formData.status as PostStatus,
        content: formData.content,
        excerpt: formData.excerpt,
        coverImageUrl: formData.coverImageUrl,
        publishedAt: formData.status === 'PUBLISHED' ? (formData.publishedAt ? new Date(formData.publishedAt) : new Date()) : null,

        // Relations (Connect or Disconnect)
        category: formData.categoryId ? { connect: { id: formData.categoryId } } : undefined,
        author: formData.authorId ? { connect: { id: formData.authorId } } : undefined,

        // SEO
        seoJson: {
            metaTitle: formData.metaTitle,
            metaDesc: formData.metaDesc
        }
    };

    if (id === 'new') {
        await prisma.blogPost.create({ data });
    } else {
        await prisma.blogPost.update({
            where: { id },
            data
        });
    }

    revalidatePath('/admin/posts');
    revalidatePath('/blog');

    if (id === 'new') {
        redirect('/admin/posts');
    }
}

// 4. METADATA HELPERS for Dropdowns
export async function getBlogCategories() {
    return prisma.blogCategory.findMany();
}

export async function getBlogAuthors() {
    return prisma.blogAuthor.findMany();
}

// 5. QUICK SEED (To boostrap Categories/Authors if empty)
export async function bootstrapBlog() {
    // Check if categories exist
    const count = await prisma.blogCategory.count();
    if (count === 0) {
        await prisma.blogCategory.createMany({
            data: [
                { name: 'Aides au Logement', slug: 'aides-logement', description: 'Tout sur les APL, la CAF, etc.' },
                { name: 'Vie Étudiante', slug: 'vie-etudiante', description: 'Conseils pour gérer son budget et ses études.' },
                { name: 'Villes', slug: 'villes', description: 'Guides par ville.' }
            ]
        });

        await prisma.blogAuthor.create({
            data: {
                name: "L'équipe MonLogement",
                role: "Expert Logement",
                bio: "Nous accompagnons les étudiants depuis 2024."
            }
        });
    }
}
