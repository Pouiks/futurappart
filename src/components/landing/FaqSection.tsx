import React from 'react';
import { useTranslations } from 'next-intl';

export const FaqSection = () => {
    const t = useTranslations('FAQ');

    // Mapping FAQs manually since we defined specific keys
    const faqs = [
        { question: t('q1'), answer: t('a1') },
        { question: t('q2'), answer: t('a2') },
        { question: t('q3'), answer: t('a3') },
        { question: t('q4'), answer: t('a4') },
        { question: t('q5'), answer: t('a5') },
        { question: t('q6'), answer: t('a6') }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
    };

    return (
        <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 md:mb-12 text-gray-900 tracking-tight">
                    {t('title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                            <details className="group h-fit">
                                <summary className="flex justify-between items-center font-bold text-lg md:text-xl cursor-pointer list-none text-gray-800">
                                    <span>{faq.question}</span>
                                    <span className="transition-transform group-open:rotate-180 flex-shrink-0">
                                        <svg
                                            fill="none"
                                            height="24"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                            width="24"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="text-gray-600 mt-4 leading-relaxed text-base md:text-lg animate-fadeIn">
                                    {faq.answer}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>

                {/* JSON-LD for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </section>
    );
};
