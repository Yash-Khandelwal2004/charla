"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { subjects } from "@/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@jsmastery/utils";

const SubjectFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get("subject") || "");

  useEffect(() => {
    let newUrl = "";
    if (!subject || subject === "all") {
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["subject"],
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "subject",
        value: subject,
      });
    }
    router.push(newUrl, { scroll: false });
  }, [subject]);

  return (
    <Select onValueChange={setSubject} value={subject}>
      <SelectTrigger
        className="h-fit text-sm px-3 py-2 rounded-md w-[160px]"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--surface-3)",
          color: subject && subject !== "all"
            ? "var(--foreground)"
            : "var(--muted-foreground)",
        }}
      >
        <SelectValue placeholder="All subjects" />
      </SelectTrigger>
      <SelectContent
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--surface-3)",
        }}
      >
        <SelectItem
          value="all"
          style={{ color: "var(--foreground)" }}
          className="text-sm"
        >
          All subjects
        </SelectItem>
        {subjects.map((s) => (
          <SelectItem
            key={s}
            value={s}
            className="capitalize text-sm"
            style={{ color: "var(--foreground)" }}
          >
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SubjectFilter;