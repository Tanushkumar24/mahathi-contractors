import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Phone, ShieldCheck, UserCheck, Loader2, ArrowLeft, Send } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function Login() {
  const { sendOtp, verifyOtp, registerUser } = useAuth();

  // Step states: 'phone' | 'otp' | 'register'
  const [step, setStep] = useState("phone");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Profile registration states for new users
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend OTP countdown timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanNumber = mobileNumber.replace(/\D/g, "");
    
    if (cleanNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(cleanNumber);
      toast.success("OTP sent successfully to your mobile number.");
      setStep("otp");
      setCountdown(60); // Enable resend timer
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const cleanNumber = mobileNumber.replace(/\D/g, "");
      const res = await verifyOtp(cleanNumber, otpCode);

      if (res.userExists) {
        toast.success("Logged in successfully!");
        window.location.href = "/";
      } else {
        // First-time user: transition to profile registration
        setStep("register");
      }
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    const cleanNumber = mobileNumber.replace(/\D/g, "");
    
    try {
      await sendOtp(cleanNumber);
      toast.success("A new OTP code has been sent.");
      setCountdown(60);
      setOtpCode("");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  // Step 3: Register User Profile (New accounts)
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !city.trim()) {
      setError("Both Name and City are required.");
      return;
    }

    setLoading(true);
    try {
      const cleanNumber = mobileNumber.replace(/\D/g, "");
      await registerUser(fullName.trim(), cleanNumber, city.trim());
      toast.success("Account created successfully!");
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Profile creation failed.");
    } finally {
      setLoading(false);
    }
  };

  // Return to previous step
  const handleBackToPhone = () => {
    setError("");
    setStep("phone");
    setOtpCode("");
  };

  // -------------------------------------------------------------
  // Render Step 1: Input Mobile Number
  // -------------------------------------------------------------
  if (step === "phone") {
    return (
      <AuthLayout
        icon={Phone}
        title="Mobile Login"
        subtitle="Enter your mobile number to receive an OTP code"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40 font-medium">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/20"
                autoFocus
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send OTP
              </>
            )}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  // -------------------------------------------------------------
  // Render Step 2: Input OTP Code
  // -------------------------------------------------------------
  if (step === "otp") {
    return (
      <AuthLayout
        icon={ShieldCheck}
        title="Verify OTP"
        subtitle={`We sent a 6-digit verification code to +91 ${mobileNumber}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Label className="text-white/50 text-xs uppercase tracking-wider">Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
              autoComplete="one-time-code"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
                <InputOTPSlot index={1} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
                <InputOTPSlot index={2} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
                <InputOTPSlot index={3} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
                <InputOTPSlot index={4} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
                <InputOTPSlot index={5} className="w-10 h-12 bg-white/5 border-white/10 rounded-lg text-lg text-white" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-12 font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl"
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Number
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className={`font-medium transition-colors ${
                  countdown > 0 ? "text-white/20 cursor-default" : "text-blue-400 hover:text-blue-300"
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // -------------------------------------------------------------
  // Render Step 3: Complete User Profile (First-time Signups)
  // -------------------------------------------------------------
  return (
    <AuthLayout
      icon={UserCheck}
      title="Create Profile"
      subtitle="Complete your profile details to create an account"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/20"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">City / Location</Label>
          <Input
            id="city"
            placeholder="Vijayawada"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/20"
            required
          />
        </div>

        <div className="space-y-1.5 pt-2">
          <Label className="text-white/30 text-xs">Mobile Number (Verified)</Label>
          <Input
            value={`+91 ${mobileNumber}`}
            disabled
            className="h-12 bg-white/3 border-white/5 text-white/50 rounded-xl cursor-not-allowed font-medium"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
