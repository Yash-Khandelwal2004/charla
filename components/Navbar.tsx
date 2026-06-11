"use client";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { X } from "lucide-react";
import NavItems from "@/components/NavItems";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            {/* Logo mark — geometric CH monogram */}
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold"
              style={{
                backgroundColor: "var(--accent)",
                color: "#1a1917",
                fontFamily: "var(--font-bricolage)",
                letterSpacing: "-0.03em",
              }}
            >
              CH
            </div>
            <span
              className="font-bold text-lg max-sm:hidden"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-bricolage)",
                letterSpacing: "-0.02em",
              }}
            >
              charla
            </span>
          </div>
        </Link>

        {/* Desktop nav — center */}
        <div className="hidden md:flex items-center gap-1">
          <NavItems />
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <SignedOut>
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </SignedIn>
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          </SignedIn>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-1.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--foreground)",
                transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--foreground)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--foreground)",
                transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      {menuOpen && (
        <div className="mobile-overlay md:hidden">
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 cursor-pointer"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          {/* Navigation links */}
          {[
            { label: "Home", href: "/" },
            { label: "Companions", href: "/companions" },
            { label: "Tools", href: "/tools" },
            { label: "My Journey", href: "/my-journey" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="mobile-overlay-link"
            >
              {label}
            </Link>
          ))}

          <div className="mt-auto">
            <SignedOut>
              <SignInButton>
                <button className="btn-primary w-full justify-center py-3 text-base">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;