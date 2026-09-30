import jwt from "jsonwebtoken";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (process.env.NODE_ENV === "production" && (!secret || secret.includes("change-this") || secret.includes("change_this"))) {
        throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be configured in production.");
    }
    return secret || "pathpilot-development-secret-change-this";
}

export function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        getJwtSecret(),
        {
            expiresIn: "7d"
        }
    );
}

export function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const parts = authHeader.trim().split(/\s+/);

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(token, getJwtSecret());

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.trim().split(/\s+/);
            if (parts.length === 2 && parts[0] === "Bearer") {
                const decoded = jwt.verify(parts[1], getJwtSecret());
                req.user = decoded;
            }
        }
    } catch (_) {}
    next();
}

export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }
    next();
}