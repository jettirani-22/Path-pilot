import {
    initializeDatabase,
    getDatabase
} from "./src/database/database.js";

try {
    await initializeDatabase();

    const db = getDatabase();

    const result = db.exec(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
    `);

    console.log("\nDATABASE TABLES:");

    if (result.length > 0) {
        for (const row of result[0].values) {
            console.log("✓", row[0]);
        }
    } else {
        console.log("No tables found.");
    }

} catch (error) {
    console.error("\nDATABASE ERROR:");
    console.error(error);
}