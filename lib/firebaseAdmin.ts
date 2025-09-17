// lib/firebaseAdmin.ts
import * as admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = admin.firestore()

export async function getAllPostsServer() {
  const snapshot = await db.collection("posts").orderBy("timestamp", "desc").get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createPostServer(uid: string, author: string, content: string) {
  const newPost = {
    uid,
    author,
    content,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    likes: 0,
    comments: 0,
    rt: 0,
  }

  const docRef = await db.collection("posts").add(newPost)
  return { id: docRef.id, ...newPost }
}
