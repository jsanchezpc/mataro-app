"use client"

import { useAuth } from "@/app/context/AuthContext"
import { getUserById, uploadPostImage } from "@/lib/firebase"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { Plus, Image as ImageIcon, X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// APP components
import PostComponent from "@/components/post"

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
import { Post } from "@/types/post"

function DropCreate() {
    return (
        <div className="fixed bottom-8 right-8 hover:cursor-pointer z-50">
            <div className="rounded-full bg-blue-600/90 w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                <Plus className="w-10 text-slate-50" />
            </div>
        </div>
    )
}

const formSchema = z.object({
    postContent: z.string().max(280).optional(),
})

type CreatePostProps = {
    onCreated?: () => void
}

export default function CreatePost({ onCreated }: CreatePostProps) {
    const { user, loadingUser } = useAuth()
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!user?.uid) return
        getUserById(user.uid).then((data) => setProfile(data)).catch(() => toast("Error al obtener perfil"))
    }, [user])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postContent: "",
        },
    })

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    async function uploadPost(values: z.infer<typeof formSchema>) {
        if (!user?.uid) {
            toast("Error: no se encontró el usuario", { description: "Debes iniciar sesión" })
            return
        }

        if (!values.postContent && !selectedImage) {
            toast("Error", { description: "Debes escribir algo o subir una imagen" })
            return
        }

        setIsUploading(true)

        try {
            let imageURL = null
            if (selectedImage) {
                imageURL = await uploadPostImage(selectedImage)
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    author: profile?.username,
                    content: values.postContent,
                    isPrivate: false,
                    isChild: false,
                    father: "none",
                    imageURL
                }),
            })

            if (!res.ok) {
                throw new Error("❌ Error al crear post")
            }

            toast("✅ Post creado con éxito")
            form.reset()
            removeImage()
            setOpen(false)
            onCreated?.()
        } catch {
            toast("Error al crear el post", { description: "Intenta de nuevo más tarde" })
        } finally {
            setIsUploading(false)
        }
    }


    const postPreview: Post = {
        id: "preview",
        uid: user?.uid ?? "preview",
        content: form.watch("postContent") || "",
        timestamp: Date.now(),
        isPrivate: false,
        likes: 0,
        likedBy: [],
        comments: [],
        commentsCount: 0,
        isChild: false,
        father: "none",
        imageURL: imagePreview || undefined
    }



    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
                <DropCreate />
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col h-full sm:max-w-md w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(uploadPost)} className="flex flex-col flex-1 h-full">
                        <SheetHeader className="px-4 pt-4 pb-2">
                            <SheetTitle>Crear post</SheetTitle>
                            <SheetDescription>¡Comparte lo que piensas con Mataró!</SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
                            <FormField
                                control={form.control}
                                name="postContent"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="relative">
                                            <Textarea
                                                className="resize-none min-h-[120px] bg-accent/50 text-base p-4 border-none focus-visible:ring-1"
                                                placeholder="¿Qué está pasando?"
                                                {...field}
                                            />
                                            <div className="absolute bottom-2 right-2 flex gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleImageSelect}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <ImageIcon className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {imagePreview && (
                                <div className="relative rounded-xl overflow-hidden border bg-muted/30">
                                    <div className="relative aspect-video w-full">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <span className="text-sm font-medium text-muted-foreground block mb-3">Vista previa</span>
                                <div className="pointer-events-none opacity-80 scale-95 origin-top-left">
                                    {loadingUser ? (
                                        <p className="text-sm text-muted-foreground">Cargando...</p>
                                    ) : (
                                        <PostComponent post={postPreview} isPreview={true} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="p-4 border-t bg-background mt-auto">
                            <SheetClose asChild>
                                <Button variant="outline" type="button" className="flex-1">Cancelar</Button>
                            </SheetClose>
                            <Button type="submit" disabled={isUploading} className="flex-1 text-slate-100">
                                {isUploading ? "Publicando..." : "Publicar"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
