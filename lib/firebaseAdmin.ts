// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { Post } from "@/types/post";
import { getDbId } from "@/lib/db";

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} else {
  app = admin.app();
}

const dbId = getDbId();
export const db = getFirestore(app, dbId);

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
        timestamp: data.timestamp,
        comments: data.comments ?? [],
        isChild: data.isChild ?? false,
        father: data.father ?? [],
      });
    });

    return posts;
  } catch (err) {
    console.error("❌ Error obteniendo posts del usuario:", err);
    return [];
  }
}

export async function createPostServer(uid: string, content: string, isPrivate: boolean, isChild: boolean, father: string) {
  const newPost = {
    uid,
    isPrivate,
    content,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    likes: 0,
    comments: [],
    isChild, 
    father
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
      // Si userPosts no existe o no es un array, lo inicializa
      await userRef.update({ userPosts: [docRef.id] });
    } else {
      // Si ya existe y es un array, añade el nuevo post al array
      await userRef.update({
        userPosts: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
    }
  }

  return { id: docRef.id, ...newPost };
}

/**
 * Elimina un post y todos sus comentarios, likes asociados, y la referencia en el perfil del usuario.
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
    const batch = db.batch(); // Inicia un único lote para todas las operaciones

    // 1. Obtener el post para conseguir el authorUID
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("El post no existe.");
    }

    const postData = postDoc.data();
    // Asegúrate de que el campo 'uid' en tu documento de post realmente almacena el ID del autor.
    const authorUID = postData?.uid;
    if (!authorUID) {
      throw new Error("No se pudo encontrar el autor del post.");
    }

    // 2. Eliminar los comentarios asociados
    const commentsSnapshot = await db.collection("comments").where("postId", "==", postId).get();
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Eliminar los likes asociados
    const likesSnapshot = await db.collection("likes").where("postId", "==", postId).get();
    likesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 4. Eliminar el propio post
    batch.delete(postRef); // Añade la eliminación del post al lote

    // 5. Eliminar la referencia del post en el campo 'userPosts' del documento del usuario
    const userRef = db.collection("users").doc(authorUID);
    batch.update(userRef, {
      userPosts: admin.firestore.FieldValue.arrayRemove(postId)
    });

    // 6. Ejecutar todas las operaciones de forma atómica
    await batch.commit();

    return { success: true, postId };
  } catch (error) {
    console.error(`Error al eliminar el post y sus asociados:`, error);
    throw error;
  }
};

export async function getUserByIdServer(uid: string) {
  if (!uid) return null
  const userRef = db.collection("users").doc(uid)
  const userSnap = await userRef.get()
  if (!userSnap.exists) return null
  return { id: userSnap.id, ...(userSnap.data() as { username: string; avatarURL?: string }) }
}

export async function addCommentToPostServer(postId: string, commentId: string) {
  const postRef = db.collection("posts").doc(postId)
  await postRef.update({
    comments: admin.firestore.FieldValue.arrayUnion(commentId),
  })
}
