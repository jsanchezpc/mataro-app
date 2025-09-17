"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
// APP components
import CreatePost from "@/components/create-post"
import PostComponent from "@/components/post"
// const Timestamp = admin.firestore.Timestamp; // Si lo necesitas directamente, pero en el cliente, suele ser un objeto o string.
import { Post } from "@/types/post";


export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadPosts() {
      setLoading(true); // Indica que la carga ha comenzado
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts); // Actualiza el estado con los posts obtenidos
      setLoading(false); // Indica que la carga ha terminado
    }
    loadPosts();
  }, []) // El array vacío asegura que se ejecuta solo una vez al montar

  async function fetchPosts(): Promise<Post[]> { // Indica que devuelve un array de Post
    try {
      const res = await fetch("/api/posts")

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`)
      }

      const data = await res.json()
      // console.log("Datos obtenidos:", data); 
      return data as Post[];
    } catch (err) {
      console.error("❌ Error cargando posts:", err)
      return [] 
    }
  }

  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <Toaster position="top-center" />

        {/* onCreated debería volver a cargar los posts después de uno nuevo */}
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
