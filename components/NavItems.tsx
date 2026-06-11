'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Tools', href: '/tools' },
  { label: "History", href: "/history" },
  { label: 'My Journey', href: '/my-journey' },
];

const NavItems = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ label, href }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            href={href}
            key={label}
            className={cn(
              'px-3 py-1.5 text-sm font-medium relative transition-colors duration-150',
              isActive
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {label}
            {isActive && (
              <span
                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavItems;