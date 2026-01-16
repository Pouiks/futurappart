export default function AccountLoading() {
    return (
        <div className="w-full h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Chargement de votre espace...</p>
            </div>
        </div>
    );
}
