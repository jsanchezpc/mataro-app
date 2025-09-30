"use client"

import { useState, useEffect } from "react"
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
import { getUserById } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PostComponentProps = {
    post: Post
    isPreview?: boolean
    onDeleted?: (id: string) => void
}

export default function PostComponent({ post, isPreview, onDeleted }: PostComponentProps) {
    const { id, uid, content } = post
    const [likes, setLikes] = useState<number>(post.likes ?? 0)
    const [liked, setLiked] = useState<boolean>(false)
    const [authorName, setAuthorName] = useState<string>("")
    const [profilePic, setProfilePic] = useState<string>("")

    useEffect(() => {
        async function fetchUser() {
            const user = await getUserById(uid)
            if (user) {
                setAuthorName((user as { username?: string }).username ?? "Mataroní Anonim")
                setProfilePic((user as { photoURL?: string }).photoURL ?? "")
            }
        }
        fetchUser()
    }, [uid])

    useEffect(() => {
        const auth = getAuth()
        const user = auth.currentUser
        if (user && post.likedBy) {
            setLiked(post.likedBy.includes(user.uid))
        }
    }, [post.likedBy])

    async function handleLike() {
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (!user) return

            const token = await user.getIdToken()
            const newLiked = !liked

            // optimista
            setLiked(newLiked)
            setLikes((prev) => prev + (newLiked ? 1 : -1))

            const res = await fetch(`/api/posts/${id}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!res.ok) {
                // revertir si falla
                setLiked(!newLiked)
                setLikes((prev) => prev + (newLiked ? -1 : 1))
            }
        } catch (err) {
            console.error("Error en like:", err)
            // revertir también
            setLiked((prev) => !prev)
            setLikes((prev) => prev + (liked ? -1 : 1))
        }
    }

    return (
        <Card
            className={`${isPreview ? "rounded-2xl" : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                }`}
        >
            <CardHeader>
                <CardTitle className="flex flex-row items-center gap-2">
                    <Avatar>
                        <AvatarImage src={profilePic} />
                        <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <Link className="hover:underline" href={`/profile/${uid}`}>
                        {authorName}
                    </Link>
                </CardTitle>

                {!isPreview && (
                    <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1">
                        <PostAction postId={id} authorId={uid} onDeleted={() => onDeleted?.(id)} />
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
                    className="cursor-pointer flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20"
                    disabled={isPreview}
                    onClick={handleLike}
                >
                    <ThumbsUp />
                    <span className="text-white">{likes}</span>
                </Button>
            </CardFooter>
        </Card>
    )
}
