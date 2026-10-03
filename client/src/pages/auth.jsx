import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
    Sparkles,
    AlertCircle,
    Zap
} from "lucide-react";

const API_BASE = "/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({
        success: false,
        message: "Invalid server response."
    }));

    if (!response.ok) {
        const error = new Error(data.message || "Authentication request failed.");
        error.data = data;
        throw error;
    }

    return data;
}

/* =========================================================
   LOGIN (Direct Email & Password - No OTP)
========================================================= */

export function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(true);

    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const [error, setError] = useState("");
    const [isNotFound, setIsNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Load saved email if any
    useEffect(() => {
        const saved = localStorage.getItem("pathpilot_saved_email");
        if (saved) {
            setEmail(saved);
        }
    }, []);

    const handleLoginSuccess = (user, token) => {
        if (rememberEmail && email) {
            localStorage.setItem("pathpilot_saved_email", email.trim());
        }

        setSuccessMessage(`Welcome back, ${user?.name || "Explorer"}! Redirecting...`);

        if (typeof onLogin === "function") {
            onLogin(user, token);
        }

        setTimeout(() => {
            const redirectPath = location.state?.from || "/dashboard";
            navigate(redirectPath, { replace: true });
        }, 600);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setIsNotFound(false);
        setSuccessMessage("");

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: cleanEmail,
                    password
                })
            });

            handleLoginSuccess(data.user, data.token);

        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            if (err.data?.notFound) {
                setIsNotFound(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError("");
        setIsNotFound(false);
        setSuccessMessage("");

        try {
            setDemoLoading(true);
            const data = await apiRequest("/auth/demo-login", {
                method: "POST",
                body: JSON.stringify({ role: "student" })
            });

            handleLoginSuccess(data.user, data.token);
        } catch (err) {
            // Fallback: try regular login with seeded credentials
            try {
                const data = await apiRequest("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: "demo@pathpilot.com",
                        password: "password123"
                    })
                });
                handleLoginSuccess(data.user, data.token);
            } catch (fallbackErr) {
                setError("Unable to initialize demo account. You can register a new account below.");
            }
        } finally {
            setDemoLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-one" />
            <div className="auth-background-shape auth-shape-two" />

            <div className="auth-card">
                <div className="auth-brand">
                    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="auth-logo">
                            PathPilot <span>➤</span>
                        </div>
                        <p>Career Simulation Lab</p>
                    </Link>
                </div>

                <div className="auth-heading">
                    <span className="auth-eyebrow">
                        STUDENT & PROFESSIONAL PORTAL
                    </span>

                    <h1>Welcome Back</h1>

                    <p>
                        Sign in with your email and password to access your career tracks, interactive coding labs, and earned mastery badges.
                    </p>
                </div>

                {/* 1-Click Instant Demo Login Option */}
                <div style={{ marginBottom: 18 }}>
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={loading || demoLoading}
                        style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <Zap size={16} style={{ color: "#fef08a" }} />
                        <span>
                            {demoLoading ? "Accessing Demo Account..." : "⚡ One-Click Demo Student Login"}
                        </span>
                    </button>
                    <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#64748b" }}>
                        Pre-loaded with simulations & badges (demo@pathpilot.com)
                    </div>
                </div>

                <div className="auth-divider" style={{ margin: "16px 0 18px" }}>
                    <span>OR SIGN IN WITH EMAIL</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Email address
                        <div className="auth-input">
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </label>

                    <label>
                        Password
                        <div className="auth-input">
                            <LockKeyhole size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your account password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#64748b", margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                style={{ cursor: "pointer" }}
                            />
                            <span>Remember email</span>
                        </label>

                        <Link to="/signup" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                            Need an account?
                        </Link>
                    </div>

                    {error && (
                        <div className="auth-error" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <span>{error}</span>
                                {isNotFound && (
                                    <div style={{ marginTop: 6 }}>
                                        <Link
                                            to="/signup"
                                            state={{ initialEmail: email }}
                                            style={{ color: "#991b1b", textDecoration: "underline", fontWeight: 700 }}
                                        >
                                            Click here to create this account now →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="auth-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading || demoLoading || Boolean(successMessage)}
                    >
                        {loading ? (
                            <span>Signing In...</span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>NEW TO PATHPILOT?</span>
                </div>

                <Link className="auth-secondary" to="/signup">
                    <span>Create a new account (No OTP required)</span>
                    <ArrowRight size={17} />
                </Link>

                <div className="auth-security">
                    <ShieldCheck size={16} style={{ color: "#10b981" }} />
                    <span>Protected with encrypted passwords & JWT security tokens.</span>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   SIGN UP (1-Step Direct Account Creation - No OTP)
========================================================= */

export function SignupPage({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState(location.state?.initialEmail || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        if (cleanName.length < 2) {
            setError("Please enter your full name (at least 2 characters).");
            return;
        }

        if (!cleanEmail) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please verify your password confirmation.");
            return;
        }

        try {
            setLoading(true);

            // Directly register via /register with fallback to /create-account
            let data;
            try {
                data = await apiRequest("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        name: cleanName,
                        email: cleanEmail,
                        password
                    })
                });
            } catch (regErr) {
                if (regErr.data?.message?.includes("already exists")) {
                    throw regErr;
                }
                // Fallback to /create-account endpoint
                data = await apiRequest("/auth/create-account", {
                    method: "POST",
                    body: JSON.stringify({
                        name: cleanName,
                        email: cleanEmail,
                        password
                    })
                });
            }

            setSuccessMessage(`Account created! Welcome, ${cleanName}. Redirecting to dashboard...`);

            if (typeof onLogin === "function") {
                onLogin(data.user, data.token);
            }

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 600);

        } catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-one" />
            <div className="auth-background-shape auth-shape-two" />

            <div className="auth-card signup-card">
                <div className="auth-brand">
                    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="auth-logo">
                            PathPilot <span>➤</span>
                        </div>
                        <p>Career Simulation Lab</p>
                    </Link>
                </div>

                <div className="auth-heading">
                    <span className="auth-eyebrow">
                        INSTANT REGISTRATION
                    </span>

                    <h1>Create Your Account</h1>

                    <p>
                        Get immediate access to 4 career tracks, 288 progressive simulation tasks, and verified certifications.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Full name
                        <div className="auth-input">
                            <UserRound size={18} />
                            <input
                                type="text"
                                placeholder="e.g. Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>
                    </label>

                    <label>
                        Email address
                        <div className="auth-input">
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </label>

                    <label>
                        Password
                        <div className="auth-input">
                            <LockKeyhole size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <label>
                        Confirm password
                        <div className="auth-input">
                            <LockKeyhole size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Repeat password to confirm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </label>

                    {/* Password criteria status */}
                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#64748b" }}>
                        <span style={{ color: password.length >= 6 ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={13} style={{ color: password.length >= 6 ? "#16a34a" : "#94a3b8" }} />
                            6+ characters
                        </span>
                        <span style={{ color: password && password === confirmPassword ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={13} style={{ color: password && password === confirmPassword ? "#16a34a" : "#94a3b8" }} />
                            Passwords match
                        </span>
                    </div>

                    {error && (
                        <div className="auth-error" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="auth-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading || Boolean(successMessage)}
                    >
                        {loading ? (
                            <span>Creating Account...</span>
                        ) : (
                            <>
                                <span>Create Account & Start</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ALREADY REGISTERED?</span>
                </div>

                <Link className="auth-secondary" to="/login">
                    <span>Sign in to your account</span>
                    <ArrowRight size={17} />
                </Link>

                <div className="auth-security">
                    <ShieldCheck size={16} style={{ color: "#10b981" }} />
                    <span>Instant access without verification delays.</span>
                </div>
            </div>
        </div>
    );
}