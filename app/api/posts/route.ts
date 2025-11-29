import { NextResponse } from "next/server"
// import * as admin from "firebase-admin"
import { getAllPostsServer, createPostServer, addCommentToPostServer, getUserByIdServer, db } from "@/lib/firebaseAdmin"

// GET /api/posts
export async function GET() {
  try {
    const posts = await getAllPostsServer()
    return NextResponse.json(posts)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error en GET /api/posts:", error.message)
      return NextResponse.json(
        { error: "Error obteniendo posts", details: error.message },
        { status: 500 }
      )
    }
    console.error("❌ Error desconocido en GET /api/posts:", error)
    return NextResponse.json(
      { error: "Error obteniendo posts", details: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/posts
export async function POST(req: Request) {
  try {
    const { uid, content, isPrivate, isChild, father } = await req.json()

    if (!uid || !content) {
      return NextResponse.json(
        { error: "Error al crear el post por el contenido o por tu cuenta. Posible error de la plataforma, si persiste, repórtalo creando un post jajaja" },
        { status: 400 }
      )
    }

    // Crear el post (comentario o post normal)
    const newPost = await createPostServer(uid, content, isPrivate, isChild, father)

    // Si es un comentario, agregarlo a la lista de comments del post padre
    if (isChild && father) {
      await addCommentToPostServer(father, newPost.id)

      // 🚀 Crear notificación "tal ha comentado tu post"
      const fatherPostRef = db.collection("posts").doc(father)
      const fatherPostSnap = await fatherPostRef.get()
      const fatherPostData = fatherPostSnap.data()

      if (fatherPostData && fatherPostData.uid && fatherPostData.uid !== uid) {
        const user = await getUserByIdServer(uid)
        const message = `${user?.username} ha comentado tu post`
        await db.collection("notifications").add({
          type: "comment",
          fromUserId: uid,
          toUserId: fatherPostData.uid,
          postId: father,
          message,
          createdAt: Date.now(),
          read: false,
        })
      }
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error en POST /api/posts:", error.message)
      return NextResponse.json(
        { error: "Error creando post", details: error.message },
        { status: 500 }
      )
    }
    console.error("❌ Error desconocido en POST /api/posts:", error)
    return NextResponse.json(
      { error: "Error creando post", details: String(error) },
      { status: 500 }
    )
  }
}
