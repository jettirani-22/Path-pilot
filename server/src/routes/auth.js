import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

import {
    queryOne,
    queryAll,
    execute
} from "../database/database.js";

import {
    generateToken,
    authenticateToken
} from "../middleware/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Rate limiting
|--------------------------------------------------------------------------
*/

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests. Please wait before trying again."
    }
});

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function cleanText(value) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (process.env.NODE_ENV === "production" && (!secret || secret.includes("change-this") || secret.includes("change_this"))) {
        throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be configured in production.");
    }
    return secret || "pathpilot-development-secret-change-this";
}

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/*
|--------------------------------------------------------------------------
| POST /api/auth/send-otp
|--------------------------------------------------------------------------
*/

router.post("/send-otp", otpLimiter, async (req, res) => {
    try {
        const name = cleanText(req.body.name);
        const email = cleanText(req.body.email).toLowerCase();

        if (!name || name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter your name."
            });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Check if user already exists
        const existingUser = await queryOne(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists. Please log in."
            });
        }

        // Generate OTP & hash
        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Clear previous verification & save new record
        await execute("DELETE FROM email_verifications WHERE email = ?", [email]);
        await execute(
            `INSERT INTO email_verifications (name, email, otp_hash, expires_at, attempts)
             VALUES (?, ?, ?, ?, 0)`,
            [name, email, otpHash, expiresAt]
        );

        const isSmtpConfigured =
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            !process.env.SMTP_USER.includes("YOUR_GMAIL") &&
            !process.env.SMTP_PASS.includes("YOUR_GMAIL");

        if (!isSmtpConfigured) {
            console.log("\n====================================");
            console.log("PATHPILOT DEVELOPMENT OTP");
            console.log(`Email: ${email}`);
            console.log(`OTP Code: ${otp}`);
            console.log("====================================\n");

            return res.json({
                success: true,
                message: "Verification OTP generated. (Email service not configured - check development code).",
                developmentOtp: otp
            });
        }

        try {
            const transporter = getTransporter();
            await transporter.sendMail({
                from: `"PathPilot" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "PathPilot Email Verification OTP",
                text: `Hello ${name},\n\nYour PathPilot verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nPathPilot Career Simulation Lab`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px;">
                        <h2 style="color:#1469eb;margin-top:0;">PathPilot ➤</h2>
                        <p>Hello <strong>${name}</strong>,</p>
                        <p>Your email verification code is:</p>
                        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:18px;background:#eff6ff;color:#1469eb;text-align:center;border-radius:8px;margin:20px 0;">
                            ${otp}
                        </div>
                        <p style="font-size:12px;color:#64748b;">This OTP code expires in 10 minutes. If you did not request this, please disregard.</p>
                    </div>
                `
            });

            return res.json({
                success: true,
                message: "Verification OTP sent to your email."
            });
        } catch (mailError) {
            console.warn("SMTP send failed, falling back to development OTP:", mailError.message);
            return res.json({
                success: true,
                message: "Verification OTP generated.",
                developmentOtp: otp
            });
        }

    } catch (error) {
        console.error("SEND OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send verification OTP."
        });
    }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/verify-otp
|--------------------------------------------------------------------------
*/

router.post("/verify-otp", authLimiter, async (req, res) => {
    try {
        const email = cleanText(req.body.email).toLowerCase();
        const otp = cleanText(req.body.otp);

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must contain 6 digits."
            });
        }

        const verification = await queryOne(
            "SELECT * FROM email_verifications WHERE email = ? LIMIT 1",
            [email]
        );

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: "No OTP request found. Please request a new verification code."
            });
        }

        if (Number(verification.attempts) >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect OTP attempts. Please request a new OTP."
            });
        }

        const expiresAt = new Date(verification.expires_at).getTime();
        if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new code."
            });
        }

        const otpMatches = await bcrypt.compare(otp, verification.otp_hash);
        if (!otpMatches) {
            await execute(
                "UPDATE email_verifications SET attempts = attempts + 1 WHERE email = ?",
                [email]
            );

            return res.status(400).json({
                success: false,
                message: "Incorrect verification code."
            });
        }

        // Mark verified
        await execute(
            "UPDATE email_verifications SET verified_at = CURRENT_TIMESTAMP WHERE email = ?",
            [email]
        );

        const verificationToken = jwt.sign(
            {
                type: "email_verification",
                email,
                name: verification.name
            },
            getJwtSecret(),
            { expiresIn: "15m" }
        );

        return res.json({
            success: true,
            message: "Email verified successfully.",
            verificationToken
        });

    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP."
        });
    }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/create-account
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| POST /api/auth/register (Direct Signup - No OTP Required)
|--------------------------------------------------------------------------
*/

