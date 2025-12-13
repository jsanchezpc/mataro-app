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
      return NextResponse.json(
        { error: "Error obteniendo posts", details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "Error obteniendo posts", details: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/posts
export async function POST(req: Request) {
  try {
    const { uid, content, isPrivate, isChild, father, imageURL } = await req.json()

    if (!uid || (!content && !imageURL)) { // Permitir post solo con imagen si se quisiera, o mantener restricción
       // Mantenemos restricción de que debe haber content O podemos relajarlo. 
       // El error original dice "por el contenido". 
    }
    
    // Si queremos obligar texto O imagen:
    if (!uid || (!content && !imageURL)) {
         return NextResponse.json(
        { error: "El post debe tener texto o imagen" },
        { status: 400 }
      )
    }

    // Crear el post (comentario o post normal)
    const newPost = await createPostServer(uid, content || "", isPrivate, isChild, father, imageURL)

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
      return NextResponse.json(
        { error: "Error creando post", details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "Error creando post", details: String(error) },
      { status: 500 }
    )
  }
}
