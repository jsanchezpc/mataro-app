import { NextRequest, NextResponse } from "next/server";
import { getPostsByUserServer } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Falta el userId en la URL" },
        { status: 400 }
      );
    }

    const posts = await getPostsByUserServer(userId);
    return NextResponse.json(posts);
  } catch (err) {
    console.error("🔥 Error al obtener posts del usuario:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
