"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Swal from "sweetalert2";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailValid, setEmailValid] = useState(null);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpPurpose, setOtpPurpose] = useState(null); // verifyEmail | resetPassword

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Debounced email validation (signup)
  useEffect(() => {
    if (mode !== "signup" || !email) {
      setEmailValid(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/validate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setEmailValid(Boolean(data.valid));
      } catch {
        setEmailValid(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, mode]);

  // Login
  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res && !res.error) {
        router.push("/");
      } else {
        setMessage(res?.error || "Invalid email or password");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = () => {
    signIn("google");
  };

  // Send OTP for signup
  const handleSignupOtp = async () => {
    if (!name.trim() || !password || password.length < 6) {
      setMessage("Name and password (min 6 chars) are required");
      return;
    }
    if (!emailValid) {
      setMessage("Email invalid or already taken");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpPurpose("verifyEmail");
        setOtpModalOpen(true);
        Swal.fire("OTP Sent", "Check your email for the code", "success");
      } else {
        setMessage(data.message || "Failed to send OTP");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & complete signup
  const verifyEmailAndRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!data.success) {
        Swal.fire("Invalid Code", "OTP is incorrect", "error");
        setLoading(false);
        return;
      }
      const reg = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await reg.json();
      if (regData.success) {
        Swal.fire("Success", "Account created. You can log in.", "success");
        setOtpModalOpen(false);
        setMode("login");
      } else {
        Swal.fire("Error", regData.message || "Signup failed", "error");
      }
    } catch {
      Swal.fire("Error", "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Request reset OTP
  const requestResetOtp = async () => {
    if (!email) {
      setMessage("Enter your email first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/request-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpPurpose("resetPassword");
        setOtpModalOpen(true);
        Swal.fire("OTP Sent", "Check your email", "success");
      } else {
        setMessage(data.message || "Failed to send reset OTP");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Verify reset OTP and set new password
  const verifyResetAndUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }), // 🔥 FIXED
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Success", "Password updated", "success");
        setOtpModalOpen(false);
        setMode("login");
      } else {
        Swal.fire("Error", data.message || "Reset failed", "error");
      }
    } catch {
      Swal.fire("Error", "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignupOtp();
    else if (mode === "reset") requestResetOtp();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <a href="/" className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            </a>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-gray-900">
            {mode === "login" && "Login to ARIA"}
            {mode === "signup" && "Create an Account"}
            {mode === "reset" && "Reset Password"}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            {mode === "login" && "Log in with your email and password"}
            {mode === "signup" && "Sign up with your details"}
            {mode === "reset" && "Enter your email to reset password"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500"
                required
              />
              {mode === "signup" && emailValid === false && (
                <p className="text-red-500 text-xs">Email is invalid or already taken</p>
              )}
            </div>
            {mode !== "reset" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
            )}
            {mode === "reset" && (
              <p className="text-xs text-gray-500 mb-2">
                You’ll set a new password after OTP verification
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : mode === "signup"
                    ? "Sign Up"
                    : "Send Reset OTP"}
            </button>
          </form>

          {/* Message */}
          {message && <p className="text-center text-sm mt-4 text-gray-600">{message}</p>}

          {/* Mode switch */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === "login" && (
              <>
                Don’t have an account?{" "}
                <button className="text-purple-500" onClick={() => { setMode("signup"); setMessage(""); }}>
                  Sign Up
                </button>
                <br />
                Forgot password?{" "}
                <button className="text-purple-500" onClick={() => { setMode("reset"); setMessage(""); }}>
                  Reset
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button className="text-purple-500" onClick={() => { setMode("login"); setMessage(""); }}>
                  Login
                </button>
              </>
            )}
            {mode === "reset" && (
              <>
                Back to{" "}
                <button className="text-purple-500" onClick={() => { setMode("login"); setMessage(""); }}>
                  Login
                </button>
              </>
            )}
          </p>

          {/* Divider + Google */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-2 rounded-md text-sm font-medium flex items-center justify-center hover:bg-gray-50"
            type="button"
            disabled={loading}
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {otpPurpose === "verifyEmail" ? "Enter Signup OTP" : "Enter Reset OTP"}
            </h3>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="border p-2 w-full mb-3 text-center tracking-widest"
              autoFocus
            />

            {/* New password input only for reset */}
            {otpPurpose === "resetPassword" && (
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="border p-2 w-full mb-3"
              />
            )}

            <button
              onClick={otpPurpose === "verifyEmail" ? verifyEmailAndRegister : verifyResetAndUpdate}
              className="bg-purple-500 text-white w-full py-2 rounded mb-2 disabled:opacity-50"
              disabled={loading}
            >
              Verify
            </button>
            <button
              onClick={() => setOtpModalOpen(false)}
              className="border w-full py-2 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}