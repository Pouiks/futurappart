import { AccountSidebar } from "@/components/layout/AccountSidebar";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 md:px-8 max-w-[1200px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="sticky top-24">
                            <AccountSidebar />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
