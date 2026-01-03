import { getCityContent } from '../actions';
import CityEditForm from './CityEditForm';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const initialData = await getCityContent(slug);

    return <CityEditForm slug={slug} initialData={initialData} />;
}
