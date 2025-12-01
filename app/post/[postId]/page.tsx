"use client"

import { useEffect, useState } from "react"
import { redirect, useParams } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import PostComponent from "@/components/post"
import { Post } from "@/types/post"
import { fetchPost } from "@/lib/posts"

export default function PostView() {
    const { postId } = useParams()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPost() {
            setLoading(true)
            try {
                const fetchedPost = await fetchPost(postId as string)
                setPost(fetchedPost)
            } catch {
            } finally {
                setLoading(false)
            }
        }
        
        if (postId) {
            loadPost()
        }
    }, [postId])

    return (
        <div className="font-sans rounded md:p-8">
            <div className="max-w-200 mx-auto">
                <Toaster position="top-center" />
                
                <div className="pt-0 pb-20">
                    {loading ? (
                        <p className="text-center text-gray-500">Cargando post...</p>
                    ) : !post ? (
                        <p className="text-center text-gray-400">Post no encontrado</p>
                    ) : (
                        <PostComponent
                            post={post}
                            isPreview={false}
                            onDeleted={() => {
                                redirect("/")
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}