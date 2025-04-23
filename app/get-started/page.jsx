"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, ArrowRight, ArrowLeft, CheckCircle, User, Wallet, Settings, Home } from 'lucide-react';
import { useWallet } from '@/lib/hooks/useWallet';

export default function GetStarted() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState(1);
  const [walletOption, setWalletOption] = useState("connect");
  const { address, isConnected } = useWallet();
  const totalSteps = 4;

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    choreInterests: [],
    reminderTime: "morning",
    weeklyGoal: 10,
  });
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate current step
  const validateStep = () => {
    if (step === 1 && !isVerifying) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("All fields are required");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return false;
      }
    }

    if (step === 1 && isVerifying && !otpCode) {
      setError("Please enter the verification code");
      return false;
    }

    if (step === 2 && walletOption === "connect" && !isConnected) {
      setError("Please connect your wallet to proceed");
      return false;
    }

    setError("");
    return true;
  };

  // Handle sign up with Clerk
  const handleSignUp = async () => {
    if (!isLoaded) {
      setError("Authentication service not ready");
      return;
    }
  
    setIsLoading(true);
    try {
      // Log the exact payload for debugging
      const payload = {
         // or lastName
        email_address: formData.email,   // or emailAddress
        password: formData.password
      };
      console.log("SignUp Payload:", payload);
  
      // Create the sign up attempt
      const result = await signUp.create(payload);
      console.log("SignUp Result:", result);
  
      // // Check if signup is in a state to proceed with verification
      // if (result.status === "missing_requirements") {
      //   setError("Signup incomplete. Please check required fields.");
      //   return;
      // }
  
      // Prepare email verification
      const verificationResult = await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      console.log("Verification Prep Result:", verificationResult);
  
      setIsVerifying(true);
      setError("");
    } catch (err) {
      console.error("SignUp Error:", err);
      // Extract detailed error message from Clerk
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Could not create account. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // Handle OTP verification
  const handleVerify = async () => {
    if (!isLoaded || !otpCode) {
      setError("Invalid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setStep(2); // Move to next step
        setIsVerifying(false);
        setOtpCode("");
      } else {
        setError("Verification failed - please try again");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Invalid verification code");
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

    if (step === totalSteps) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            walletAddress: isConnected ? address : null,
            choreInterests: formData.choreInterests,
            reminderTime: formData.reminderTime,
            weeklyGoal: formData.weeklyGoal,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create profile");
        }

        router.push("/home");
      } catch (error) {
        console.error("API Error:", error);
        setError(error.message || "Failed to save profile");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
      setError("");
    } else if (isVerifying) {
      setIsVerifying(false);
      setError("");
      setOtpCode("");
    }
  };

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
              {[1, 2, 3, 4].map((stepNumber) => (
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
                    {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  <span 
                    className={`mt-2 text-xs font-medium ${
                      stepNumber <= step ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {stepNumber === 1 && "Profile"}
                    {stepNumber === 2 && "Wallet"}
                    {stepNumber === 3 && "Preferences"}
                    {stepNumber === 4 && "Complete"}
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
                        {isVerifying ? "Enter the code sent to your email" : "Tell us a bit about yourself"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isVerifying ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input 
                            id="first-name" 
                            placeholder="John" 
                            className="bg-gray-950 border-gray-800" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input 
                            id="last-name" 
                            placeholder="Doe" 
                            className="bg-gray-950 border-gray-800" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          className="bg-gray-950 border-gray-800" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          className="bg-gray-950 border-gray-800" 
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <p className="text-xs text-gray-400">Must be at least 8 characters long</p>
                      </div>
                      <div id="clerk-captcha"></div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          className="bg-gray-950 border-gray-800" 
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
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
                      <CardDescription className="text-gray-400">Configure your crypto wallet</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <h3 className="mb-2 font-medium">Wallet Options</h3>
                    <RadioGroup value={walletOption} onValueChange={setWalletOption}>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-3 rounded-md border border-gray-800 p-3">
                          <RadioGroupItem value="create" id="create" className="mt-1" />
                          <div>
                            <Label htmlFor="create" className="font-medium">Create a new wallet</Label>
                            <p className="text-sm text-gray-400">
                              We'll create a new crypto wallet for you to store your earned rewards
                            </p>
                            {walletOption === "create" && (
                              <p className="mt-2 text-sm text-amber-500">
                                (Demo: This feature is coming soon!)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 rounded-md border border-gray-800 p-3">
                          <RadioGroupItem value="connect" id="connect" className="mt-1" />
                          <div>
                            <Label htmlFor="connect" className="font-medium">Connect existing wallet</Label>
                            <p className="text-sm text-gray-400">
                              Connect your existing wallet to receive rewards
                            </p>
                            {walletOption === "connect" && (
                              <div className="mt-2">
                                <w3m-button className="bg-black" />
                                {isConnected && (
                                  <p className="mt-2 text-sm text-green-500">
                                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-amber-500" />
                    <div>
                      <CardTitle className="text-2xl">Preferences</CardTitle>
                      <CardDescription className="text-gray-400">Customize your experience</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>What types of chores are you interested in?</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {["Household Cleaning", "Outdoor Work", "Organization", "Cooking", "Pet Care", "Errands"].map((chore) => (
                        <div key={chore} className="flex items-center space-x-2 rounded-md border border-gray-800 p-3">
                          <input 
                            type="checkbox" 
                            id={chore} 
                            className="h-4 w-4 rounded border-gray-500 bg-gray-950" 
                            onChange={(e) => {
                              const interests = e.target.checked
                                ? [...formData.choreInterests, chore]
                                : formData.choreInterests.filter((i) => i !== chore);
                              setFormData({ ...formData, choreInterests: interests });
                            }}
                          />
                          <Label htmlFor={chore}>{chore}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">When do you want daily reminders?</Label>
                    <Select 
                      value={formData.reminderTime} 
                      onValueChange={(value) => setFormData({ ...formData, reminderTime: value })}
                    >
                      <SelectTrigger className="bg-gray-950 border-gray-800">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                        <SelectItem value="none">Don't send reminders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Weekly goal (number of chores)</Label>
                    <Select 
                      value={formData.weeklyGoal.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, weeklyGoal: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-gray-950 border-gray-800">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 chores per week</SelectItem>
                        <SelectItem value="10">10 chores per week</SelectItem>
                        <SelectItem value="15">15 chores per week</SelectItem>
                        <SelectItem value="20">20 chores per week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </>
            )}

            {step === 4 && (
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
                        <span>Add your first chore in the dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 h-5 w-5 text-amber-500" />
                        <span>Complete chores to earn crypto rewards</span>
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
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
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
                  isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Go to Dashboard"
                  )
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}