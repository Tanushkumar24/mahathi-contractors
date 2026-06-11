import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Loader2, Mail, UserPlus } from "lucide-react";
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

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, createAccount } = useAuth();
  const [loading, setLoading] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const finish = (user) => {
    toast.success("Welcome to Mahathi Contractors.");
    navigate(routeFor(user), { replace: true });
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

    if (form.mobileNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    setLoading("create");
    try {
      const user = await createAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobileNumber: form.mobileNumber.replace(/\D/g, "").slice(-10),
      });
      finish(user);
    } catch (err) {
      toast.error(err.message || "Account creation failed. Please try again.");
    } finally {
      setLoading("");
    }
  };

  return (
    <AuthLayout
      icon={HardHat}
      title="Mahathi Contractors"
      subtitle="Continue with Google, create an account, or book as a guest."
      footer={
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to website
        </Link>
      }
    >
      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleGoogle}
          disabled={!!loading}
          className="w-full h-12 rounded-xl bg-white text-slate-950 hover:bg-white/90 font-semibold"
        >
          {loading === "google" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>

        <Link to="/book" className="block">
          <Button type="button" variant="outline" className="w-full h-12 rounded-xl font-semibold">
            Continue as Guest
          </Button>
        </Link>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Create Account</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
          <Input id="mobileNumber" type="tel" value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} required />
        </div>
        <Button type="submit" disabled={!!loading} className="w-full h-12 rounded-xl font-semibold">
          {loading === "create" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
