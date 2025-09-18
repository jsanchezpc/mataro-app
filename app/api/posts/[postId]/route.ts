// app/api/posts/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deletePostServer } from "@/lib/firebaseAdmin"; 
import * as admin from "firebase-admin";

// DELETE /api/posts/[postId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!postId) {
    return NextResponse.json({ error: "ID de post no proporcionado" }, { status: 400 });
  }

  let authenticatedUserUid: string | null = null;
  const authorizationHeader = req.headers.get("Authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    const idToken = authorizationHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      authenticatedUserUid = decodedToken.uid;
    } catch (error) {
      console.error("❌ Token de autenticación inválido:", error);
      return NextResponse.json({ error: "No autenticado o token inválido" }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 });
  }

  try {
    // Aquí es donde necesitamos cargar el post para verificar el autor
    // Esto asume que tienes acceso a `db` de `firebaseAdmin`
    const postRef = admin.firestore().collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    const postData = postDoc.data();
    if (!postData || postData.uid !== authenticatedUserUid) {
      // El usuario autenticado no es el autor del post
      return NextResponse.json({ error: "No autorizado para eliminar este post" }, { status: 403 });
    }

    // Si la verificación de autorización es exitosa, procedemos con la eliminación
    await deletePostServer(postId); // Llama a tu función que elimina en cascada

    return NextResponse.json({ message: `Post ${postId} eliminado correctamente` }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error en DELETE /api/posts/${postId}:`, error?.message || error);
    return NextResponse.json(
      { error: "Error eliminando post", details: error?.message },
      { status: 500 }
    );
  }
}
