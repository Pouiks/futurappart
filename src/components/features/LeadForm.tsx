
'use client';

import React, { useState } from 'react';
import { Calendar, Check, ChevronRight, User, Shield, Briefcase, Mail, Phone, Calendar as CalendarIcon, ArrowLeft, ChevronDown, Star } from 'lucide-react';
import { DatePicker } from '../ui/date-picker';

interface LeadFormProps {
    residenceName?: string;
    unitId: string;
}

export const LeadForm = ({ residenceName, unitId }: LeadFormProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        status: 'STUDENT', // STUDENT, ACTIVE, OTHER
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '+33',
        dob: '',
        arrivalDate: '',
        hasGuarantor: null as boolean | null,
        guarantorStatus: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // VALIDATION LOGIC
    const validateField = (field: string, value: any): string | null => {
        switch (field) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !value ? "L'email est requis" : !emailRegex.test(value) ? "Format email invalide" : null;
            case 'phone':
                if (!value) return "Le téléphone est requis";
                if (formData.countryCode === '+33') {
                    const frPhoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
                    // Allow simple 06... or 6... input for FR since we have prefix
                    const simpleFr = /^0?[1-9]\d{8}$/;
                    if (!value.replace(/\s/g, '').match(simpleFr) && !frPhoneRegex.test(value)) {
                        return "Format invalide (ex: 6 12 34 56 78)";
                    }
                } else {
                    if (value.length < 6) return "Numéro trop court";
                }
                return null;
            case 'firstName':
            case 'lastName':
                return !value || value.trim().length < 2 ? "Ce champ est requis (min 2 caractères)" : null;
            case 'dob':
                if (!value) return "La date de naissance est requise";
                // Optional: Check age > 16 or < 100
                return null;
            case 'arrivalDate':
                return !value ? "Date d'emménagement requise" : null;
            default:
                return null;
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: { [key: string]: string } = {};
        let isValid = true;

        if (currentStep === 1) {
            ['firstName', 'lastName'].forEach(field => {
                const error = validateField(field, formData[field as keyof typeof formData]);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            });
        } else if (currentStep === 2) {
            ['email', 'phone', 'dob'].forEach(field => {
                const error = validateField(field, formData[field as keyof typeof formData]);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            });
        } else if (currentStep === 3) {
            ['arrivalDate'].forEach(field => {
                const error = validateField(field, formData[field as keyof typeof formData]);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            });
            if (formData.hasGuarantor === null) {
                // Ensure guarantor choice is made? The current UI button selection handles it but button disabled state checks it.
                // We'll trust the button disabled state for null check on next, but validation can double check.
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setLoading(true);
        // Format Phone: Combine Country Code + Number (removing leading 0 for FR/common norms if needed)
        let formattedPhone = formData.phone.replace(/\s/g, '');
        if (formData.countryCode === '+33' && formattedPhone.startsWith('0')) {
            formattedPhone = formattedPhone.substring(1);
        }
        const fullPhone = `${formData.countryCode === '+other' ? '' : formData.countryCode}${formattedPhone}`;

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    phone: fullPhone, // Override with formatted phone
                    unitId,
                    residenceName,
                    type: 'QUALIFIED_LEAD'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'PROFILE_INCOMPLETE') {
                    alert(data.message);
                } else {
                    alert("Une erreur est survenue.");
                }
                setLoading(false);
                return;
            }

            // [TRACKING]
            try {
                fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventType: 'cta_clicked',
                        residenceId: unitId,
                        metadata: { unit_id: unitId, source: 'lead_form' }
                    })
                });
            } catch (e) { console.error('Tracking error', e); }

            // HANDLE ROUTING ACTIONS (Rule R3/M)
            if (data.action === 'REDIRECT' && data.destination) {
                // Show brief feedback or redirect immediately
                // For UX, it's often better to open in new tab or redirect current.
                // CDC implies flow handoff.
                window.location.href = data.destination;
                return;
            }

            // EMAIL SUCCESS Case
            setSuccessData({
                status: data.residenceStatus,
                slaDays: data.slaDays,
                capReached: data.capReached
            });
            setSuccess(true);
            setErrors({});

        } catch (e) {
            console.error(e);
            alert("Une erreur est survenue, veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // Store success context to render correct message
    const [successData, setSuccessData] = useState<{ status?: string, slaDays?: number, capReached?: boolean }>({});

    if (success) {
        // Rule M Messaging
        let title = "Demande envoyée !";
        let message = `Le gestionnaire de ${residenceName} a bien reçu votre dossier.`;
        let subMessage = "📧 Un email de confirmation vous a été envoyé.";

        if (successData.status === 'PARTNER_SLA') {
            title = "Dossier transmis (Prioritaire)";
            message = `Cette résidence partenaire s'engage à vous répondre sous ${successData.slaDays || 2} jours.`;
        } else if (successData.status === 'PARTNER_EMAIL') {
            message = `Votre demande a été transmise à la résidence. Vous recevrez une copie par email.`;
        }

        return (
            <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">{title}</h3>
                <p className="text-green-700 text-lg mb-4">
                    {message}
                </p>
                <div className="mt-6 p-4 bg-white rounded-lg border border-green-100 text-sm text-gray-500">
                    {subMessage}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center rounded-t-2xl">
                <h3 className="text-xl font-bold">Dossier de candidature</h3>
                <p className="text-blue-100 text-sm mt-1">Étape {step} / 4</p>
                {/* Progress Bar */}
                <div className="w-full bg-blue-900/30 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${step * 25}%` }}></div>
                </div>
            </div>

            <div className="p-6 md:p-8">

                {/* STEP 1: STATUS & IDENTITY */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-lg font-extrabold text-gray-900 mb-4">Quel est votre statut ?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleChange('status', 'STUDENT')}
                                    className={`cursor-pointer p-5 border-2 rounded-xl flex flex-col items-center gap-3 transition-all duration-200 
                                    ${formData.status === 'STUDENT'
                                            ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-600 transform scale-[1.02]'
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
                                >
                                    <User className={`w-8 h-8 ${formData.status === 'STUDENT' ? 'text-blue-700' : 'text-gray-400'}`} />
                                    <span className="font-bold text-lg text-gray-900">Étudiant</span>
                                </button>
                                <button
                                    onClick={() => handleChange('status', 'ACTIVE')}
                                    className={`p-5 border-2 rounded-xl flex flex-col items-center gap-3 transition-all duration-200
                                    ${formData.status === 'ACTIVE'
                                            ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-600 transform scale-[1.02]'
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Briefcase className={`w-8 h-8 ${formData.status === 'ACTIVE' ? 'text-blue-700' : 'text-gray-400'}`} />
                                    <span className="font-bold text-lg text-gray-900">Jeune Actif</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-base font-bold text-gray-900 mb-1">Prénom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => handleChange('firstName', e.target.value)}
                                    className={`w-full border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 p-4 text-lg text-gray-900 font-bold placeholder-gray-400 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="Ex: Thomas"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-900 mb-1">Nom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => handleChange('lastName', e.target.value)}
                                    className={`w-full border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 p-4 text-lg text-gray-900 font-bold placeholder-gray-400 ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="Ex: Martin"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lastName}</p>}
                            </div>
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-md cursor-pointer"
                        >
                            Suivant <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* STEP 2: PERSONAL INFO & AGE */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-lg font-bold text-gray-900 mb-3">Vos coordonnées</label>
                            <div className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            className={`w-full pl-10 border-2 rounded-lg p-4 text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-bold placeholder-gray-500 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            placeholder="email@ecole.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                                </div>
                                <div>
                                    <div className="relative flex">
                                        <div className="absolute left-3 top-3.5 z-10">
                                            <Phone className="text-gray-500 w-5 h-5" />
                                        </div>

                                        {/* Country Code Select */}
                                        <div className="relative">
                                            <select
                                                value={formData.countryCode}
                                                onChange={e => handleChange('countryCode', e.target.value)}
                                                className="w-[120px] pl-10 pr-8 border-y-2 border-l-2 border-r-0 border-gray-300 rounded-l-lg p-4 text-lg bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 bg-no-repeat appearance-none cursor-pointer transition-colors"
                                            >
                                                <option value="+33">🇫🇷 +33</option>
                                                <option value="+212">🇲🇦 +212</option>
                                                <option value="+213">🇩🇿 +213</option>
                                                <option value="+216">🇹🇳 +216</option>
                                                <option value="+221">🇸🇳 +221</option>
                                                <option value="+225">🇨🇮 +225</option>
                                                <option value="+49">🇩🇪 +49</option>
                                                <option value="+44">🇬🇧 +44</option>
                                                <option value="+34">🇪🇸 +34</option>
                                                <option value="+39">🇮🇹 +39</option>
                                                <option value="+86">🇨🇳 +86</option>
                                                <option value="+1">🇺🇸 +1</option>
                                                <option value="+other">🌍 Autre</option>
                                            </select>

                                            {/* Chevron Icon indicating dropdown */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 z-20">
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Phone Input */}
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => handleChange('phone', e.target.value)}
                                            className={`flex-1 min-w-0 border-2 rounded-r-lg p-4 text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-bold placeholder-gray-500 -ml-[2px] z-0 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            placeholder={formData.countryCode === '+33' ? "6 12 34 56 78" : "Numéro de téléphone"}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <DatePicker
                                label="Date de naissance"
                                value={formData.dob}
                                onChange={(date) => handleChange('dob', date)}
                                error={errors.dob}
                            />
                            <p className="text-sm text-gray-600 font-medium mt-2">Utilisée pour vérifier votre âge (mineur/majeur).</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={prevStep} className="px-5 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-400 cursor-pointer">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextStep}
                                className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 shadow-md"
                            >
                                Suivant <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PROJECT */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <DatePicker
                                label="Quand souhaitez-vous emménager ?"
                                value={formData.arrivalDate}
                                onChange={(date) => handleChange('arrivalDate', date)}
                                error={errors.arrivalDate}
                            />
                        </div>

                        {/* Simple Toggle for Guarantor to save clicks */}
                        <div>
                            <label className="block text-lg font-bold text-gray-900 mb-3">Avez-vous un garant ?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleChange('hasGuarantor', true)}
                                    className={`cursor-pointer p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all 
                                    ${formData.hasGuarantor === true
                                            ? 'border-green-600 bg-green-50 text-green-800 ring-2 ring-green-500 shadow-md'
                                            : 'border-gray-300 hover:border-green-400 bg-white'}`}
                                >
                                    <Shield className={`w-6 h-6 ${formData.hasGuarantor === true ? 'text-green-700' : 'text-gray-400'}`} />
                                    <span className="font-bold">Oui</span>
                                </button>
                                <button
                                    onClick={() => handleChange('hasGuarantor', false)}
                                    className={`cursor-pointer p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all 
                                    ${formData.hasGuarantor === false
                                            ? 'border-gray-500 bg-gray-100 text-gray-900 ring-2 ring-gray-400'
                                            : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                                >
                                    <span className="text-xl font-bold text-gray-500">?</span>
                                    <span className="font-bold text-gray-600">Non / Je ne sais pas</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={prevStep} className="px-5 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-400 cursor-pointer">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextStep}
                                className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 shadow-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                disabled={formData.hasGuarantor === null} // Keep button disabled for logic button logic, but validationStep handles empty date warning
                            >
                                Suivant <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: GUARANTOR DETAILS (Conditional) */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {formData.hasGuarantor ? (
                            <div>
                                <label className="block text-lg font-bold text-gray-900 mb-3">Type de garant</label>
                                <select
                                    value={formData.guarantorStatus}
                                    onChange={e => handleChange('guarantorStatus', e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-bold cursor-pointer"
                                >
                                    <option value="">Sélectionnez...</option>
                                    <option value="PARENTS">Parents / Famille</option>
                                    <option value="VISALE">Garantie Visale</option>
                                    <option value="GARANTME">GarantMe / Organisme</option>
                                    <option value="BANK">Caution Bancaire</option>
                                </select>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 text-sm text-yellow-900">
                                <p className="font-bold mb-1 text-base">Ne vous inquiétez pas !</p>
                                <p className="font-medium">De nombreuses résidences acceptent les étudiants sans garant via des dispositifs comme **Visale**. Nous vous accompagnerons.</p>
                            </div>
                        )}

                        <div className="bg-gray-100 p-4 rounded-xl text-sm text-gray-700 font-medium">
                            En cliquant sur Envoyer, vous acceptez d'être recontacté par le gestionnaire pour la finalisation.
                        </div>

                        <div className="flex gap-3">
                            <button onClick={prevStep} className="px-5 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-400 cursor-pointer">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg transform active:scale-95 transition-all cursor-pointer"
                            >
                                {loading ? 'Envoi...' : 'Envoyer mon dossier 🚀'}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Trust Badges - Premium Addition */}
            <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-100 flex justify-around items-center text-xs text-gray-500 font-medium">
                <div className="flex flex-col items-center gap-1">
                    <div className="p-1.5 bg-green-100 rounded-full text-green-700">
                        <Shield className="w-4 h-4" />
                    </div>
                    <span>Vérifié</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col items-center gap-1">
                    <div className="p-1.5 bg-blue-100 rounded-full text-blue-700">
                        <Check className="w-4 h-4" />
                    </div>
                    <span>Réponse 24h</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col items-center gap-1">
                    <div className="p-1.5 bg-purple-100 rounded-full text-purple-700">
                        <Star className="w-4 h-4" />
                    </div>
                    <span>Gratuit</span>
                </div>
            </div>
        </div>
    );
};
