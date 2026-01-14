import { searchResidences, getPartnerConfigsSource, getBrandsList } from './actions';
import ResidenceList from './ResidenceList';
import { Building } from 'lucide-react';

export default async function ResidencesPage({ searchParams }: { searchParams?: Promise<{ search?: string, source?: string }> }) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.search || '';

    // Server fetch
    const residences = await searchResidences();
    const brands = await getPartnerConfigsSource();
    const brandEntities = await getBrandsList();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configuration Résidences</h1>
                <p className="text-slate-500 mt-1">Gérez les emails de notification et le pricing par résidence.</p>
            </div>

            <ResidenceList
                initialResidences={residences}
                initialSearch={query}
                brands={brands}
                brandEntities={brandEntities}
            />
        </div>
    );
}
