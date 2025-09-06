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
import { doc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DeletePostProps {
    postId: string
    authorId: string
    onDeleted?: () => void
}

export function DeletePost({ postId, authorId, onDeleted }: DeletePostProps) {
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
            const postRef = doc(db, "posts", postId)
            const postSnap = await getDoc(postRef)

            if (!postSnap.exists()) {
                toast.error("El post no existe")
                return
            }

            await deleteDoc(postRef)
            toast.success("Post eliminado correctamente")
            onDeleted?.()
        } catch (error) {
            console.error("Error al eliminar el post:", error)
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
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
