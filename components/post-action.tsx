"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner" // Asumo que sonner es tu biblioteca de notificaciones

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Asegúrate de que useAuth() devuelve un objeto con un 'user' que es de tipo firebase.User
// o que tiene un método getIdToken. Si tu AuthContext devuelve un objeto custom,
// quizás necesites acceder al objeto Firebase User directamente.
// Ejemplo: const { user: firebaseUser } = useAuth();
import { useAuth } from "@/app/context/AuthContext"

interface DeletePostProps {
  postId: string
  authorId: string
  onDeleted?: () => void
}

export function PostAction({ postId, authorId, onDeleted }: DeletePostProps) {
  const [open, setOpen] = React.useState(false)
  const { user } = useAuth() // 'user' debería ser tu objeto Firebase User o similar

  const handleDelete = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para eliminar posts.")
      return
    }

    try {
      // 1. Obtener el ID Token del usuario autenticado
      const idToken = await user.getIdToken();

      // 2. Realizar la solicitud DELETE incluyendo el token en el encabezado Authorization
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`, // ¡Aquí enviamos el token!
        },
      })

      if (!res.ok) {
        // Si la respuesta no es OK, intentamos parsear el error del servidor
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido al eliminar el post");
      }

      toast.success("Post eliminado correctamente.")
      setOpen(false); // Cierra el menú desplegable después de la eliminación
      onDeleted?.(); // Llama al callback para que el componente padre actualice la lista
    } catch (error: any) {
      console.error("❌ Error al eliminar el post:", error.message || error);
      toast.error(error.message || "No se pudo eliminar el post. Inténtalo de nuevo.");
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full md:w-[200px]">
        <DropdownMenuGroup>
          <DropdownMenuItem>Reportar</DropdownMenuItem>
          {/* El botón de eliminar solo se muestra si el usuario está logueado y es el autor */}
          {/* La verificación de 'user.uid === authorId' aquí es para UX, la seguridad la da el servidor */}
          {user && user.uid === authorId && (
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
              data-testid={`delete-${postId}`}
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
