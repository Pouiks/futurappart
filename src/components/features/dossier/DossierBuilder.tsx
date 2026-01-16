'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, FileText, UploadCloud, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PersonRole, PersonStatus, NationalityGroup, DocType, DossierPerson, UserDocument, GuarantorType } from '@prisma/client';
import { DossierEngine, RequirementResult } from '@/core/dossier/engine';
import { upsertPerson, deletePerson, getUploadUrl, saveUserDocument } from '@/app/actions/dossier';
import { DossierProgressBar } from './DossierProgressBar';
import { InactivityNudge } from './InactivityNudge';
import { MaskedDateInput } from '@/components/ui/MaskedDateInput';
type PersonWithDocs = DossierPerson & {
    documents: UserDocument[];
    birthDate?: Date | string | null;
    income?: number | null;
    cafNumber?: string | null;
    arrivalDate?: Date | string | null;
};

import { User as AuthUser } from '@supabase/supabase-js';

// ... imports

interface DossierBuilderProps {
    userId: string;
    initialProfile: any;
    user?: AuthUser;
}

const engine = new DossierEngine();

export default function DossierBuilder({ userId, initialProfile, user }: DossierBuilderProps) {
    // Initialize persons from profile, merging Profile-level fields into Applicant
    const [persons, setPersons] = useState<PersonWithDocs[]>(() => {
        console.log("DossierBuilder: Initializing...", initialProfile);
        const base = initialProfile?.dossierPersons || [];
        return base.map((p: any) => {
            if (p.role === 'APPLICANT') {
                const merged = {
                    ...p,
                    income: p.income ?? initialProfile?.income,
                    cafNumber: p.cafNumber ?? initialProfile?.cafNumber,
                    arrivalDate: p.arrivalDate ?? initialProfile?.arrivalDate,
                    birthDate: p.birthDate ?? initialProfile?.birthdate
                };
                console.log("DossierBuilder: Hydrated Applicant", merged);
                return merged;
            }
            return p;
        });
    });

    const [activeTab, setActiveTab] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    // Auto-Save Logic (Hoisted)
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [lastServerResult, setLastServerResult] = useState<any>(null);

    // Select first person on load if exists
    // Select Applicant by default, or first person if no applicant
    useEffect(() => {
        if (persons.length > 0 && !activeTab) {
            const applicant = persons.find(p => p.role === 'APPLICANT');
            setActiveTab(applicant ? applicant.id : persons[0].id);
        }
    }, [persons, activeTab]); // Depend on persons to retry if loaded later

    // Sync with Server Data (Revalidation updates props)
    useEffect(() => {
        // PROTECTION A: User is actively working
        if (unsavedChanges || isSaving) return;

        if (initialProfile?.dossierPersons) {
            console.log("DossierBuilder: Checking New Props", initialProfile.dossierPersons);

            setPersons(currentPersons => {
                const merged = initialProfile.dossierPersons.map((p: any) => {
                    // PROTECTION B: Timestamp Guard
                    // If we recently saved this person (recorded in lastServerResult), 
                    // and the incoming prop is OLDER than our save, ignore the prop.
                    if (lastServerResult?.debugRecord?.id === p.id) {
                        const lastSaveTime = new Date(lastServerResult.debugRecord.updatedAt).getTime();
                        const propTime = new Date(p.updatedAt).getTime();

                        // Allow 1000ms buffer for clock skew/precision loss
                        if (propTime < lastSaveTime - 1000) {
                            console.warn(`DossierBuilder: Ignoring STALE prop for ${p.id}. Prop: ${p.updatedAt}, LastSave: ${lastServerResult.debugRecord.updatedAt}`);
                            // Return the CURRENT local version, not the stale prop
                            const local = currentPersons.find(cp => cp.id === p.id);
                            return local || p;
                        }
                    }

                    if (p.role === 'APPLICANT') {
                        return {
                            ...p,
                            income: p.income ?? initialProfile.income,
                            cafNumber: p.cafNumber ?? initialProfile.cafNumber,
                            arrivalDate: p.arrivalDate ?? initialProfile.arrivalDate,
                            birthDate: p.birthDate ?? initialProfile.birthdate
                        };
                    }
                    return p;
                });
                return merged;
            });
        }
    }, [initialProfile, unsavedChanges, isSaving, lastServerResult]);

    // Sync Applicant Contact Info with Profile (Auto-fill Name/Email/Phone from Auth if missing)
    useEffect(() => {
        if (!initialProfile) return;

        const applicant = persons.find(p => p.role === 'APPLICANT');
        if (applicant) {
            let updates: Partial<DossierPerson> = {};
            let hasChanges = false;

            if (!applicant.email && initialProfile.email) {
                updates.email = initialProfile.email;
                hasChanges = true;
            }
            if (!applicant.phone && initialProfile.phone) {
                updates.phone = initialProfile.phone;
                hasChanges = true;
            }

            // Sync Name and clear "Nouveau/Candidat" defaults
            const meta = user?.user_metadata || {};
            const targetFirstName = initialProfile.firstName || meta.first_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || '';
            const targetLastName = initialProfile.lastName || meta.last_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || '';

            if (targetFirstName && (!applicant.firstName || applicant.firstName === 'Nouveau')) {
                updates.firstName = targetFirstName;
                hasChanges = true;
            }

            if (targetLastName && (!applicant.lastName || applicant.lastName === 'Candidat')) {
                updates.lastName = targetLastName;
                hasChanges = true;
            }

            // Only trigger upsert if we actually inferred NEW info from Auth/Profile that wasn't in DossierPerson
            if (hasChanges) {
                // We update local state to reflect change immediately
                const updatedApplicant = { ...applicant, ...updates };
                setPersons(prev => prev.map(p => p.id === applicant.id ? updatedApplicant as PersonWithDocs : p));

                // Fire and forget save
                upsertPerson(updatedApplicant as any).catch(e => console.error("Auto-sync failed", e));
                toast.success("Coordonnées pré-remplies.");
            }
        }
    }, [initialProfile, user]); // Removed 'persons' dependency to avoid reacting to own updates, causing loop. 
    // Wait, if I remove 'persons', I can't check 'applicant'.
    // Correct pattern: DEPEND on 'persons' but ensure 'hasChanges' is false if already synced.
    // My previous code had 'persons' in dependency.
    // The issue was 'income' sync always triggered 'hasChanges = true' because of undefined check.
    // Now that income is handled in init, this effect is safer.
    // I will include 'persons.length' or strict equality check?
    // Actually, 'persons' reference changes on every render if I setPersons.
    // I should limit this effect.
    // Let's rely on 'initialProfile' changes or 'user' changes mainly. 
    // If I include 'persons', I risk loop if 'setPersons' creates new object reference.
    // I will disable exhaustive-deps warning for this effect or use a ref to track if verified.

    const activePerson = persons.find(p => p.id === activeTab);

    // Compute Requirements dynamically
    const requirements: RequirementResult | null = activePerson ? engine.getRequirements({
        role: activePerson.role,
        status: activePerson.status,
        nationality: activePerson.nationality,
        isMinor: activePerson.isMinor,
        guarantorType: activePerson.guarantorType || (activePerson.role === 'GUARANTOR' ? GuarantorType.PERSON : null)
    }) : null;

    // Check for Stale Documents
    const isUserActive = initialProfile?.lastSeenAt && (new Date().getTime() - new Date(initialProfile.lastSeenAt).getTime()) < (30 * 24 * 60 * 60 * 1000);
    const hasStaleDocuments = isUserActive && persons.some(p =>
        p.documents?.some((d: UserDocument) =>
            (new Date().getTime() - new Date(d.createdAt).getTime()) > (21 * 24 * 60 * 60 * 1000)
        )
    );

    // Handlers
    const handleCreatePerson = async (role: PersonRole) => {
        if (isCreating) return;
        setIsCreating(true);
        let firstName = '';
        let lastName = '';
        if (role === 'APPLICANT') {
            const meta = user?.user_metadata || {};
            firstName = initialProfile?.firstName || meta.first_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || '';
            lastName = initialProfile?.lastName || meta.last_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || '';
        }

        try {
            const newPerson = {
                role,
                firstName,
                lastName,
                status: role === 'GUARANTOR' ? PersonStatus.EMPLOYEE : PersonStatus.STUDENT,
                nationality: NationalityGroup.FR,
                isMinor: false,
                guarantorType: role === 'GUARANTOR' ? GuarantorType.PERSON : null,
            };
            await upsertPerson(newPerson as any);
            toast.success(role === 'APPLICANT' ? "Mon dossier créé !" : "Garant ajouté !");
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la création.");
            setIsCreating(false);
        }
    };

    const handleDeleteGuarantor = async () => {
        if (!activePerson || activePerson.role === 'APPLICANT') return;
        if (!confirm('Voulez-vous vraiment supprimer ce garant ?')) return;

        try {
            await deletePerson(activePerson.id);
            toast.success("Garant supprimé.");
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la suppression.");
        }
    };

    // Auto-Save Logic
    const handleUpdatePerson = (field: keyof DossierPerson | 'income', value: any) => {
        console.log("DossierBuilder: User Input:", field, value);

        setPersons(prevPersons => {
            const currentActive = prevPersons.find(p => p.id === activeTab);
            if (!currentActive) return prevPersons;

            const updatedPerson = { ...currentActive, [field]: value };

            // Trigger Save with the NEW updated person, not the stale 'activePerson' closure
            const payload = {
                ...updatedPerson,
                email: updatedPerson.email || undefined,
                phone: updatedPerson.phone || undefined,
                birthDate: updatedPerson.birthDate || undefined,
                arrivalDate: updatedPerson.arrivalDate || undefined,
            };

            // Debounce Logic needing access to latest payload
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    const result = await upsertPerson(payload as any);
                    console.log("DossierBuilder: Server Save Result", result);
                    setLastServerResult(result);

                    if (result.error) {
                        console.error("Save Error:", result.error);
                        toast.error(result.error);
                    } else {
                        setUnsavedChanges(false);
                    }
                } catch (error) {
                    console.error("Failed to save", error);
                    toast.error("Erreur de sauvegarde automatique");
                } finally {
                    setIsSaving(false);
                }
            }, 1000);

            return prevPersons.map(p => p.id === activeTab ? updatedPerson : p);
        });

        setUnsavedChanges(true);
    };

    // Manual Trigger (Flush)
    const handleSave = async () => {
        if (!activePerson) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setIsSaving(true);
        try {
            const payload = {
                ...activePerson,
                email: activePerson.email || undefined,
                phone: activePerson.phone || undefined,
                birthDate: activePerson.birthDate || undefined,
                arrivalDate: activePerson.arrivalDate || undefined,
            };

            await upsertPerson(payload as any);
            toast.success("Modifications enregistrées");
            setUnsavedChanges(false);
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Erreur de sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    // Mappings
    const statusLabels: Record<string, string> = {
        STUDENT: "Étudiant",
        EMPLOYEE: "Salarié",
        SELF_EMPLOYED: "Indépendant / Freelance",
        ENTREPRENEUR: "Chef d'entreprise",
        RETIRED: "Retraité",
        UNEMPLOYED: "Sans emploi",
        OTHER: "Autre situation"
    };

    const nationalityLabels: Record<string, string> = {
        FR: "Française 🇫🇷",
        EU: "Union Européenne 🇪🇺",
        NON_EU: "Hors Union Européenne 🌍"
    };



    // Calculate Global Progress & Business Rules
    const applicant = persons.find(p => p.role === 'APPLICANT');
    const isStudent = applicant?.status === 'STUDENT' || applicant?.status === 'UNEMPLOYED';
    const hasGuarantor = persons.some(p => p.role === 'GUARANTOR');
    const hasIncome = (applicant?.income !== undefined && applicant?.income !== null); // Check if field is filled (even if 0, usually) but Page.tsx checked > 0. Let's assume > 0 or just presence. Page used > 0.

    // Business Rules
    const needsGuarantor = isStudent || !applicant; // Default to needing if no applicant yet or is student

    const allReqs = persons.map(p => engine.getRequirements({
        role: p.role,
        status: p.status,
        nationality: p.nationality,
        isMinor: p.isMinor,
        guarantorType: p.guarantorType || (p.role === 'GUARANTOR' ? GuarantorType.PERSON : null)
    }));

    let totalRequired = 0;
    let totalCompleted = 0;

    // 0. Identity & Contact Checks
    persons.forEach(p => {
        if (p.role === 'APPLICANT') {
            totalRequired += 5; // FirstName, LastName, Email, Phone, BirthDate
            if (p.firstName && p.firstName.trim() !== '' && p.firstName !== 'Nouveau') totalCompleted++;
            if (p.lastName && p.lastName.trim() !== '' && p.lastName !== 'Candidat') totalCompleted++;
            if (p.email && p.email.trim() !== '') totalCompleted++;
            if (p.phone && p.phone.trim() !== '') totalCompleted++;
            if (p.birthDate) totalCompleted++;
        } else if (p.role === 'GUARANTOR') {
            totalRequired += 2; // FirstName, LastName
            if (p.firstName && p.firstName.trim() !== '' && p.firstName !== 'Nouveau Garant') totalCompleted++;
            if (p.lastName && p.lastName.trim() !== '') totalCompleted++;
        }
    });

    // 1. Documents
    allReqs.forEach((req, idx) => {
        req.required.forEach(dt => {
            totalRequired++;
            if (persons[idx].documents?.some(d => d.type === dt && d.status === 'VALID')) totalCompleted++;
        });
        req.orGroups.forEach(group => {
            totalRequired++;
            if (group.some(dt => persons[idx].documents?.some(d => d.type === dt && d.status === 'VALID'))) totalCompleted++;
        });
    });

    // 2. Business Logic Steps (Weighted as 1 "Document" equivalent each)
    if (needsGuarantor) {
        totalRequired++;
        if (hasGuarantor) totalCompleted++;
    }

    // Income check (Always required)
    totalRequired++;
    if (applicant?.income && applicant.income > 0) totalCompleted++;


    const progress = totalRequired === 0 ? 0 : (totalCompleted / totalRequired) * 100;

    return (
        <div className="w-full">
            <InactivityNudge />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Mon Dossier Locatif</h1>
                    <p className="text-gray-500">
                        Complétez votre dossier une seule fois pour toutes vos candidatures.
                    </p>
                </div>
            </div>

            <DossierProgressBar progress={progress} totalDocs={totalRequired} completedDocs={totalCompleted} />

            {/* BLOCKING ALERTS */}
            {applicant && needsGuarantor && !hasGuarantor && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-900">Garant Manquant</h4>
                        <p className="text-sm text-orange-700 mt-1">
                            En tant qu'étudiant, vous devez ajouter au moins un garant (physique ou moral) pour finaliser votre dossier.
                        </p>
                    </div>
                    <button
                        onClick={() => handleCreatePerson('GUARANTOR')}
                        className="ml-auto bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 transition"
                    >
                        Ajouter
                    </button>
                </div>
            )}

            {applicant && (!applicant.income || applicant.income <= 0) && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900">Revenus manquants</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Veuillez indiquer vos revenus mensuels (ou 0€) sur votre profil candidat.
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveTab(applicant.id)}
                        className="ml-auto text-blue-600 font-bold text-sm hover:underline"
                    >
                        Modifier
                    </button>
                </div>
            )}

            {hasStaleDocuments && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">Vérification recommandée</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Certains documents semblent anciens (&gt; 3 semaines). Une mise à jour est conseillée.
                        </p>
                    </div>
                </div>
            )}

            {/* MAIN LAYOUT With Sidebar for Protagonists */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT SIDEBAR navigation */}
                <div className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-row lg:flex-col gap-2 sticky top-24 overflow-x-auto no-scrollbar snap-x">

                        {/* Mobile Label only if needed, otherwise hidden to save space */}
                        <label className="hidden lg:block text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mt-2 mb-1">Candidat</label>

                        {persons.filter(p => p.role === 'APPLICANT').map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActiveTab(p.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 lg:py-3 rounded-lg text-xs lg:text-sm font-bold transition-all shrink-0 snap-start border
                                    ${activeTab === p.id
                                        ? 'bg-blue-600 text-white shadow-md border-blue-600'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}
                                `}
                            >
                                <div className={`w-5 h-5 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${activeTab === p.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                    <User className="w-3 h-3 lg:w-4 lg:h-4" />
                                </div>
                                <span className="lg:hidden">Moi</span>
                                <div className="text-left hidden lg:block">
                                    <div className="leading-tight">Moi</div>
                                    <div className={`hidden lg:block text-xs font-normal ${activeTab === p.id ? 'text-blue-100' : 'text-gray-500'}`}>Profil Principal</div>
                                </div>
                            </button>
                        ))}

                        {(!persons.find(p => p.role === 'APPLICANT')) && (
                            <button onClick={() => handleCreatePerson('APPLICANT')} disabled={isCreating} className="shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 lg:py-3 rounded-lg border border-dashed border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-bold justify-center">
                                <Plus className="w-4 h-4" /> <span className="hidden lg:inline">Créer mon profil</span><span className="lg:hidden">Créer</span>
                            </button>
                        )}

                        <div className="w-px h-6 lg:w-full lg:h-px bg-gray-200 mx-1 lg:mx-0 lg:my-1 shrink-0 self-center"></div>

                        <label className="hidden lg:block text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-1">Garants</label>

                        {persons.filter(p => p.role === 'GUARANTOR').map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActiveTab(p.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 lg:py-3 rounded-lg text-xs lg:text-sm font-bold transition-all shrink-0 snap-start border
                                    ${activeTab === p.id
                                        ? 'bg-indigo-600 text-white shadow-md border-indigo-600'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}
                                `}
                            >
                                <div className={`w-5 h-5 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${activeTab === p.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                    <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                                </div>
                                <span className="lg:hidden truncate max-w-[80px]">{p.firstName || 'Garant'}</span>
                                <div className="text-left hidden lg:block">
                                    <div className="leading-tight truncate max-w-[80px] lg:max-w-[120px]">{p.firstName || 'Nouveau Garant'}</div>
                                    <div className={`hidden lg:block text-xs font-normal ${activeTab === p.id ? 'text-indigo-100' : 'text-gray-500'}`}>Garant</div>
                                </div>
                            </button>
                        ))}

                        <button
                            onClick={() => handleCreatePerson('GUARANTOR')}
                            disabled={isCreating}
                            className="shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 lg:py-3 rounded-lg border border-transparent bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-xs lg:text-sm font-bold justify-start group shadow-sm"
                        >
                            <div className="w-5 h-5 lg:w-8 lg:h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                            </div>
                            <span className="hidden lg:inline">Ajouter un garant</span>
                            <span className="lg:hidden">Ajouter</span>
                        </button>
                    </div>
                </div>

                {/* CURRENT PERSON FORM AREA */}
                <div className="flex-1 min-w-0">
                    {activePerson ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

                            {/* Header Personnalisation */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <div className={`hidden md:flex w-20 h-20 rounded-full items-center justify-center text-white shadow-lg ${activePerson.role === 'APPLICANT' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>
                                    {activePerson.role === 'APPLICANT' ? <User className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600 uppercase block">Prénom</label>
                                            <input
                                                className="block w-full text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                                                value={activePerson.firstName}
                                                onChange={(e) => handleUpdatePerson('firstName', e.target.value)}
                                                placeholder="Ex: Thomas"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600 uppercase block">Nom</label>
                                            <input
                                                className="block w-full text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                                                value={activePerson.lastName}
                                                onChange={(e) => handleUpdatePerson('lastName', e.target.value)}
                                                placeholder="Ex: Durand"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        {/* STATUS SELECTOR */}
                                        {/* ... keeping status selectors but visually cleaner */}
                                        <div className="relative group flex-1">
                                            <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Mon Statut</label>
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm font-bold text-gray-700 cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                                                value={activePerson.status}
                                                onChange={(e) => handleUpdatePerson('status', e.target.value)}
                                            >
                                                {Object.values(PersonStatus)
                                                    .filter(s => activePerson.role !== 'GUARANTOR' || s !== 'STUDENT')
                                                    .map(s => (
                                                        <option key={s} value={s}>{statusLabels[s] || s}</option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="relative group flex-1">
                                            <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Nationalité</label>
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm font-bold text-gray-700 cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                                                value={activePerson.nationality}
                                                onChange={(e) => handleUpdatePerson('nationality', e.target.value)}
                                            >
                                                {Object.values(NationalityGroup).map(s => (
                                                    <option key={s} value={s}>{nationalityLabels[s] || s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {activePerson.role === 'APPLICANT' && (
                                            <div className="flex-1 min-w-[150px]">
                                                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Date de naissance</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                                                    value={activePerson.birthDate ? new Date(activePerson.birthDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (!val) {
                                                            handleUpdatePerson('birthDate', null);
                                                            return;
                                                        }

                                                        // Ensure we create a clean date object
                                                        const dateObj = new Date(val);
                                                        const isMinor = (new Date().getFullYear() - dateObj.getFullYear()) < 18;

                                                        // Store as ISO string
                                                        handleUpdatePerson('birthDate', dateObj.toISOString());
                                                        handleUpdatePerson('isMinor', isMinor);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT GRID */}
                            <div className="p-4 sm:p-6 grid gap-8">
                                {/* CONTACT & GUARANTOR TYPE */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Email</label>
                                        <input
                                            type="email"
                                            className={`block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none transition-all placeholder-gray-400 ${activePerson.role === 'APPLICANT'
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed select-none'
                                                    : 'text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400'
                                                }`}
                                            value={activePerson.email || ''}
                                            onChange={(e) => handleUpdatePerson('email', e.target.value)}
                                            placeholder="Ex: jean.dupont@email.com"
                                            disabled={activePerson.role === 'APPLICANT'}
                                            title={activePerson.role === 'APPLICANT' ? "L'email du compte ne peut pas être modifié ici." : ""}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            className="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400"
                                            value={activePerson.phone || ''}
                                            onChange={(e) => handleUpdatePerson('phone', e.target.value)}
                                            placeholder="Ex: 06 12 34 56 78"
                                        />
                                    </div>

                                    {activePerson.role === 'APPLICANT' && (
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Revenus mensuels nets (€)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400"
                                                    value={(activePerson as any).income ?? ''}
                                                    onChange={(e) => handleUpdatePerson('income', e.target.value === '' ? null : parseInt(e.target.value))}
                                                    placeholder="Ex: 800 (Mettre 0 si aucun revenu)"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Indiquez vos revenus personnels (salaires, bourses, allocations...). Mettez 0 si vous n'en avez pas.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {activePerson.role === 'GUARANTOR' && (
                                    <div className="bg-white border-2 border-gray-100 p-4 rounded-xl flex items-center gap-4">
                                        <Shield className="text-gray-400 w-6 h-6" />
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-900 block mb-1">Type de Garant</label>
                                            <select
                                                className="w-full text-sm font-medium text-gray-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors"
                                                value={activePerson.guarantorType || 'PERSON'}
                                                onChange={(e) => handleUpdatePerson('guarantorType', e.target.value)}
                                            >
                                                <option value="PERSON">Personne Physique (Parent, proche...)</option>
                                                <option value="ORGANISM">Organisme (Visale, Garantme...)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* DOCUMENT ZONES */}
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                                        Pièces Justificatives <span className="text-gray-400 font-normal text-sm ml-2">Mises à jour selon votre profil</span>
                                    </h3>

                                    <div className="space-y-4">
                                        {requirements?.required.map(docType => (
                                            <DocumentDropZone
                                                key={`${activePerson.id}-${docType}`}
                                                docType={docType}
                                                required={true}
                                                personId={activePerson.id}
                                                existingDoc={activePerson.documents?.find(d => d.type === docType)}
                                            />
                                        ))}

                                        {requirements?.orGroups.map((group, idx) => {
                                            const groupHasDoc = group.some(dt => activePerson.documents?.some(d => d.type === dt));
                                            return (
                                                <div key={idx} className={`p-4 rounded-xl border-2 border-dashed transition-all ${groupHasDoc ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="font-bold text-gray-700 text-sm">Justificatif de Ressources (Choisir 1 option)</span>
                                                        {groupHasDoc && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Validé</span>}
                                                    </div>
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        {group.map(dt => (
                                                            <DocumentDropZone
                                                                key={`${activePerson.id}-${dt}`}
                                                                docType={dt}
                                                                required={false}
                                                                mini
                                                                personId={activePerson.id}
                                                                existingDoc={activePerson.documents?.find(d => d.type === dt)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {requirements?.required.length === 0 && requirements?.orGroups.length === 0 && (
                                            <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                <h3 className="font-bold text-green-800">Aucun document requis</h3>
                                                <p className="text-sm text-green-600">Selon votre profil, vous n'avez pas de justificatif obligatoire à fournir.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            {/* FOOTER ACTIONS */}
                            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                                {activePerson.role === 'GUARANTOR' ? (
                                    <button
                                        onClick={handleDeleteGuarantor}
                                        className="text-red-500 hover:text-red-700 text-sm font-bold hover:underline"
                                    >
                                        Supprimer ce garant
                                    </button>
                                ) : <div></div>}

                                {(unsavedChanges || isSaving || activePerson.role === 'APPLICANT') && (
                                    <div className="flex items-center gap-4">
                                        {isSaving && <span className="text-xs text-gray-400 animate-pulse">Sauvegarde...</span>}

                                        <button
                                            onClick={handleSave}
                                            disabled={!unsavedChanges && !isSaving}
                                            className={`px-6 py-2 rounded-lg font-bold transition shadow-md flex items-center gap-2 ${unsavedChanges || isSaving
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-white text-gray-400 border border-gray-100 cursor-default'
                                                }`}
                                        >
                                            {isSaving ? <Briefcase className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {unsavedChanges ? 'Enregistrer' : 'Enregistré'}
                                        </button>
                                    </div>
                                )}
                            </div>


                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-2xl">
                            <User className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Bienvenue dans votre dossier</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">Pour commencer à candidater, créez votre profil candidat. C'est simple et rapide.</p>
                            <button onClick={() => handleCreatePerson('APPLICANT')} disabled={isCreating} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:-translate-y-1">
                                Créer mon profil Candidat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DocumentDropZone({ docType, required, mini, personId, existingDoc }: { docType: DocType, required?: boolean, mini?: boolean, personId: string, existingDoc?: UserDocument }) {
    const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');
    const [fileName, setFileName] = useState(existingDoc?.filename || '');

    useEffect(() => {
        if (existingDoc && existingDoc.status === 'VALID') {
            setStatus('SUCCESS');
            setFileName(existingDoc.filename);
        } else {
            setStatus('IDLE');
            setFileName('');
        }
    }, [existingDoc]);

    const labels: Record<string, string> = {
        IDENTITY: "Pièce d'identité",
        STUDENT_ENROLLMENT: "Certificat de scolarité",
        PROFESSIONAL_STATUS_PROOF: "Justificatif Professionnel",
        INCOME_PROOF: "Justificatif de Ressources",
        TAX_NOTICE: "Avis d'Imposition",
        RESIDENCY_RIGHT: "Titre de Séjour",
        GUARANTEE_CERTIFICATE: "Certificat de Garantie",
        ADDRESS_PROOF: "Justificatif de Domicile"
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('UPLOADING');
        setErrorMsg('');

        // 1. Client-side Validation
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            setStatus('ERROR');
            setErrorMsg(`Format invalide : ${file.name} (PDF, JPG, PNG uniquement)`);
            return;
        }

        if (file.size > maxSize) {
            setStatus('ERROR');
            setErrorMsg(`Fichier trop lourd : ${file.name} (> 5Mo)`);
            return;
        }

        try {
            // 2. Get Signed URL
            const { signedUrl, path, error } = await getUploadUrl(personId, docType, file.name);
            if (error || !signedUrl) throw new Error(error || 'Impossible d\'obtenir le lien d\'envoi');

            // 3. Upload to Supabase Storage
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                console.error('Upload Error:', errText);
                throw new Error(`Erreur lors du transfert (${uploadRes.status})`);
            }

            // 4. Save Metadata
            const saveRes = await saveUserDocument(personId, docType, path!, file.type);
            if (saveRes.error) throw new Error(saveRes.error);

            setStatus('SUCCESS');
            setFileName(file.name);
            toast.success("Document ajouté avec succès !");
        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            const msg = err.message || 'Erreur inconnue';
            let finalMsg = msg;
            if (msg.includes('row-level security')) {
                finalMsg = 'Erreur de permission (RLS). Réessayez.';
            }
            setErrorMsg(finalMsg);
            toast.error("Erreur lors de l'ajout du document : " + finalMsg);
        }
    };

    return (
        <div className={`group relative border rounded-lg transition-all cursor-pointer overflow-hidden
            ${mini ? 'p-2' : 'p-3'} 
            ${status === 'ERROR' ? 'border-red-300 bg-red-50' :
                status === 'SUCCESS' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50/10'}
        `}>
            <div className="flex items-center justify-between relative z-10 gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
                        }`}>
                        {status === 'UPLOADING' ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <UploadCloud className="w-4 h-4" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-gray-900 truncate ${mini ? 'text-xs' : 'text-sm'}`} title={labels[docType] || docType}>
                                {labels[docType] || docType}
                            </h4>
                            {required && status !== 'SUCCESS' && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">Obli.</span>
                            )}
                        </div>

                        <p className={`text-gray-500 truncate ${mini ? 'hidden' : 'text-xs'}`}>
                            {status === 'SUCCESS' ? (fileName || 'Document ajouté') : (status === 'ERROR' ? errorMsg : 'Ajouter un fichier')}
                        </p>
                    </div>
                </div>

                {/* Status Indicator / Mobile Action */}
                <div className="shrink-0 text-xs font-medium text-blue-600">
                    {status === 'SUCCESS' ? (
                        <span className="text-green-600 text-[10px] bg-green-100 px-2 py-1 rounded-full">Modifier</span>
                    ) : (
                        <span className="text-blue-600 text-[10px] bg-blue-50 px-2 py-1 rounded-full">Ajouter</span>
                    )}
                </div>
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={status === 'UPLOADING'}
            />
        </div>
    );
}
