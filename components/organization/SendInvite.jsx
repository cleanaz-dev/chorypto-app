'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';

export default function SendInvite({ onSendInvite }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSendInvite(email);

      setEmail('');
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 w-auto md:w-2/3 lg:w-1/2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-amber-500" />
          Invite Members
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send invitations to add new members to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex-col md:flex gap-2 space-y-4 md:space-y-0">
            <Input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-950 border-gray-800 flex-1 text-white focus:ring-amber-500 focus:border-amber-500"
              required
              type="email"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send Invite'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}