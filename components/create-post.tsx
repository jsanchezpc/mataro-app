"use client"

import { useAuth } from "@/app/context/AuthContext"
import { createPost, getUserById } from "@/lib/firebase"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"

// APP components
import Riera from "@/components/riera"

// UI components
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

function DropCreate() {
    return (
        <div className="fixed bottom-8 right-8 hover:cursor-pointer">
            <div className="rounded-full bg-blue-600/90 w-14 h-14 flex items-center justify-center">
                <Plus className="w-10 text-slate-50" />
            </div>
        </div>
    )
}

const formSchema = z.object({
    postContent: z.string().min(2).max(280),
})

export default function CreatePost() {
    const { user, loading } = useAuth()
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)

    // Cargar perfil del usuario
    useEffect(() => {
        if (!user?.uid) return
        getUserById(user.uid).then((data) => setProfile(data)).catch(console.error)
    }, [user])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postContent: "",
        },
    })

    async function uploadPost(values: z.infer<typeof formSchema>) {
        if (!user?.uid) {
            toast("Error: no se encontró el usuario", { description: "Debes iniciar sesión" })
            return
        }

        try {
            await createPost(user.uid, profile?.username ?? user.displayName ?? "Mataroní", values.postContent)
            toast("✅ Post creado con éxito")
            form.reset()
            setOpen(false)
        } catch (error) {
            console.error("❌ Error creando post:", error)
            toast("Error al crear el post", { description: "Intenta de nuevo más tarde" })
        }
    }

    const postPreview = {
        author: loading ? "Cargando..." : profile?.username ?? user?.displayName ?? "Mataroní",
        content: form.watch("postContent"),
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
                <DropCreate />
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col h-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(uploadPost)} className="flex flex-col flex-1">
                        <div className="flex-1 overflow-auto px-4 py-2 space-y-8">
                            <SheetHeader>
                                <SheetTitle>Crear post</SheetTitle>
                                <SheetDescription>¡Comparte lo que piensas con Mataró!</SheetDescription>
                            </SheetHeader>

                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="postContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contenido</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-none max-h-50"
                                                    placeholder="Escribe aquí lo que quieras compartir con Mataró"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {280 - field.value.length} caracteres restantes
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-3">
                                    <span className="font-semibold">Previsualización de tu post:</span>
                                    {loading ? (
                                        <p>Cargando usuario...</p>
                                    ) : (
                                        <Riera post={postPreview} isPreview={true} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="flex justify-between px-4 py-3 border-t">
                            <Button type="submit" className="text-slate-100">
                                Postear
                            </Button>

                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
