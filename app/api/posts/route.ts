import { NextResponse } from "next/server"
import { getAllPostsServer, createPostServer } from "@/lib/firebaseAdmin"

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
    const { uid, content, isPrivate } = await req.json()

    if (!uid || !content) {
      return NextResponse.json(
        { error: "Error al crear el post por el contenido o por tu cuenta. Posible error de la plataforma, si persiste, repórtalo creando un post jajaja" },
        { status: 400 }
      )
    }

    const newPost = await createPostServer(uid, content, isPrivate)
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
