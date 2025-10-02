import { Post } from "@/types/post";

export async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
    return (await res.json()) as Post[];
  } catch (err) {
    console.error("❌ Error cargando posts:", err);
    return [];
  }
}