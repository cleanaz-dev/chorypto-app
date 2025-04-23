"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // Prevents rendering before Clerk loads user

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SignIn />
      </div>
    );
  }

  router.push("/home");
  return null; // Prevents rendering anything else
}
