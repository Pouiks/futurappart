
import { PrismaClient } from '@prisma/client';
import { differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('[Cleanup] Starting retention cleanup...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    try {
        // 1. Find inactive profiles
        // We look for profiles where lastSeenAt < 30 days ago
        // AND having at least one document
        const inactiveProfiles = await prisma.profile.findMany({
            where: {
                lastSeenAt: {
                    lt: cutoffDate
                },
                dossierPersons: {
                    some: {
                        documents: {
                            some: {}
                        }
                    }
                }
            },
            select: {
                id: true,
                email: true,
                dossierPersons: {
                    select: {
                        documents: {
                            select: {
                                id: true,
                                storagePath: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`[Cleanup] Found ${inactiveProfiles.length} inactive profiles.`);

        if (inactiveProfiles.length === 0) {
            console.log('[Cleanup] Nothing to clean.');
            return;
        }

        let totalDocs = 0;

        // 2. Delete Documents
        for (const profile of inactiveProfiles) {
            const docIds: string[] = [];
            const storagePaths: string[] = [];

            profile.dossierPersons.forEach(p => {
                p.documents.forEach(d => {
                    docIds.push(d.id);
                    if (d.storagePath) storagePaths.push(d.storagePath);
                });
            });

            if (docIds.length > 0) {
                // Delete from DB
                await prisma.userDocument.deleteMany({
                    where: {
                        id: { in: docIds }
                    }
                });

                // TODO: Delete from Storage Bucket
                // await supabase.storage.from('secure-documents').remove(storagePaths);

                totalDocs += docIds.length;
                console.log(`[Cleanup] User ${profile.email}: Deleted ${docIds.length} documents.`);
            }
        }

        console.log(`[Cleanup] Completed. Total documents removed: ${totalDocs}`);

    } catch (error) {
        console.error('[Cleanup] Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
