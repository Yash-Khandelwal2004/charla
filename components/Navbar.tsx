"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import NavItems from "@/components/NavItems";
import NavSearch from "@/components/NavSearch";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/nav-links";

const SCROLL_THRESHOLD = 8;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="navbar sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300"
        style={{
          backgroundColor: scrolled ? "var(--nav-bg-scrolled, var(--background))" : "var(--nav-bg, var(--background))",
          borderBottom: `1px solid ${scrolled ? "var(--border-default, var(--border, transparent))" : "transparent"}`,
          boxShadow: scrolled ? "0 1px 0 0 var(--border-default, var(--border, transparent)), 0 8px 24px -16px rgba(0,0,0,0.35)" : "none",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="group">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <Image
              src="/images/logo.svg"
              alt="Charla logo"
              width={32}
              height={32}
              className="w-8 h-8 transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span
              className="font-bold text-lg max-sm:hidden transition-opacity duration-200 group-hover:opacity-80"
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
          <NavSearch variant="desktop" />
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
          <NavSearch variant="mobile" />
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2.5 -m-1 cursor-pointer rounded-lg transition-colors duration-150 hover:bg-[var(--bg-subtle,var(--surface-1,transparent))]"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-overlay"
          >
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: "var(--foreground)",
                transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: "var(--foreground)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
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
        <div
          id="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="mobile-overlay md:hidden"
          style={{
            animation: "charla-overlay-in 220ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--bg-subtle,var(--surface-1,transparent))]"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          {/* Navigation links */}
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map(({ label, href }, i) => {
              const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className="mobile-overlay-link"
                  style={{
                    color: isActive ? "var(--accent)" : undefined,
                    animation: `charla-link-in 260ms cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

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


      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes charla-overlay-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes charla-link-in {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #mobile-nav-overlay,
          #mobile-nav-overlay a {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;