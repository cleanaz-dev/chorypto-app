"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle, User, Wallet, Home } from "lucide-react";
import { toast } from "sonner";
import { Bitcoin } from "lucide-react";

export default function InviteSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isLoaded, signUp, setActive } = useSignUp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [invite, setInvite] = useState(null);
  const [orgId, setOrgId] = useState(null)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const totalSteps = 3;

  // Validate invite token
  useEffect(() => {
    if (!token) {
      setError("No invite token provided");
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid or expired invite");
        } else {
          setInvite(data);
          setOrgId(data.organizationId);
        }
      } catch (err) {
        setError("Failed to validate invite");
      }
    };
    fetchInvite();
  }, [token]);

  // Validate current step
  const validateStep = () => {
    if (step === 1 && !isVerifying) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError("First and last name are required");
        toast.error("First and last name are required");
        return false;
      }
    }

    if (step === 1 && isVerifying && !otpCode) {
      setError("Please enter the verification code");
      toast.error("Please enter the verification code");
      return false;
    }

    setError("");
    return true;
  };

  // Step 1: Handle signup and OTP sending
  const handleSignUp = async () => {
    if (!isLoaded) {
      setError("Authentication service not ready");
      toast.error("Authentication service not ready");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: invite.email,
      };
      console.log("SignUp Payload:", payload);

      // Create the sign up attempt
      const result = await signUp.create(payload);
      console.log("SignUp Result:", result);

      // Prepare email verification
      const verificationResult = await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      console.log("Verification Prep Result:", verificationResult);

      setIsVerifying(true);
      setError("");
      toast.success("Verification code sent to your email");
    } catch (err) {
      console.error("SignUp Error:", err);
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Could not create account. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP verification and wallet creation
  const handleVerify = async () => {
    if (!isLoaded || !otpCode) {
      setError("Invalid verification code");
      toast.error("Invalid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        // Create user in Prisma and organization
        const res = await fetch("/api/invite/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: completeSignUp.createdUserId,
            email: invite.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            inviteToken: token,
            organizationId: orgId,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to complete signup");
        }

        // Create wallet
        const walletRes = await fetch("/api/invite/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: completeSignUp.createdUserId }),
        });

        const walletData = await walletRes.json();
        if (!walletRes.ok) {
          throw new Error(walletData.error || "Failed to create wallet");
        }

        setIsVerifying(false);
        setOtpCode("");
        setStep(2);
        toast.success("Account and wallet created successfully!");
      } else {
        setError("Verification failed - please try again");
        toast.error("Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage =
        err.errors?.[0]?.message || "Invalid verification code";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle step progression
  const nextStep = async () => {
    if (!validateStep()) return;

    if (step === 1) {
      if (!isVerifying) {
        await handleSignUp();
      } else {
        await handleVerify();
      }
      return;
    }

    if (step === 2) {
      setStep(3);
      window.scrollTo(0, 0);
    } else if (step === totalSteps) {
      router.push("/home");
    }
  };

  const prevStep = () => {
    if (step === 1 && isVerifying) {
      setIsVerifying(false);
      setOtpCode("");
      setError("");
    }
  };

  if (!token) return <p className="text-red-400">No invite token provided</p>;
  if (!invite && !error) return <p className="text-gray-400">Loading...</p>;
  if (error && step === 1 && !isVerifying) return <p className="text-red-400">{error}</p>;

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-y-hidden">
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center">
            <Bitcoin className="mr-2 h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold">Chorypto</span>
          </div>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="mb-2 flex justify-between px-2">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      stepNumber < step
                        ? "border-amber-500 bg-amber-500 text-black"
                        : stepNumber === step
                        ? "border-amber-500 text-amber-500"
                        : "border-gray-700 text-gray-700"
                    }`}
                  >
                    {stepNumber < step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      stepNumber <= step ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {stepNumber === 1 && "Profile"}
                    {stepNumber === 2 && "Wallet"}
                    {stepNumber === 3 && "Complete"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute h-1 w-full rounded-full bg-gray-800"></div>
              <div
                className="absolute h-1 rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-900 text-red-200 rounded">
              {error}
            </div>
          )}

          <Card className="border-gray-800 bg-gray-900">
            {step === 1 && (
              <>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-amber-500" />
                    <div>
                      <CardTitle className="text-2xl">
                        {isVerifying ? "Verify Your Email" : "Personal Information"}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {isVerifying
                          ? "Enter the code sent to your email"
                          : `Join ${invite?.organizationName}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isVerifying ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={invite?.email || ""}
                          disabled
                          className="bg-gray-950 border-gray-800"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="bg-gray-950 border-gray-800"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="bg-gray-950 border-gray-800"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Verification Code</Label>
                      <Input
                        id="otp-code"
                        placeholder="Enter 6-digit code"
                        className="bg-gray-950 border-gray-800"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-400">
                        Check your email for the verification code.
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-amber-500" />
                    <div>
                      <CardTitle className="text-2xl">Wallet Setup</CardTitle>
                      <CardDescription className="text-gray-400">
                        Creating your crypto wallet
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <p className="text-gray-400">
                      A testnet wallet is being created for you to store your rewards.
                      This will be ready shortly.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500">
                    <CheckCircle className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-2xl">You're all set!</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your Chorypto account has been created successfully
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
                    <h3 className="mb-2 text-lg font-medium">What's next?</h3>
                    <ul className="space-y-4 text-left">
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 h-5 w-5 text-amber-500" />
                        <span>Join your organization’s activities</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 h-5 w-5 text-amber-500" />
                        <span>Start earning crypto rewards</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 && !isVerifying}
                className={`border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white ${
                  step === 1 && !isVerifying ? "opacity-50" : ""
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-amber-500 text-black hover:bg-amber-400"
                disabled={isLoading || !isLoaded}
              >
                {step < totalSteps ? (
                  <>
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          />
                        </svg>
                        {isVerifying ? "Verifying..." : "Loading..."}
                      </span>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}