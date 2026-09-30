import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pg from "pg";
import { seedDatabaseIfEmpty } from "./seed.js";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverDirectory = path.join(__dirname, "..", "..");
const databasePath = path.join(serverDirectory, "pathpilot.db");
const sqliteSchemaPath = path.join(__dirname, "schema.sql");
const pgSchemaPath = path.join(__dirname, "pgSchema.sql");

let SQL;
let sqliteDb = null;
let pgPool = null;
let currentDbEngine = "sqlite"; // "postgres" or "sqlite"

async function createPgPool(rawUrl) {
    let poolConfig = null;
    let fallbackPoolConfig = null;

    try {
        const regex = /^(postgres(?:ql)?:\/\/)(.*?):(.*)@([^@\/:]+)(?::(\d+))?\/([^?]+)(?:\?(.*))?$/;
        const match = rawUrl.match(regex);
        if (match) {
            const [, , rawUser, rawPass, host, port, dbName] = match;
            const decodedPass = decodeURIComponent(rawPass);
            poolConfig = {
                user: rawUser,
                password: decodedPass,
                host: host,
                port: port ? parseInt(port, 10) : 5432,
                database: dbName,
                ssl: host.includes("localhost") ? false : { rejectUnauthorized: false }
            };

            const supabaseMatch = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
            if (supabaseMatch) {
                const projectRef = supabaseMatch[1];
                fallbackPoolConfig = {
                    ...poolConfig,
                    host: "aws-0-ap-northeast-2.pooler.supabase.com",
                    user: poolConfig.user.includes(".") ? poolConfig.user : `postgres.${projectRef}`
                };
            }
        }
    } catch (_) {
        // Fall back to connectionString
    }

    if (!poolConfig) {
        poolConfig = {
            connectionString: rawUrl,
            ssl: rawUrl.includes("localhost") ? false : { rejectUnauthorized: false }
        };
    }

    try {
        const testPool = new Pool(poolConfig);
        const client = await testPool.connect();
        client.release();
        return testPool;
    } catch (err) {
        if (fallbackPoolConfig && (err.code === "ENOTFOUND" || err.message.includes("ENOTFOUND") || err.message.includes("ETIMEDOUT"))) {
            console.log(`ℹ️ Direct connection to ${poolConfig.host} unavailable (${err.code || err.message}).`);
            console.log(`⚡ Routing through Supabase IPv4 connection pooler (${fallbackPoolConfig.host})...`);
            const fallbackPool = new Pool(fallbackPoolConfig);
            const client = await fallbackPool.connect();
            client.release();
            return fallbackPool;
        }
        throw err;
    }
}

// Initialize database (Postgres if DATABASE_URL is provided, else SQLite)
async function initializeDatabase() {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (databaseUrl && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
        try {
            console.log("🔗 Connecting to Cloud PostgreSQL database...");

            pgPool = await createPgPool(databaseUrl);
            console.log("✅ Connected to Cloud PostgreSQL database successfully!");

            // Run PostgreSQL schema
            const pgSchema = fs.readFileSync(pgSchemaPath, "utf8");
            await pgPool.query(pgSchema);
            console.log("✅ PostgreSQL schema verified/created");

            currentDbEngine = "postgres";

            // Seed questions & courses if empty
            await seedDatabaseIfEmpty("postgres", queryOne, execute);

            return { engine: "postgres", pool: pgPool };

        } catch (error) {
            console.error("❌ Failed to connect to PostgreSQL:", error.message);
            console.log("⚠️ Falling back to local SQLite database...");
            pgPool = null;
        }
    }

    // Default: SQLite via sql.js
    console.log("📂 Initializing Local SQLite database (pathpilot.db)...");
    SQL = await initSqlJs({
        locateFile: (file) =>
            path.join(
                serverDirectory,
                "node_modules",
                "sql.js",
                "dist",
                file
            )
    });

    if (fs.existsSync(databasePath)) {
        const fileBuffer = fs.readFileSync(databasePath);
        sqliteDb = new SQL.Database(fileBuffer);
        console.log("📂 Existing SQLite database loaded");
    } else {
        sqliteDb = new SQL.Database();
        console.log("🆕 New SQLite database created");
    }

    sqliteDb.run("PRAGMA foreign_keys = ON;");

    // Auto-migrate any missing columns for existing SQLite tables before applying indexes
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN test_cases TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN starter_code TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN expected_output TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN code_language TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN task_number INTEGER DEFAULT 1;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE questions ADD COLUMN topic TEXT DEFAULT 'General';"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN task_number INTEGER DEFAULT 1;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN is_cancelled INTEGER DEFAULT 0;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN cancellation_reason TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN violation_count INTEGER DEFAULT 0;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN camera_verified INTEGER DEFAULT 0;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE test_attempts ADD COLUMN assigned_questions TEXT;"); } catch (_) {}
    try { sqliteDb.run("ALTER TABLE attempt_answers ADD COLUMN task_number INTEGER;"); } catch (_) {}

    const schema = fs.readFileSync(sqliteSchemaPath, "utf8");
    sqliteDb.run(schema);

    currentDbEngine = "sqlite";

    // Seed questions & courses if empty
    await seedDatabaseIfEmpty("sqlite", queryOne, execute);

    saveDatabase();

    console.log("✅ SQLite database initialized");
    console.log(`📁 Database file: ${databasePath}`);

    return { engine: "sqlite", db: sqliteDb };
}

// Save SQLite database to disk
function saveDatabase() {
    if (!sqliteDb) return;
    try {
        const data = sqliteDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(databasePath, buffer);
    } catch (e) {
        console.error("Save SQLite database error:", e.message);
    }
}

// Convert SQLite '?' placeholders to PostgreSQL '$1, $2, ...'
function formatSqlForEngine(sql) {
    if (currentDbEngine === "postgres") {
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    }
    return sql;
}

// Helper: Query all matching rows
async function queryAll(sql, params = []) {
    if (currentDbEngine === "postgres" && pgPool) {
        const pgSql = formatSqlForEngine(sql);
        const result = await pgPool.query(pgSql, params);
        return result.rows;
    }

    if (!sqliteDb) {
        throw new Error("Database not initialized");
    }

    const stmt = sqliteDb.prepare(sql);
    if (params && params.length > 0) {
        stmt.bind(params);
    }
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

// Helper: Query a single row or null
async function queryOne(sql, params = []) {
    const rows = await queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Helper: Execute INSERT/UPDATE/DELETE
async function execute(sql, params = []) {
    if (currentDbEngine === "postgres" && pgPool) {
        const pgSql = formatSqlForEngine(sql);
        const result = await pgPool.query(pgSql, params);
        return {
            rowsModified: result.rowCount,
            rows: result.rows
        };
    }

    if (!sqliteDb) {
        throw new Error("Database not initialized");
    }

    sqliteDb.run(sql, params);
    saveDatabase();
    return {
        rowsModified: sqliteDb.getRowsModified()
    };
}

// Get raw DB instance
function getDatabase() {
    return sqliteDb;
}

function getDbEngine() {
    return currentDbEngine;
}

export {
    initializeDatabase,
    getDatabase,
    getDbEngine,
    saveDatabase,
    queryAll,
    queryOne,
    execute
};