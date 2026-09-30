import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { initializeDatabase } from "./database/database.js";
import apiRoutes from "./routes/index.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

import fs from "fs";

/*
|--------------------------------------------------------------------------
| Security & CORS
|--------------------------------------------------------------------------
*/

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false
    })
);

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5000"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (!isProduction || allowedOrigins.includes(origin) || origin.endsWith(".railway.app")) {
                return callback(null, true);
            }
            callback(new Error("CORS policy blocked this origin"));
        },
        credentials: true
    })
);

/*
|--------------------------------------------------------------------------
| Request body
|--------------------------------------------------------------------------
*/

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: false,
        limit: "1mb"
    })
);

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PathPilot server is running."
    });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api", apiRoutes);

/*
|--------------------------------------------------------------------------
| Frontend Static Files & SPA Fallback
|--------------------------------------------------------------------------
*/

const clientDistPath = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // Handle unknown /api endpoints with 404 JSON
    app.use("/api", (req, res) => {
        res.status(404).json({
            success: false,
            message: "API route not found."
        });
    });

    // SPA fallback: return index.html for all non-API web routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
} else {
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: "API route not found."
        });
    });
}

/*
|--------------------------------------------------------------------------
| Error handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

try {
    await initializeDatabase();

    app.listen(PORT, () => {
        console.log("");
        console.log("====================================");
        console.log("PathPilot Server Started");
        console.log("====================================");
        console.log(`API: http://localhost:${PORT}`);
        console.log("Database: Connected");
        console.log("====================================");
        console.log("");
    });

} catch (error) {
    console.error("");
    console.error("DATABASE STARTUP ERROR:");
    console.error(error);
    process.exit(1);
}