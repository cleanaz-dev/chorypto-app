"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  CheckSquare,
  User,
  Settings,
  Menu,
  Bitcoin,
  Building2,
  DollarSign
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { shortenAddress } from "@/lib/utils";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const navItems = [
  { title: "Home", href: "/home", icon: Home },
  { title: "Chores", href: "/chores", icon: CheckSquare },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Payout", href: "/payout", icon: DollarSign },
  {
    title: "Organization",
    href: "/organization",
    icon: Building2,
    restricted: true,
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav({ mobile = false, role = "User" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { isLoaded, isSignedIn, user } = useUser();





  const isCreator = role === "Creator";
  const filteredNavItems = navItems.filter(
    (item) => !item.restricted || (item.restricted && isCreator)
  );

  const Header = () => (
    <Link href="/home" className="group">
      <div className="flex h-16 items-center border-b border-gray-800 pl-2 transition-all duration-300">
        <Bitcoin
          className="mr-2 h-6 w-6 text-amber-500 
                group-hover:rotate-12 group-hover:scale-110 
                transition-all duration-500"
        />
        <span
          className="text-xl font-bold hover-gradient-text 
                    bg-[length:200%] bg-clip-text 
                    bg-gradient-to-r from-white via-amber-300 to-amber-500
                    group-hover:tracking-wider transition-all duration-300"
        >
          Chorypto
        </span>
        <span
          className="ml-1 text-xs text-amber-500 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
        >
          βeta
        </span>
      </div>
    </Link>
  );

  const NavItems = () => (
    <div className="flex flex-col ">
      <nav
        className={
          mobile ? "flex flex-col space-y-1 p-4" : "flex flex-col space-y-1 p-4"
        }
      >
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setOpen(false)}
            >
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActive
                    ? "bg-amber-900/20 text-amber-500"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      {/* Signout BUtton */}
      <div className="mt-auto px-4 py-2 text-center">
        <div className="flex w-full">
          <SignOutButton>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-800 group transition-all duration-300"
            >
              <span>Sign Out</span>
              <LogOut className="group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <>
        <div className="flex w-full justify-between items-center">
          <Link href="/home" className="group">
            <div className="flex h-16 items-center border-gray-800 pl-2 transition-all duration-300">
              <Bitcoin
                className="mr-2 h-6 w-6 text-amber-500 
                group-hover:rotate-12 group-hover:scale-110 
                transition-all duration-500"
              />
              <span
                className="text-xl font-bold hover-gradient-text 
                    bg-[length:200%] bg-clip-text 
                    bg-gradient-to-r from-white via-amber-300 to-amber-500
                    group-hover:tracking-wider transition-all duration-300"
              >
                Chorypto
              </span>
              <span
                className="ml-1 text-xs text-amber-500 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
              >
                βeta
              </span>
            </div>
          </Link>

          <div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
              <SheetContent
                side="left"
                className="w-64 border-r border-gray-800 bg-gray-950 p-0 flex flex-col h-screen"
              >
                <Header />
                <NavItems />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-full w-56 flex-col">
      <Header />
      <NavItems />
    </div>
  );
}
