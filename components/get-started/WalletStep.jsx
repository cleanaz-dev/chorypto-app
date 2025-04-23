// components/get-started/WalletStep.jsx
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const WalletStep = ({ walletOption, setWalletOption, isConnected, address }) => (
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
);