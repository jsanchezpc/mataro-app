import { NextRequest, NextResponse } from "next/server"
import * as admin from "firebase-admin"
import { getUserByIdServer, db } from "@/lib/firebaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const authorizationHeader = req.headers.get("Authorization")
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 })
  }

  try {
    const idToken = authorizationHeader.split("Bearer ")[1]
    const decoded = await admin.auth().verifyIdToken(idToken)
    const userId = decoded.uid

    // check si ya existe un like
    const likeRef = db.collection("likes")
    const existing = await likeRef.where("postId", "==", postId).where("userId", "==", userId).get()

    if (!existing.empty) {
      // quitar like
      await likeRef.doc(existing.docs[0].id).delete()
      await db.collection("posts").doc(postId).update({
        likes: admin.firestore.FieldValue.increment(-1),
        likedBy: admin.firestore.FieldValue.arrayRemove(userId),
      })
      return NextResponse.json({ message: "Like eliminado" }, { status: 200 })
    }

    // dar like
    await likeRef.add({ postId, userId, createdAt: Date.now() })
    const postRef = db.collection("posts").doc(postId)
    await postRef.update({
      likes: admin.firestore.FieldValue.increment(1),
      likedBy: admin.firestore.FieldValue.arrayUnion(userId),
    })

    const fsUser = await getUserByIdServer(userId)

    // 🚀 Crear notificación
    const postSnap = await postRef.get()
    const postData = postSnap.data()

    const likeMessage = `${fsUser?.username} le dio like a tu post`

    if (postData && postData.uid && postData.uid !== userId) {
      await db.collection("notifications").add({
        type: "like",
        fromUserId: userId,
        toUserId: postData.uid,
        postId,
        message: likeMessage,
        createdAt: Date.now(),
        read: false,
      })
    }

    return NextResponse.json({ message: "Like agregado" }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Error procesando like" }, { status: 500 })
  }
}
