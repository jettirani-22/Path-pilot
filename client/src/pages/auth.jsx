import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound
} from "lucide-react";

const API_BASE = window.location.port === "5173" ? "/api" : (window.location.origin.includes("5000") ? "/api" : "http://localhost:5000/api");

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
        throw new Error(
            data.message || "Something went wrong."
        );
    }

    return data;
}

/* =========================================================
   LOGIN
========================================================= */

export function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email.");
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
                    email: email.trim(),
                    password
                })
            });

            onLogin(data.user, data.token);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-one" />
            <div className="auth-background-shape auth-shape-two" />

            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">
                        PathPilot <span>➤</span>
                    </div>

                    <p>Career Simulation Lab</p>
                </div>

                <div className="auth-heading">
                    <span className="auth-eyebrow">
                        WELCOME BACK
                    </span>

                    <h1>Experience Before You Choose.</h1>

                    <p>
                        Sign in to continue exploring careers,
                        simulations and your progress.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Email address

                        <div className="auth-input">
                            <Mail size={18} />

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                            />
                        </div>
                    </label>

                    <label>
                        Password

                        <div className="auth-input">
                            <LockKeyhole size={18} />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </label>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}

                        {!loading && (
                            <ArrowRight size={18} />
                        )}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>NEW TO PATHPILOT?</span>
                </div>

                <Link
                    className="auth-secondary"
                    to="/signup"
                >
                    Create a new account
                    <ArrowRight size={17} />
                </Link>

                <div className="auth-security">
                    <ShieldCheck size={17} />

                    <span>
                        Your account data is protected
                        by authenticated access.
                    </span>
                </div>

            </div>
        </div>
    );
}

/* =========================================================
   SIGN UP
========================================================= */

