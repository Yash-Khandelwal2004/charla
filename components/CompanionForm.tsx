"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { subjects } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import { createCompanion } from "@/lib/actions/companion.actions";
import { redirect } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Companion name is required." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  voice: z.string().min(1, { message: "Voice is required." }),
  style: z.string().min(1, { message: "Style is required." }),
  duration: z.coerce.number().min(1, { message: "Duration is required." }),
});

// Shared label style
const labelStyle = { color: "var(--foreground)", fontSize: "0.8125rem" };

const CompanionForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", subject: "", topic: "", voice: "", style: "", duration: 15 },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const companion = await createCompanion(values);
    if (companion) redirect(`/companions/${companion.id}`);
    else redirect("/");
  };

  return (
    <div
      className="rounded-lg p-6 max-w-2xl w-full mx-auto"
      style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--surface-3)" }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Name */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel style={labelStyle}>Companion Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Nova the Science Guide" {...field} className="input" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />

          {/* Subject */}
          <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel style={labelStyle}>Subject</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--surface-3)" }}>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize"
                        style={{ color: "var(--foreground)" }}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />

          {/* Topic */}
          <FormField control={form.control} name="topic" render={({ field }) => (
            <FormItem>
              <FormLabel style={labelStyle}>What should the companion help with?</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Derivatives & Integrals, World War II causes..." {...field}
                  className="input min-h-[100px] resize-none" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />

          {/* Voice + Style side by side */}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="voice" render={({ field }) => (
              <FormItem>
                <FormLabel style={labelStyle}>Voice</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--surface-3)" }}>
                      <SelectItem value="male" style={{ color: "var(--foreground)" }}>Male</SelectItem>
                      <SelectItem value="female" style={{ color: "var(--foreground)" }}>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <FormField control={form.control} name="style" render={({ field }) => (
              <FormItem>
                <FormLabel style={labelStyle}>Teaching Style</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--surface-3)" }}>
                      <SelectItem value="formal" style={{ color: "var(--foreground)" }}>Formal</SelectItem>
                      <SelectItem value="casual" style={{ color: "var(--foreground)" }}>Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
          </div>

          {/* Duration */}
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel style={labelStyle}>Session Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15" {...field} className="input" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full justify-center py-3 mt-2"
          >
            Build Companion →
          </button>

        </form>
      </Form>
    </div>
  );
};

export default CompanionForm;