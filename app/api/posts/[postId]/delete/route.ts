import { NextRequest, NextResponse } from "next/server"
import { deletePostServer, db } from "@/lib/firebaseAdmin"
import * as admin from "firebase-admin"

// DELETE /api/posts/[postId]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params

  if (!postId) {
    return NextResponse.json({ error: "ID de post no proporcionado" }, { status: 400 })
  }

  let authenticatedUserUid: string | null = null
  const authorizationHeader = req.headers.get("Authorization")

  if (authorizationHeader?.startsWith("Bearer ")) {
    const idToken = authorizationHeader.split("Bearer ")[1]
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      authenticatedUserUid = decodedToken.uid
    } catch {
      return NextResponse.json({ error: "No autenticado o token inválido" }, { status: 401 })
    }
  } else {
    return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
  }

  try {
    const postRef = db.collection("posts").doc(postId)
    const postDoc = await postRef.get()

    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post no encontrado", details: `Post with ID ${postId} does not exist.` }, { status: 404 })
    }

    const postData = postDoc.data()
    // Type checking for postData fields, assuming isChild is boolean and father is string
    if (!postData || postData.uid !== authenticatedUserUid) {
      return NextResponse.json({ error: "No autorizado para eliminar este post" }, { status: 403 })
    }

    // Check if the post being deleted is a comment
    if (postData.isChild === true && typeof postData.father === 'string' && postData.father) {
      const fatherPostId = postData.father

      const fatherPostRef = db.collection("posts").doc(fatherPostId)
      const fatherPostDoc = await fatherPostRef.get()

      if (fatherPostDoc.exists) {
        // Atomically remove the comment's ID from the parent post's comments array
        await fatherPostRef.update({
          comments: admin.firestore.FieldValue.arrayRemove(postId)
        })
      } else {
      }
    }

    // Now proceed with deleting the comment/post itself
    await deletePostServer(postId) // This function should delete the actual Firestore document

    return NextResponse.json(
      { message: `Post ${postId} eliminado correctamente` },
      { status: 200 }
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Error eliminando post", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Error eliminando post", details: String(error) },
      { status: 500 }
    )
  }
}
