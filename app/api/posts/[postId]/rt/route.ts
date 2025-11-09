import { NextRequest, NextResponse } from "next/server"
import * as admin from "firebase-admin"
import { getUserByIdServer } from "@/lib/firebaseAdmin"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  const authorizationHeader = req.headers.get("Authorization")

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 })
  }

  try {
    const idToken = authorizationHeader.split("Bearer ")[1]
    const decoded = await admin.auth().verifyIdToken(idToken)
    const userId = decoded.uid
    const db = admin.firestore()

    const shareRef = db.collection("shares")

    // Verificar si el usuario ya compartió este post
    const existing = await shareRef
      .where("postId", "==", postId)
      .where("userId", "==", userId)
      .get()

    const postRef = db.collection("posts").doc(postId)

    if (!existing.empty) {
      // Quitar share
      await shareRef.doc(existing.docs[0].id).delete()
      await postRef.update({
        shares: admin.firestore.FieldValue.increment(-1),
        sharedBy: admin.firestore.FieldValue.arrayRemove(userId),
      })
      return NextResponse.json({ message: "Share eliminado" }, { status: 200 })
    }

    // Crear share
    await shareRef.add({
      postId,
      userId,
      createdAt: Date.now(),
    })

    await postRef.update({
      shares: admin.firestore.FieldValue.increment(1),
      sharedBy: admin.firestore.FieldValue.arrayUnion(userId),
    })

    // Obtener info del post original
    const postSnap = await postRef.get()
    const postData = postSnap.data()

    // Obtener datos del usuario que comparte
    const fsUser = await getUserByIdServer(userId)
    const shareMessage = `${fsUser?.username} compartió tu post`

    // Crear notificación si no es el mismo usuario
    if (postData && postData.uid && postData.uid !== userId) {
      await db.collection("notifications").add({
        type: "share",
        fromUserId: userId,
        toUserId: postData.uid,
        postId,
        message: shareMessage,
        createdAt: Date.now(),
        read: false,
      })
    }

    return NextResponse.json({ message: "Share agregado" }, { status: 200 })
  } catch (err) {
    console.error("❌ Error en share:", err)
    return NextResponse.json({ error: "Error procesando share" }, { status: 500 })
  }
}
