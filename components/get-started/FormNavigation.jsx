// components/get-started/FormNavigation.jsx
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const FormNavigation = ({ step, totalSteps, prevStep, nextStep, isLoading }) => (
  <div className="flex justify-between">
    <Button 
      variant="outline" 
      onClick={prevStep}
      disabled={step === 1}
      className={`border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white ${
        step === 1 ? "opacity-50" : ""
      }`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
    <Button 
      onClick={nextStep}
      className="bg-amber-500 text-black hover:bg-amber-400"
      disabled={isLoading}
    >
      {step < totalSteps ? (
        <>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
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
  </div>
);