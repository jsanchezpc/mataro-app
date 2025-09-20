"use client"

import { useState } from "react"
import { Repeat2, ThumbsUp, MessageCircle } from "lucide-react"
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostAction } from "@/components/post-action"
import { Post } from "@/types/post"
import Link from "next/link"
import { getAuth } from "firebase/auth"

type PostComponentProps = {
    post: Post
    isPreview?: boolean
    onDeleted?: (id: string) => void
}

export default function PostComponent({ post, isPreview, onDeleted }: PostComponentProps) {
    const { author, content } = post
    const [likes, setLikes] = useState<number>(post.likes ?? 0)
    const [liked, setLiked] = useState<boolean>(false) // opcional: podrías hidratarlo con `post.likedBy.includes(uid)`

    async function handleLike() {
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (!user) return

            const token = await user.getIdToken()

            // UI optimista
            setLiked((prev) => !prev)
            setLikes((prev) => prev + (liked ? -1 : 1))

            const res = await fetch(`/api/posts/${post.id}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!res.ok) {
                // revertir si falla
                setLiked((prev) => !prev)
                setLikes((prev) => prev + (liked ? 1 : -1))
            }
        } catch (err) {
            console.error("Error en like:", err)
            // revertir si falla
            setLiked((prev) => !prev)
            setLikes((prev) => prev + (liked ? 1 : -1))
        }
    }

    return (
        <Card
            className={`${isPreview ? "rounded-2xl" : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                }`}
        >
            <CardHeader>
                <CardTitle>
                    <Link className="hover:underline" href={`/profile/${post.uid}`}>
                        {author}
                    </Link>
                </CardTitle>
                {!isPreview && (
                    <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1">
                        <PostAction
                            postId={post.id}
                            authorId={post.uid}
                            onDeleted={() => onDeleted?.(post.id)}
                        />
                    </CardAction>
                )}
            </CardHeader>

            <CardContent>
                <p>{content}</p>
            </CardContent>

            <CardFooter className="gap-4">
                <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
                    <MessageCircle />
                </Button>
                <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
                    <Repeat2 />
                </Button>
                <Button
                    variant={liked ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-2"
                    disabled={isPreview}
                    onClick={handleLike}
                >
                    <ThumbsUp />
                    <span>{likes}</span>
                </Button>
            </CardFooter>
        </Card>
    )
}
