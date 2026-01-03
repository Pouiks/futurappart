
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "../lib/db"; // Assumes this is where your prisma client is
import { UnitTypeEnum } from "@prisma/client";

// Create an MCP server
const server = new McpServer({
    name: "MonLogementEtudiant",
    version: "1.0.0",
});

// Define the 'search_housing' tool
server.tool(
    "search_housing",
    "Search for student housing in a specific city with budget and type filters.",
    {
        city: z.string().describe("The city to search in (e.g., 'Lyon', 'Bordeaux')"),
        budgetMax: z.number().describe("Maximum budget in euros per month"),
        minSurface: z.number().optional().describe("Minimum surface area in m2"),
        type: z.enum(['STUDIO', 'COLOCATION', 'T1', 'T2']).optional().describe("Type of housing"),
    },
    async ({ city, budgetMax, minSurface, type }) => {
        try {
            const cityNormalized = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

            const whereClause: any = {
                residence: { cityNormalized: { contains: cityNormalized } }, // Loose match
                price: { lte: budgetMax },
            };

            if (minSurface) {
                whereClause.surface = { gte: minSurface };
            }

            if (type) {
                // Map simple types to DB enums if needed, or fuzzy match
                if (type === 'STUDIO') whereClause.type = UnitTypeEnum.STUDIO;
                if (type === 'COLOCATION') whereClause.type = UnitTypeEnum.COLOCATION;
                // Add more mappings as needed
            }

            const results = await prisma.canonUnit.findMany({
                where: whereClause,
                include: { residence: true },
                take: 5,
                orderBy: { price: 'asc' }
            });

            if (results.length === 0) {
                return {
                    content: [{ type: "text", text: `No housing found in ${city} for budget ${budgetMax}€.` }],
                };
            }

            // Format as Markdown for the LLM
            const formatted = results.map(u => {
                return `
### ${u.residence.name} (${u.type})
- **Price**: ${u.price}€/mois
- **Surface**: ${u.surface ? u.surface + 'm²' : 'N/C'}
- **City**: ${u.residence.cityNormalized}
- [View Offer](${u.residence.url})
        `.trim();
            }).join("\n\n");

            return {
                content: [{ type: "text", text: `Here are the top ${results.length} results found:\n\n${formatted}` }],
            };

        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error searching housing: ${error.message}` }],
            };
        }
    }
);

// Start the server with Stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server MonLogementEtudiant running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
