import { NextResponse } from "next/server"
import { deletePostById } from "@/lib/firebase"

// DELETE /api/posts/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: "ID de post es obligatorio" },
        { status: 400 }
      )
    }

    await deletePostById(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error en DELETE /api/posts/[id]:", error)
    return NextResponse.json({ error: "Error eliminando post" }, { status: 500 })
  }
}
