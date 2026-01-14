'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4 font-sans">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Oups ! Une erreur critique est survenue.</h2>
                <p className="mb-6 text-gray-600">Le serveur rencontre des difficultés momentanées. Pas d'inquiétude, cela n'affecte pas vos données.</p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    Réessayer
                </button>
            </body>
        </html>
    );
}
