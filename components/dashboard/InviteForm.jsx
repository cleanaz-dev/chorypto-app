// components/dashboard/InviteForm.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const InviteForm = ({ assigneeEmail, setAssigneeEmail, handleInvite, error }) => (
  <Card className="bg-gray-900 border-gray-800">
    <CardHeader>
      <CardTitle>Invite Assignee</CardTitle>
      <CardDescription className="text-gray-400">Add members to your organization</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={assigneeEmail}
            onChange={(e) => setAssigneeEmail(e.target.value)}
            className="bg-gray-950 border-gray-800"
          />
        </div>
        <Button type="submit" className="bg-amber-500 text-black hover:bg-amber-400">
          Send Invite
        </Button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </form>
    </CardContent>
  </Card>
);