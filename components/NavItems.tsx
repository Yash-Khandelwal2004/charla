'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Tools', href: '/tools' },
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
              'px-3 py-1.5 text-sm font-medium relative',
              isActive
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {label}
            {isActive && (
              <span
                className="absolute bottom-0 left-3 right-3 h-px"
                style={{ backgroundColor: 'var(--foreground)' }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavItems;