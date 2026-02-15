"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Bookmark as BookmarkFormValues,
  bookmarkSchema,
} from "@/schema/bookmarkSchema";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function AddBookmarkForm() {
  const { user, loading } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const form = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = async (values: BookmarkFormValues) => {
    await supabase.from("bookmarks").insert({
      ...values,
      user_id: user?.id,
    });

    form.reset();
  };

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
    } else {
      setBookmarks(data as Bookmark[]);
    }
  };
  useEffect(() => {
    if (!user) return;
    fetchBookmarks();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-100 rounded-xl h-screen">
      <div className="bg-neutral-200 p-4 rounded-xl max-w-4xl mt-4 space-y-4 mx-auto">
        <h1 className="text-2xl font-extrabold">Add Bookmark</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mb-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bookmark Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My favorite site" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Add Bookmark
            </Button>
          </form>
        </Form>
      </div>
      <div className="bg-neutral-200 p-4 rounded-xl max-w-4xl mt-4 mx-auto space-y-4">
        <h2 className="text-2xl font-bold ">Added Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="text-gray-600">No bookmarks added yet.</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bookmark, index) => (
              <li key={index} className="p-4 bg-white rounded-lg shadow">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {bookmark.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
