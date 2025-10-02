"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
// APP components
import CreatePost from "@/components/create-post"
import PostComponent from "@/components/post"
// const Timestamp = admin.firestore.Timestamp; // Si lo necesitas directamente, pero en el cliente, suele ser un objeto o string.
import { Post } from "@/types/post";
import { fetchPosts } from "@/lib/posts";


export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    }
    loadPosts();
  }, []) // El array vacío asegura que se ejecuta solo una vez al montar

  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <Toaster position="top-center" />
        <CreatePost onCreated={async () => {
          const updatedPosts = await fetchPosts();
          setPosts(updatedPosts);
        }} />

        <div className="pt-0 pb-20 flex flex-col">
          {loading ? (
            <p className="text-center text-gray-500">Cargando posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400">No hay posts aún. ¡Sé el primero en publicar! 🚀</p>
          ) : (
            posts.map((post) => (
              <PostComponent
                key={post.id}
                post={post}
                isPreview={false}
                onDeleted={(deletedId) =>
                  setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
