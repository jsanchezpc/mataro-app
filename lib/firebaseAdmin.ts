// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import { Post } from "@/types/post";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();

export async function getAllPostsServer() {
  const snapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getPostsByUserServer(userId: string): Promise<Post[]> {
  if (!userId) return [];
  try {
    const postsRef = db.collection("posts").where("uid", "==", userId);
    const snapshot = await postsRef.get();

    const posts: Post[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      posts.push({
        id: doc.id,
        uid: data.uid,
        content: data.content,
        likes: data.likes ?? 0,
        likedBy: data.likedBy ?? [],
        isPrivate: data.isPrivate ?? false,
        commentsCount: data.commentsCount ?? 0,
        retweetsCount: data.retweetsCount ?? 0,
        timestamp: data.timestamp,
        rt: data.rt ?? 0,
        comments: data.comments ?? []
      });
    });

    return posts;
  } catch (err) {
    console.error("❌ Error obteniendo posts del usuario:", err);
    return [];
  }
}


export async function createPostServer(uid: string, content: string, isPrivate: boolean) {
  const newPost = {
    uid,
    isPrivate,
    content,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    likes: 0,
    comments: [],
    rt: 0,
  };

  const docRef = await db.collection("posts").add(newPost);
  const userRef = db.collection("users").doc(uid);

  // Verifica si el campo userPosts existe, si no, inicialízalo como array vacío
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await userRef.set({ userPosts: [docRef.id] }, { merge: true });
  } else {
    const data = userSnap.data();
    if (!data || !Array.isArray(data.userPosts)) {
      await userRef.update({ userPosts: [docRef.id] });
    } else {
      await userRef.update({
        userPosts: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
    }
  }

  return { id: docRef.id, ...newPost };
}

/**
 * Elimina un post y todos sus comentarios y likes asociados.
 *
 * @param postId - ID del post a eliminar.
 * @returns Un objeto indicando el éxito y el ID del post eliminado.
 * @throws Error si no se proporciona un ID de post válido o si ocurre un error durante la eliminación.
 */
export const deletePostServer = async (postId: string) => {
  if (!postId) {
    throw new Error("No se proporcionó un ID de post válido");
  }

  try {
    // 1. Eliminar los comentarios asociados
    const commentsSnapshot = await db.collection("comments").where("postId", "==", postId).get();
    const commentBatch = db.batch();
    commentsSnapshot.forEach((doc) => {
      commentBatch.delete(doc.ref);
    });
    await commentBatch.commit();

    // 2. Eliminar los likes asociados (si los guardas en una colección por separado)
    const likesSnapshot = await db.collection("likes").where("postId", "==", postId).get();
    const likeBatch = db.batch();
    likesSnapshot.forEach((doc) => {
      likeBatch.delete(doc.ref);
    });
    await likeBatch.commit();

    // 3. Eliminar el propio post
    await db.collection("posts").doc(postId).delete();

    return { success: true, postId };
  } catch (error) {
    console.error(`Error al eliminar el post y sus asociados:`, error);
    throw error;
  }
};
