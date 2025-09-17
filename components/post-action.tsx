"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/app/context/AuthContext"

interface DeletePostProps {
  postId: string
  authorId: string
  onDeleted?: () => void
}

export function PostAction({ postId, authorId, onDeleted }: DeletePostProps) {
  const [open, setOpen] = React.useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para eliminar el post")
      return
    }
    if (user.uid !== authorId) {
      toast.error("No puedes eliminar un post que no es tuyo")
      return
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Error al eliminar")
      }

      toast.success("Post eliminado correctamente")
      onDeleted?.()
    } catch (error) {
      console.error("❌ Error al eliminar el post:", error)
      toast.error("No se pudo eliminar el post")
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
