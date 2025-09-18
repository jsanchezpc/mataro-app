import { NextResponse } from "next/server"
import { getAllPostsServer, createPostServer } from "@/lib/firebaseAdmin" 

// GET /api/posts
export async function GET() {
  try {
    console.log("🔍 Entrando en GET /api/posts...")
    const posts = await getAllPostsServer()
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error("❌ Error en GET /api/posts:", error?.message || error)
    return NextResponse.json(
      { error: "Error obteniendo posts", details: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/posts
export async function POST(req: Request) {
  try {
    const { uid, author, content } = await req.json()

    if (!uid || !content) {
      return NextResponse.json(
        { error: "uid y content son obligatorios" },
        { status: 400 }
      )
    }

    const newPost = await createPostServer(uid, author || "Anónimo", content)
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error("❌ Error en POST /api/posts:", error)
    return NextResponse.json({ error: "Error creando post" }, { status: 500 })
  }
}

