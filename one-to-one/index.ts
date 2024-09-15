import { PrismaClient } from "@prisma/client";

const populateQuery = (query: string, params: any[]): string => {
    params.forEach((param, i) => {
        const placeholder = `$${i + 1}`;
        if (typeof param === "string") {
            param = `'${param}'`;
        }
        query = query.replace(placeholder, String(param));
    });
    return query;
};

const prisma = new PrismaClient({
    log: [{ emit: "event", level: "query" }],
});

prisma.$on("query", async (e: any) => {
    console.log(`[SQL QUERY] ${populateQuery(e.query, JSON.parse(e.params))}`);
});

async function main() {
    await prisma.parent.create({
        data: {
            child: {
                create: {},
            },
        },
    });
    const result = await prisma.parent.findMany({
        where: {
            NOT: {
                child: {
                    name: "Bob",
                },
            },
        },
    });
    console.log(`Result: Query returned ${result.length} rows`);
    // clear the database
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
