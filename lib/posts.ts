import { Post } from "@/types/post";
import {
  doc,
  getDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"


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

export async function fetchPost(postId: string): Promise<Post | null> {
  try {
    const postDoc = await getDoc(doc(db, "posts", postId));
    if (postDoc.exists()) {
      return { id: postDoc.id, ...postDoc.data() } as Post;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}