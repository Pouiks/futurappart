import { getAdminPost, getBlogCategories, getBlogAuthors } from '../actions';
import PostEditor from './PostEditor';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel fetching
    const [post, categories, authors] = await Promise.all([
        id === 'new' ? null : getAdminPost(id),
        getBlogCategories(),
        getBlogAuthors()
    ]);

    return <PostEditor post={post} categories={categories} authors={authors} />;
}