router.post("/register", authLimiter, async (req, res) => {
    try {
        const name = cleanText(req.body.name);
        const email = cleanText(req.body.email).toLowerCase();
        const password = req.body.password;

        if (!name || name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter your name (at least 2 characters)."
            });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const existing = await queryOne(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists. Please sign in instead."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, passwordHash, "student"]
        );

        const user = await queryOne(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: `Account created successfully! Welcome, ${user.name}.`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create account. Please try again."
        });
    }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/create-account (Backward Compatible Direct or Verified Signup)
|--------------------------------------------------------------------------
*/

router.post("/create-account", authLimiter, async (req, res) => {
    try {
        const name = cleanText(req.body.name);
        const email = cleanText(req.body.email).toLowerCase();
        const verificationToken = cleanText(req.body.verificationToken);
        const password = req.body.password;

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        let targetEmail = email;
        let targetName = name;

        // If a verification token was passed, extract from it
        if (verificationToken) {
            try {
                const decoded = jwt.verify(verificationToken, getJwtSecret());
                if (decoded.email) targetEmail = cleanText(decoded.email).toLowerCase();
                if (decoded.name) targetName = cleanText(decoded.name);
            } catch (_) {}
        }

        if (!targetEmail || !isValidEmail(targetEmail)) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required."
            });
        }

        if (!targetName || targetName.length < 2) {
            targetName = targetEmail.split("@")[0] || "Explorer";
        }

        const existing = await queryOne(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [targetEmail]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [targetName, targetEmail, passwordHash, "student"]
        );

        const user = await queryOne(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ? LIMIT 1",
            [targetEmail]
        );

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: `Account created successfully! Welcome, ${user.name}.`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("CREATE ACCOUNT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/login (Email + Password Login)
|--------------------------------------------------------------------------
*/

router.post("/login", authLimiter, async (req, res) => {
    try {
        const email = cleanText(req.body.email).toLowerCase();
        const password = req.body.password;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (typeof password !== "string" || password.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }

        const user = await queryOne(
            "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                notFound: true,
                message: "No account found with this email. Please check your email or click Create an Account."
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please verify and try again."
            });
        }

        await execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            [user.id]
        );

        const token = generateToken(user);

        return res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/demo-login (1-Click Instant Demo Login)
|--------------------------------------------------------------------------
*/

router.post("/demo-login", authLimiter, async (req, res) => {
    try {
        const role = req.body.role === "admin" ? "admin" : "student";
        const email = role === "admin" ? "admin@pathpilot.com" : "demo@pathpilot.com";
        const name = role === "admin" ? "PathPilot Admin" : "Alex Morgan (Demo)";

        let user = await queryOne(
            "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (!user) {
            const passwordHash = await bcrypt.hash("password123", 10);
            await execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                [name, email, passwordHash, role]
            );
            user = await queryOne(
                "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1",
                [email]
            );
        }

        await execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            [user.id]
        );

        const token = generateToken(user);

        return res.json({
            success: true,
            message: `Logged in as ${user.name}!`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("DEMO LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Demo login failed."
        });
    }
});

/*
|--------------------------------------------------------------------------
| GET /api/auth/me
|--------------------------------------------------------------------------
*/

router.get("/me", authenticateToken, async (req, res) => {
    try {
        const userId = Number(req.user.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid user authentication."
            });
        }

        const user = await queryOne(
            "SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("ME ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve user details."
        });
    }
});

export default router;