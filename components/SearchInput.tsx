'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formUrlQuery, removeKeysFromUrlQuery } from "@jsmastery/utils";

const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('topic') || '');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "topic",
          value: searchQuery,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === '/companions') {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["topic"],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams, pathname]);

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-md h-fit"
      style={{
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--surface-3)",
      }}
      onFocusCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
      }}
      onBlurCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--surface-3)";
      }}
    >
      <Image
        src="/icons/search.svg"
        alt="search"
        width={14}
        height={14}
        className="opacity-50 flex-shrink-0"
      />
      <input
        placeholder="Search companions..."
        className="outline-none bg-transparent text-sm w-[160px]"
        style={{ color: "var(--foreground)" }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="text-xs flex-shrink-0"
          style={{ color: "var(--muted-foreground)" }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchInput;