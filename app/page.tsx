"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
// APP components
import CreatePost from "@/components/create-post"
import Riera from "@/components/riera"
// Firebase
import { getAllPosts } from "@/lib/firebase"

type Post = {
  id: string
  uid: string,
  author: string,
  content: string
  timestamp?: any
  likes: number
  comments: number
  rt: number
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const fetchedPosts = await getAllPosts()
        setPosts(fetchedPosts as Post[])
      } catch (error) {
        console.error("❌ Error cargando posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <Toaster position="top-center" />

        <CreatePost />

        <div className="pt-0 pb-20 flex flex-col">
          {loading ? (
            <p className="text-center text-gray-500">Cargando posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400">No hay posts aún. ¡Sé el primero en publicar! 🚀</p>
          ) : (
            posts.map((post) => (
              <Riera key={post.id} post={post} isPreview={false} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
