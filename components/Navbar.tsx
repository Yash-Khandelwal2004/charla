"use client";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import NavItems from "@/components/NavItems";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/images/logo.svg" alt="Charla" width={32} height={32} />
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}
            >
              charla
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <NavItems />
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

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="drawer-overlay md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="drawer-panel md:hidden">
            <div className="flex justify-between items-center mb-6">
              <span
                className="font-bold text-lg"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}
              >
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                ✕
              </button>
            </div>
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
                className="px-3 py-2.5 rounded-md text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                {label}
              </Link>
            ))}
            <SignedOut>
              <SignInButton>
                <button className="btn-signin w-full justify-center mt-4">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;