export function SignupPage({ onLogin }) {
    const [step, setStep] = useState(1);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [otp, setOtp] = useState("");

    const [verificationToken, setVerificationToken] =
        useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [developmentOtp, setDevelopmentOtp] =
        useState("");

    /* -----------------------------------------------------
       STEP 1 - SEND OTP
    ----------------------------------------------------- */

    const sendOtp = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (name.trim().length < 2) {
            setError(
                "Please enter your name."
            );
            return;
        }

        if (!email.trim()) {
            setError(
                "Please enter your email."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await apiRequest(
                "/auth/send-otp",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim()
                    })
                }
            );

            setDevelopmentOtp(
                data.developmentOtp || ""
            );

            setSuccess(
                data.message ||
                "Verification OTP sent."
            );

            setStep(2);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------------------
       STEP 2 - VERIFY OTP
    ----------------------------------------------------- */

    const verifyOtp = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Enter the 6-digit OTP."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await apiRequest(
                "/auth/verify-otp",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: email.trim(),
                        otp
                    })
                }
            );

            setVerificationToken(
                data.verificationToken
            );

            setSuccess(
                "Email verified successfully."
            );

            setStep(3);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------------------
       STEP 3 - CREATE PASSWORD
    ----------------------------------------------------- */

    const createAccount = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await apiRequest(
                "/auth/create-account",
                {
                    method: "POST",
                    body: JSON.stringify({
                        verificationToken,
                        password
                    })
                }
            );

            setSuccess(
                "Account created successfully."
            );

            setTimeout(() => {
                onLogin(
                    data.user,
                    data.token
                );
            }, 500);

        } catch (error) {
            setError(error.message);
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
                    <div className="auth-logo">
                        PathPilot <span>➤</span>
                    </div>

                    <p>Career Simulation Lab</p>
                </div>

                <div className="signup-progress">
                    <div
                        className={
                            step >= 1
                                ? "progress-step active"
                                : "progress-step"
                        }
                    >
                        <span>1</span>
                        <small>Details</small>
                    </div>

                    <div className="progress-line" />

                    <div
                        className={
                            step >= 2
                                ? "progress-step active"
                                : "progress-step"
                        }
                    >
                        <span>2</span>
                        <small>Verify</small>
                    </div>

                    <div className="progress-line" />

                    <div
                        className={
                            step >= 3
                                ? "progress-step active"
                                : "progress-step"
                        }
                    >
                        <span>3</span>
                        <small>Password</small>
                    </div>
                </div>

                {/* STEP 1 */}

                {step === 1 && (
                    <>
                        <div className="auth-heading">
                            <span className="auth-eyebrow">
                                CREATE ACCOUNT
                            </span>

                            <h1>Start your PathPilot journey.</h1>

                            <p>
                                Enter your details and we'll
                                verify your email before
                                creating your account.
                            </p>
                        </div>

                        <form
                            className="auth-form"
                            onSubmit={sendOtp}
                        >

                            <label>
                                Your name

                                <div className="auth-input">
                                    <UserRound size={18} />

                                    <input
                                        type="text"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="name"
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
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="email"
                                    />
                                </div>
                            </label>

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="auth-submit"
                                disabled={loading}
                                type="submit"
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Send Verification OTP"}

                                {!loading && (
                                    <ArrowRight size={18} />
                                )}
                            </button>

                        </form>
                    </>
                )}

                {/* STEP 2 */}

                {step === 2 && (
                    <>
                        <div className="auth-heading">
                            <span className="auth-eyebrow">
                                EMAIL VERIFICATION
                            </span>

                            <h1>Check your email.</h1>

                            <p>
                                We sent a 6-digit verification
                                code to:
                            </p>

                            <strong className="verification-email">
                                {email}
                            </strong>
                        </div>

                        <form
                            className="auth-form"
                            onSubmit={verifyOtp}
                        >

                            <label>
                                Verification OTP

                                <div className="auth-input otp-input">
                                    <ShieldCheck size={18} />

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(event) =>
                                            setOtp(
                                                event.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                            )
                                        }
                                    />
                                </div>
                            </label>

                            {developmentOtp && (
                                <div className="demo-otp">
                                    <strong>
                                        Development OTP:
                                    </strong>

                                    <span>
                                        {developmentOtp}
                                    </span>

                                    <small>
                                        Email SMTP is not configured
                                        yet. This code is shown only
                                        for local development.
                                    </small>
                                </div>
                            )}

                            {success && (
                                <div className="auth-success">
                                    <CheckCircle2 size={17} />
                                    {success}
                                </div>
                            )}

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="auth-submit"
                                disabled={loading}
                                type="submit"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify Email"}

                                {!loading && (
                                    <CheckCircle2 size={18} />
                                )}
                            </button>

                            <button
                                type="button"
                                className="auth-back-button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Change email
                            </button>

                        </form>
                    </>
                )}

                {/* STEP 3 */}

                {step === 3 && (
                    <>
                        <div className="auth-heading">
                            <span className="auth-eyebrow">
                                EMAIL VERIFIED
                            </span>

                            <h1>Create your password.</h1>

                            <p>
                                Your email has been verified.
                                Create a password to finish
                                your account.
                            </p>
                        </div>

                        <form
                            className="auth-form"
                            onSubmit={createAccount}
                        >

                            <label>
                                Create password

                                <div className="auth-input">
                                    <LockKeyhole size={18} />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </label>

                            <label>
                                Confirm password

                                <div className="auth-input">
                                    <LockKeyhole size={18} />

                                    <input
                                        type="password"
                                        placeholder="Enter password again"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                </div>
                            </label>

                            <div className="password-rule">
                                <CheckCircle2 size={16} />
                                At least 8 characters
                            </div>

                            {success && (
                                <div className="auth-success">
                                    <CheckCircle2 size={17} />
                                    {success}
                                </div>
                            )}

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="auth-submit"
                                disabled={loading}
                                type="submit"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create Account"}

                                {!loading && (
                                    <ArrowRight size={18} />
                                )}
                            </button>

                        </form>
                    </>
                )}

                <div className="auth-divider">
                    <span>ALREADY HAVE AN ACCOUNT?</span>
                </div>

                <Link
                    className="auth-secondary"
                    to="/login"
                >
                    Sign in instead
                    <ArrowRight size={17} />
                </Link>

            </div>
        </div>
    );
}