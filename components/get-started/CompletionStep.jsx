// components/get-started/CompletionStep.jsx
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const CompletionStep = () => (
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
);