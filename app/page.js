"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bitcoin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-black min-h-screen ">
      {/* <div className="flex justify-center mt-4"><ThemeChanger /></div> */}
      <div className="flex min-h-screen flex-col-reverse text-white md:flex-row px-2 md:px-0 max-w-6xl mx-auto">
        {/* Left side - Content */}
        <div className="flex w-full flex-col justify-center px-6 py-10 md:w-1/2 md:px-12 lg:px-16">
          <div className="max-w-xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-2 inline-block rounded-full bg-gradient-to-r from-amber-600 to-amber-800 px-3 py-1 text-sm font-medium text-amber-100 shadow-lg shadow-amber-900/30"
            >
              Now in Beta
            </motion.div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Chorypto
              </span>
            </h1>

            <p className="mb-6 text-xl font-medium text-amber-100">
              Earn crypto while completing your daily chores
            </p>

            <p className="mb-8 text-gray-300">
              Transform mundane household tasks into rewarding experiences.
              Chorypto gamifies chores by rewarding completion with
              cryptocurrency tokens. Build habits, earn rewards, and join a
              community of productive earners.
            </p>

            <div className="flex gap-4 flex-row sm:space-x-4 sm:space-y-0">
              <div className="group">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg hover:shadow-amber-500/30 duration-500 transition-all group-hover:scale-110 cursor-pointer"
                  >
                    Get Started{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 duration-500 transition-all group-hover:scale-110" />
                  </Button>
                </Link>
              </div>

              <div className="group">
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amber-500 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300 shadow-lg hover:shadow-amber-500/20 bg-transparent group-hover:scale-110 duration-500 transition-all cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex w-full items-center justify-center md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 from-amber-500/10 to-transparent opacity-30"></div>
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-64 w-full items-center justify-center md:h-full"
          >
            {/* Glow effect container - perfectly centered around Bitcoin icon */}
            <div className="absolute flex items-center justify-center">
              {/* Glow circle - matches icon size proportionally */}
              <div
                className="
        h-[180px] w-[180px] 
        md:h-[240px] md:w-[240px] 
        rounded-full 
        bg-amber-400/20 
        blur-xl
        animate-pulse
      "
              ></div>
            </div>

            <Bitcoin
              className="
      h-48 w-48 
      md:h-64 md:w-64 
      text-amber-400 
      drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]
      relative z-10
    "
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
