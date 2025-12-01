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
      toast.error("Debes iniciar sesión para eliminar posts.")
      return
    }

    try {
      const idToken = await user.getIdToken()

      const res = await fetch(`/api/posts/${postId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error desconocido al eliminar el post")
      }

      toast.success("Post eliminado correctamente.")
      setOpen(false)
      onDeleted?.()
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("No se pudo eliminar el post. Inténtalo de nuevo.")
      }
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
          {user && user.uid === authorId ? (
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
              data-testid={`delete-${postId}`}
            >
              Eliminar
            </DropdownMenuItem>
          ) : <DropdownMenuItem>Reportar</DropdownMenuItem>}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
