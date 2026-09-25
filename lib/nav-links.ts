
export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "Tools", href: "/tools" },
  { label: "Interview", href: "/interview" },
  { label: "History", href: "/history" },
  { label: "My Journey", href: "/my-journey" },
];