// components/get-started/PersonalInfoStep.jsx
import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUp } from '@clerk/nextjs';

export const PersonalInfoStep = ({ formData, setFormData, onSignUpSuccess }) => {
  return (
    <>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-2xl">Personal Information</CardTitle>
            <CardDescription className="text-gray-400">Tell us a bit about yourself</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        {/* Replace password fields with Clerk's SignUp component */}
        <div className="mt-6">
          <SignUp 
            path="/get-started"
            routing="hash"
            afterSignUpUrl="/get-started?step=2"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                formButtonPrimary: "bg-amber-500 hover:bg-amber-400 text-black",
                footerActionLink: "text-amber-500 hover:text-amber-400",
              }
            }}
          />
        </div>
      </CardContent>
    </>
  );
};