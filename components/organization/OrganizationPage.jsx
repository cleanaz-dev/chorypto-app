"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Edit } from "lucide-react";
import { createOrganization, sendInviteEmail } from "@/lib/actions";
import { useRouter } from "next/navigation";
import SendInvite from "./SendInvite";
import { toast } from "sonner";

export default function OrganizationPage({ data }) {
  const [organization, setOrganization] = useState(data?.organization || null);
  const [members, setMembers] = useState(data?.members || []);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false); // Added for invite processing
  const [error, setError] = useState("");
  const [orgName, setOrgName] = useState("");
  const router = useRouter();

  const handleCreateOrganization = async () => {
    setLoading(true);
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      const result = await fetch(`/api/organization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setOrganization(result.organization);
      setMembers(result.members);
      setOrgName("");
      setError("");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to create organization");
    } finally {
      setLoading(false);
      router.push(`/organization`);
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      setLoading(true);
      const result = await fetch(`/api/organization`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }), // send the body here
      });
      if (result.ok) {
        toast.success("Organization deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete organization");
    } finally {
      setLoading(false);
      router.push(`/organization`);
    }
  };

  const handleSendInvite = async (email) => {
    try {
      setProcessing(true);
      const result = await sendInviteEmail(email);
      if (result.error) {
        toast.error("Failed to send invite");
        throw new Error(result.error);
      }
      if (result.success) {
        toast.success("Invite sent successfully");
      }
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!data) {
    return <p className="text-gray-400">Loading...</p>;
  }

  return (
    <div className="px-0.5 md:px-4 space-y-6 mt-4 md:mt-0 pb-6">
      <div>
        <h1 className="text-3xl font-bold">Organization</h1>
        <p className="text-gray-400">Manage your team and settings</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 p-3 text-red-400">{error}</div>
      )}

      {!organization ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Create Organization
            </CardTitle>
            <CardDescription className="text-gray-400">
              You don't have an organization yet. Create one to start managing
              your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="bg-gray-950 border-gray-800"
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateOrganization}
              disabled={loading}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  {organization.name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit organization</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium">Members</h3>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-800 p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="bg-gray-800">
                          {member.firstName?.charAt(0)}
                          {member.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <SendInvite onSendInvite={handleSendInvite} loading={processing} />
        </>
      )}
    </div>
  );
}
