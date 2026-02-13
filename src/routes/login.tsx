import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  const clearEmailError = () => {
    setEmailError(null);
    setFormError(null);
  };
  const clearPasswordError = () => {
    setPasswordError(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0] ?? null);
      setPasswordError(fieldErrors.password?.[0] ?? null);
      return;
    }

    setSubmitting(true);
    const { error: err } = await signIn(
      parsed.data.email,
      parsed.data.password,
    );
    setSubmitting(false);

    if (err) {
      setFormError("Email not authorised or invalid password");
      toast.error("Email not authorised or invalid password");
      return;
    }

    toast.success("Signed in successfully");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-text-secondary text-base">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
      <div className="w-full max-w-md bg-surface-light p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text-main mb-2">Sign in</h1>
        <p className="text-text-secondary text-base mb-6">
          Association management
        </p>
        <p className="text-sm text-text-muted mb-4 bg-surface-gray p-3 break-all">
          Demo: vaishakhpat2003@gmail.com / admin@123
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {formError}
            </div>
          )}
          <div>
            <label
              htmlFor="login-email"
              className="block text-base font-semibold text-text-main mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearEmailError();
              }}
              className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "login-email-error" : undefined}
            />
            {emailError && (
              <p
                id="login-email-error"
                className="mt-1.5 text-sm text-red-700"
                role="alert"
              >
                {emailError}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-base font-semibold text-text-main mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearPasswordError();
              }}
              className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={
                passwordError ? "login-password-error" : undefined
              }
            />
            {passwordError && (
              <p
                id="login-password-error"
                className="mt-1.5 text-sm text-red-700"
                role="alert"
              >
                {passwordError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[48px] bg-primary text-white font-bold text-base hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
