import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { reportPost } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { useAuth } from "@/app/context/AuthContext"

interface DeletePostProps {
  postId: string
  authorId: string
  onDeleted?: () => void
}

export function PostAction({ postId, authorId, onDeleted }: DeletePostProps) {
  const [open, setOpen] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)
  const [reportReason, setReportReason] = React.useState("")
  const [isReporting, setIsReporting] = React.useState(false)
  
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

  const handleReport = async () => {
      if (!user) {
          toast.error("Debes iniciar sesión para reportar.")
          return
      }
      if (!reportReason.trim()) {
          toast.error("Por favor, indica un motivo.")
          return
      }
      
      setIsReporting(true)
      try {
          await reportPost(postId, user.uid, reportReason)
          toast.success("Post reportado. Gracias por tu colaboración.")
          setReportOpen(false)
          setReportReason("")
      } catch {
          toast.error("Error al reportar el post.")
      } finally {
          setIsReporting(false)
      }
  }

  return (
    <>
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
          ) : (
            <DropdownMenuItem onSelect={() => setReportOpen(true)}>
                Reportar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reportar publicación</DialogTitle>
                <DialogDescription>
                    Ayúdanos a entender el problema. ¿Por qué quieres reportar este post?
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Textarea 
                    placeholder="Describe el problema (spam, contenido ofensivo, etc.)"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setReportOpen(false)}>Cancelar</Button>
                <Button className="dark:text-white" onClick={handleReport} disabled={isReporting}>
                    {isReporting ? "Enviando..." : "Enviar reporte"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  )
}
