import jwt from "jsonwebtoken";

function getJwtSecret() {
    return (
        process.env.JWT_SECRET ||
        "pathpilot-development-secret-change-this"
    );
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