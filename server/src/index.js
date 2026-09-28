import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { initializeDatabase } from "./database/database.js";
import apiRoutes from "./routes/index.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

app.use(
    cors({
        origin: CLIENT_URL,
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
| API 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

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