import { createClient } from "@supabase/supabase-js";

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY)
    : undefined;

export interface PostType {
  id: string;
  name: string;
  position: string;
  email: string;
  salary: number;
  about: string;
  added: Date;
}

export type JSONSafe<T> = {
  [P in keyof T]: T[P] extends Date ? string : T[P] extends Date | undefined ? string : T[P];
};

export const Posts = {
  getRecentPostIds: async () => {
    const response = await supabase?.from("posts").select("id").order("created_at", { ascending: false }).limit(3);
    console.info("Get posts", response?.data);
    return response?.data?.map((r) => String(r.id)) || [];
  },
  getAllPostIds: async (start?: number, limit?: number) => {
    let query = supabase?.from("posts").select("id").order("created_at", { ascending: false });
    if (limit) {
      query = query?.limit(limit);
    }
    if (start) {
      query = query?.range(start, start + (limit ?? 10));
    }
    const response = await query;
    console.info("Get posts", response?.data);
    return response?.data?.map((r) => String(r.id)) || [];
  },
  getPost: async (id: string): Promise<PostType | undefined> => {
    const response = await supabase?.from("posts").select("*").eq("id", id);
    console.info("Get post", id, response?.data);
    return response?.data
      ? {
          ...(response?.data[0] as PostType),
          added: new Date(response?.data[0].created_at as string),
        }
      : undefined;
  },
};
