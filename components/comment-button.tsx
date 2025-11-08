"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { getCommentsByPostId } from "@/lib/firebase";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import PostComponent from "./post";

import { Post } from "@/types/post";
const formSchema = z.object({
    commentContent: z.string().min(2).max(280),
});

interface CommentButtonProps {
    postId: string;
    comments?: string[];
}

export default function CommentButton({ postId, comments }: CommentButtonProps) {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [commentList, setCommentList] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { commentContent: "" },
    });

    // Cargar comentarios cuando se abre el Sheet
    useEffect(() => {
        let mounted = true;

        async function loadComments() {
            if (!open) return;


            // Intentar obtener de sessionStorage primero
            const cached = sessionStorage.getItem(`comments_${postId}`);
            if (cached) {
                const parsedComments = JSON.parse(cached);
                setCommentList(parsedComments.data);
            }

            // Si no hay cache o expiró, cargar de Firebase
            setIsLoading(true);
            try {
                console.log("cargando posts...")
                const loadedComments = await getCommentsByPostId(postId);
                console.log("posts cargados: ", loadedComments)
                if (mounted) {
                    setCommentList(loadedComments);

                    // Guardar en sessionStorage
                    const cacheData = {
                        timestamp: Date.now(),
                        data: loadedComments,
                    };
                    sessionStorage.setItem(`comments_${postId}`, JSON.stringify(cacheData));
                }
            } catch (error) {
                console.error("Error cargando comentarios:", error);
                toast.error("Error cargando comentarios");
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadComments();

        return () => {
            mounted = false;
        };
    }, [open, postId, comments]);

    // 🔹 Enviar nuevo comentario (como post hijo)
    async function postComment(values: z.infer<typeof formSchema>) {
        if (!user?.uid) {
            toast("Debes iniciar sesión", { description: "No se encontró usuario" });
            return;
        }

        try {
            const newComment: Partial<Post> = {
                uid: user.uid,
                content: values.commentContent,
                // timestamp: new Date().toISOString(), // Add timestamp
                isPrivate: false,
                isChild: true,
                father: postId,
                likes: 0,
                rt: 0,
                likedBy: [],
                comments: [],
            };

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newComment),
            });

            if (!res.ok) throw new Error("Error al crear comentario");

            const createdComment = await res.json();
            setCommentList((prev) => [...prev, createdComment]);

            form.reset();
            toast("✅ Comentario enviado");
        } catch (err) {
            console.error("Error enviando comentario:", err);
            toast("Error enviando comentario", { description: "Intenta de nuevo más tarde" });
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <MessageCircle />
                    <span>{commentList.length || comments?.length || 0}</span>
                </Button>
            </SheetTrigger>

            <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>
                        Comentarios ({commentList.length || comments?.length || 0})
                        {isLoading && " - Cargando..."}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-2 overflow-y-auto px-4 py-2 space-y-2">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
                    ) : commentList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
                    ) : (
                        commentList.map((comment) => (
                            <PostComponent
                                key={comment.id}
                                post={{
                                    ...comment,
                                    id: comment.id,
                                    content: comment.content,
                                }}
                                isPreview={false}
                                onDeleted={(deletedId) => {
                                    setCommentList((prev) => {
                                        const filtered = prev.filter((p) => p.id !== deletedId);
                                        // Actualizar cache
                                        const cacheData = {
                                            timestamp: Date.now(),
                                            data: filtered,
                                        };
                                        sessionStorage.setItem(`comments_${postId}`, JSON.stringify(cacheData));
                                        return filtered;
                                    });
                                }}
                            />
                        ))
                    )}
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(postComment)} className="flex flex-col flex-1">
                        <SheetFooter className="flex flex-col gap-2 border-t p-4">
                            <FormField
                                control={form.control}
                                name="commentContent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Escribe un comentario</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="resize-none max-h-36"
                                                placeholder="Comparte tu opinión"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {280 - field.value.length} caracteres restantes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col gap-2">
                                <Button type="submit" className="text-slate-100">
                                    Postear
                                </Button>
                                <SheetClose asChild>
                                    <Button variant="outline">Cerrar</Button>
                                </SheetClose>
                            </div>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
