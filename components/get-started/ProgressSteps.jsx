// components/get-started/ProgressSteps.jsx
import { CheckCircle } from 'lucide-react';

export const ProgressSteps = ({ step, totalSteps }) => {
  return (
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
  );
};