import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, HardHat, Loader2, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";

const adminEmails = [
  "mahathicontractors@gmail.com",
  "devigayatri2002@gmail.com",
  "tanushkumar2006@gmail.com",
  "simhadri.tanushkumar@gmail.com",
];

function routeFor(user) {
  return adminEmails.includes((user?.email || "").toLowerCase()) || user?.role === "admin"
    ? "/admin"
    : "/dashboard";
}

const cleanMobile = (value) => value.replace(/\D/g, "").slice(0, 10);
const cleanOtp = (value) => value.replace(/\D/g, "").slice(0, 6);

export default function Login() {
  const navigate = useNavigate();
  const {
    loginWithEmail,
    loginWithGoogle,
    createAccount,
    sendEmailOtp,
    verifySignupOtp,
    verifyLoginOtp,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState("");
  const [notice, setNotice] = useState("");
  const [otp, setOtp] = useState("");
  const [otpContext, setOtpContext] = useState(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPassword, setOtpPassword] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
  });

  const update = (key, value) => {
    setNotice("");
    setForm((prev) => ({ ...prev, [key]: key === "mobileNumber" ? cleanMobile(value) : value }));
  };

  const showOtpScreen = ({ context, email, password = "" }) => {
    const normalizedEmail = email.trim().toLowerCase();
    setOtp("");
    setOtpContext(context);
    setOtpEmail(normalizedEmail);
    setOtpPassword(password);
    setMode("otp");
    setNotice(`Verification code sent to ${normalizedEmail}. It is valid for 10 minutes.`);
  };

  const finish = (user) => {
    toast.success("Welcome to Mahathi Contractors.");
    navigate(routeFor(user), { replace: true });
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setLoading("email");
    try {
      const email = form.email.trim();
      const user = await loginWithEmail(email, form.password);
      finish(user);
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        showOtpScreen({ context: "login", email: form.email, password: form.password });
        toast.success("Verification code sent to your email.");
      } else {
        toast.error(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading("");
    }
  };

  const handleGoogle = async () => {
    setLoading("google");
    try {
      const user = await loginWithGoogle();
      finish(user);
    } catch (err) {
      toast.error(err.message || "Google login failed. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.mobileNumber.length !== 10) {
      toast.error("Please enter exactly 10 digits for mobile number.");
      return;
    }

    setLoading("create");
    try {
      console.log('[Login] Create account submit:', {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: `+91${form.mobileNumber}`,
        hasPassword: Boolean(form.password)
      });
      await createAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobileNumber: `+91${form.mobileNumber}`,
      });
      showOtpScreen({ context: "signup", email: form.email });
      toast.success("Verification code sent.");
    } catch (err) {
      console.error('[Login] Create account failed:', err);
      toast.error(err.message || "Email service is taking too long. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setLoading("otp");
    try {
      const user = otpContext === "signup"
        ? await verifySignupOtp({ email: otpEmail, otp })
        : await verifyLoginOtp({ email: otpEmail, otp, password: otpPassword });
      finish(user);
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleResendOtp = async () => {
    setLoading("resend");
    try {
      await sendEmailOtp({
        email: otpEmail,
        name: form.fullName.trim() || otpEmail.split("@")[0],
      });
      setNotice(`New verification code sent to ${otpEmail}. It is valid for 10 minutes.`);
      toast.success("Verification code resent.");
    } catch (err) {
      toast.error(err.message || "Could not resend verification code.");
    } finally {
      setLoading("");
    }
  };

  const backToLogin = () => {
    setMode("login");
    setOtp("");
    setOtpContext(null);
    setOtpEmail("");
    setOtpPassword("");
    setNotice("");
  };

  const title = mode === "create" ? "Create Account" : mode === "otp" ? "Verify Email" : "Login";
  const subtitle = mode === "create"
    ? "Create your account with email verification from Mahathi Contractors."
    : mode === "otp"
      ? "Enter the 6-digit code sent to your email."
      : "Email login first. Google and guest booking are available below.";

  return (
    <AuthLayout
      icon={HardHat}
      title={title}
      subtitle={subtitle}
      footer={
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to website
        </Link>
      }
    >
      {notice && (
        <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500">
          {notice}
        </div>
      )}

      {mode === "login" && (
        <>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </div>
            <Button type="submit" disabled={!!loading} className="w-full h-12 rounded-xl font-semibold">
              {loading === "email" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Login
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">More options</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={!!loading}
              className="w-full h-12 rounded-xl bg-white text-slate-950 hover:bg-white/90 font-semibold"
            >
              {loading === "google" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Continue with Gmail
            </Button>

            <Button type="button" variant="outline" onClick={() => setMode("create")} className="w-full h-12 rounded-xl font-semibold">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>

            <Link to="/book" className="block">
              <Button type="button" variant="outline" className="w-full h-12 rounded-xl font-semibold">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </>
      )}

      {mode === "create" && (
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createEmail">Email</Label>
            <Input id="createEmail" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="createPassword">Password</Label>
              <Input id="createPassword" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <div className="flex overflow-hidden rounded-xl border border-input bg-background">
              <span className="flex items-center border-r border-input px-3 text-sm font-semibold text-muted-foreground">+91</span>
              <Input
                id="mobileNumber"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobileNumber}
                onChange={(e) => update("mobileNumber", e.target.value)}
                className="border-0 focus-visible:ring-0"
                placeholder="10 digit number"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={!!loading} className="w-full h-12 rounded-xl font-semibold">
            {loading === "create" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create Account
          </Button>
          <Button type="button" variant="ghost" onClick={backToLogin} className="w-full">
            Back to Login
          </Button>
        </form>
      )}

      {mode === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOtp">Email Verification Code</Label>
            <Input
              id="emailOtp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(cleanOtp(e.target.value))}
              placeholder="123456"
              className="h-12 text-center text-lg font-semibold tracking-[0.35em]"
              required
            />
          </div>
          <Button type="submit" disabled={!!loading} className="w-full h-12 rounded-xl font-semibold">
            {loading === "otp" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Verify and Continue
          </Button>
          <Button type="button" variant="outline" onClick={handleResendOtp} disabled={!!loading} className="w-full h-12 rounded-xl font-semibold">
            {loading === "resend" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Resend Code
          </Button>
          <Button type="button" variant="ghost" onClick={otpContext === "signup" ? () => setMode("create") : backToLogin} className="w-full">
            {otpContext === "signup" ? "Back to Create Account" : "Back to Login"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
