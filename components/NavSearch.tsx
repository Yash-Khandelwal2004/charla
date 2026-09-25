
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Home,
  GraduationCap,
  Wrench,
  Mic,
  History as HistoryIcon,
  BarChart2,
  CreditCard,
  PlusCircle,
} from "lucide-react";
import { tools } from "@/constants";
import { NAV_LINKS } from "@/lib/nav-links";



type ResultIcon = { kind: "lucide"; Icon: typeof Home } | { kind: "emoji"; value: string };

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  group: "Pages" | "Tools" | "Actions";
  icon: ResultIcon;
}

const PAGE_ICONS: Record<string, ResultIcon> = {
  "/": { kind: "lucide", Icon: Home },
  "/companions": { kind: "lucide", Icon: GraduationCap },
  "/tools": { kind: "lucide", Icon: Wrench },
  "/interview": { kind: "lucide", Icon: Mic },
  "/history": { kind: "lucide", Icon: HistoryIcon },
  "/my-journey": { kind: "lucide", Icon: BarChart2 },
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/companions": "Voice AI tutors across six subjects",
  "/tools": "15 AI tools for career, academics and productivity",
  "/interview": "Practice a voice interview and get scored",
  "/history": "Tool runs, conversations and interviews",
  "/my-journey": "Your stats and progress",
};

const PAGE_ITEMS: SearchItem[] = NAV_LINKS.map((link) => ({
  id: `page-${link.href}`,
  label: link.label,
  description: PAGE_DESCRIPTIONS[link.href],
  href: link.href,
  group: "Pages",
  icon: PAGE_ICONS[link.href] ?? { kind: "lucide", Icon: Home },
}));

const EXTRA_ITEMS: SearchItem[] = [
  {
    id: "action-new-companion",
    label: "Create a companion",
    description: "Set up a new voice AI tutor",
    href: "/companions/new",
    group: "Actions",
    icon: { kind: "lucide", Icon: PlusCircle },
  },
  {
    id: "page-subscription",
    label: "Subscription",
    description: "Plans and billing",
    href: "/subscription",
    group: "Pages",
    icon: { kind: "lucide", Icon: CreditCard },
  },
];


function buildToolItems(): SearchItem[] {
  if (!Array.isArray(tools)) return [];
  return (tools as Array<Record<string, unknown>>).map((t) => ({
    id: `tool-${String(t.id)}`,
    label: typeof t.label === "string" ? t.label : String(t.id ?? "Tool"),
    description: typeof t.description === "string" ? t.description : undefined,
    href: typeof t.href === "string" ? t.href : `/tools/${String(t.id)}`,
    group: "Tools" as const,
    icon: { kind: "emoji" as const, value: typeof t.icon === "string" ? t.icon : "🔧" },
  }));
}

const ALL_ITEMS: SearchItem[] = [...PAGE_ITEMS, ...EXTRA_ITEMS, ...buildToolItems()];
const MAX_RESULTS = 8;

function scoreItem(item: SearchItem, q: string): number {
  const label = item.label.toLowerCase();
  const desc = (item.description ?? "").toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (desc.includes(q)) return 40;
  if (item.group.toLowerCase().includes(q)) return 20;
  return 0;
}

function getResults(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return PAGE_ITEMS.slice(0, MAX_RESULTS); // empty box: surface the main pages
  return ALL_ITEMS.map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((r) => r.item);
}

function ResultIconView({ icon }: { icon: ResultIcon }) {
  if (icon.kind === "emoji") return <span className="text-base leading-none">{icon.value}</span>;
  const { Icon } = icon;
  return <Icon size={16} strokeWidth={2} aria-hidden="true" />;
}

function ResultsList({
  items,
  activeIndex,
  onHover,
  onSelect,
  listId,
}: {
  items: SearchItem[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (item: SearchItem) => void;
  listId: string;
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
        No matches. Try “resume”, “interview” or “history”.
      </p>
    );
  }

  let lastGroup = "";
  return (
    <ul id={listId} role="listbox" className="py-1 max-h-[60vh] overflow-y-auto">
      {items.map((item, i) => {
        const showHeader = item.group !== lastGroup;
        lastGroup = item.group;
        const active = i === activeIndex;
        return (
          <li key={item.id}>
            {showHeader && (
              <div
                className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.group}
              </div>
            )}
            <button
              id={`${listId}-option-${i}`}
              role="option"
              aria-selected={active}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(item)}
              onMouseEnter={() => onHover(i)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg cursor-pointer"
              style={{
                backgroundColor: active
                  ? "var(--accent-muted, var(--bg-subtle, transparent))"
                  : "transparent",
                color: "var(--foreground)",
              }}
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                style={{ backgroundColor: "var(--bg-subtle, var(--surface-1, transparent))" }}
              >
                <ResultIconView icon={item.icon} />
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="text-sm font-medium truncate">{item.label}</span>
                {item.description && (
                  <span className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                    {item.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}



export default function NavSearch({ variant }: { variant: "desktop" | "mobile" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = variant === "desktop" ? "nav-search-desktop" : "nav-search-mobile";

  const results = useMemo(() => getResults(query), [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (variant !== "desktop" || !open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [variant, open]);

  useEffect(() => {
    if (variant !== "mobile" || !open) return;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [variant, open]);

  function close() {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function goTo(item: SearchItem) {
    router.push(item.href);
    close();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) goTo(item);
    } else if (e.key === "Escape") {
      close();
    }
  }

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--bg-subtle,var(--surface-1,transparent))]"
          style={{ color: "var(--foreground)" }}
        >
          <Search size={20} />
        </button>

        {open && (
          <div
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: "var(--background)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Search Charla"
          >
            <div
              className="flex items-center gap-2 p-3"
              style={{ borderBottom: "1px solid var(--border-default, var(--border, transparent))" }}
            >
              <Search size={18} style={{ color: "var(--muted-foreground)" }} />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                placeholder="Search Charla…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={
                  results[activeIndex] ? `${listId}-option-${activeIndex}` : undefined
                }
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: "var(--foreground)" }}
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={close}
                className="p-2 rounded-lg cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <ResultsList
                items={results}
                activeIndex={activeIndex}
                onHover={setActiveIndex}
                onSelect={goTo}
                listId={listId}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--muted-foreground)" }}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search Charla…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && results[activeIndex] ? `${listId}-option-${activeIndex}` : undefined
        }
        className="w-44 focus:w-72 pl-9 pr-8 py-2 text-sm rounded-lg outline-none transition-[width] duration-200"
        style={{
          backgroundColor: "var(--bg-subtle, var(--surface-1, transparent))",
          border: "1px solid var(--border-default, var(--border, transparent))",
          color: "var(--foreground)",
        }}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      )}

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: "var(--bg-raised, var(--surface-1, var(--background)))",
            border: "1px solid var(--border-default, var(--border, transparent))",
          }}
        >
          <ResultsList
            items={results}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelect={goTo}
            listId={listId}
          />
        </div>
      )}
    </div>
  );
}