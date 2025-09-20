// app/api/[postId]/like/route.ts
import { NextRequest, NextResponse } from "next/server"
import * as admin from "firebase-admin"

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
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
    const likeRef = admin.firestore().collection("likes")
    const existing = await likeRef.where("postId", "==", postId).where("userId", "==", userId).get()

    if (!existing.empty) {
      // quitar like
      await likeRef.doc(existing.docs[0].id).delete()
      await admin.firestore().collection("posts").doc(postId).update({
        likes: admin.firestore.FieldValue.increment(-1),
      })
      return NextResponse.json({ message: "Like eliminado" }, { status: 200 })
    }

    // dar like
    await likeRef.add({ postId, userId, createdAt: Date.now() })
    await admin.firestore().collection("posts").doc(postId).update({
      likes: admin.firestore.FieldValue.increment(1),
    })
    return NextResponse.json({ message: "Like agregado" }, { status: 200 })
  } catch (err) {
    console.error("Error en like:", err)
    return NextResponse.json({ error: "Error procesando like" }, { status: 500 })
  }
}
