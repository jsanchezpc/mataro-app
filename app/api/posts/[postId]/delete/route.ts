import { NextRequest, NextResponse } from "next/server"
import { deletePostServer } from "@/lib/firebaseAdmin"
import * as admin from "firebase-admin"

// DELETE /api/posts/[postId]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
): Promise<NextResponse<{ error: string }> | NextResponse<{ message: string }>> {
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
    } catch (error) {
      console.error("❌ Token de autenticación inválido:", error)
      return NextResponse.json({ error: "No autenticado o token inválido" }, { status: 401 })
    }
  } else {
    return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 })
  }

  try {
    const postRef = admin.firestore().collection("posts").doc(postId)
    const postDoc = await postRef.get()

    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    const postData = postDoc.data()
    if (!postData || postData.uid !== authenticatedUserUid) {
      return NextResponse.json({ error: "No autorizado para eliminar este post" }, { status: 403 })
    }

    await deletePostServer(postId)

    return NextResponse.json(
      { message: `Post ${postId} eliminado correctamente` },
      { status: 200 }
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Error en DELETE /api/posts/${postId}:`, error.message)
      return NextResponse.json(
        { error: "Error eliminando post", details: error.message },
        { status: 500 }
      )
    }

    console.error(`❌ Error en DELETE /api/posts/${postId}:`, error)
    return NextResponse.json(
      { error: "Error eliminando post", details: String(error) },
      { status: 500 }
    )
  }
}