import { z } from "zod";

export const bookmarkSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title too long"),

    url: z
        .string()
        .url("Please enter a valid URL")
});

export type Bookmark = z.infer<typeof bookmarkSchema>;