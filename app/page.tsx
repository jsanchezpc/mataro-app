"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
// APP components
import CreatePost from "@/components/create-post"
import PostComponent from "@/components/post"
// const Timestamp = admin.firestore.Timestamp; // Si lo necesitas directamente, pero en el cliente, suele ser un objeto o string.
import { Post } from "@/types/post";
import { getAllPostsPaginated } from "@/lib/firebase";

export default function Home() {
  const { user, loadingUser } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<any | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Carga inicial
  useEffect(() => {
    async function loadInitialPosts() {
      setLoading(true)
      const { posts: fetchedPosts, lastVisible: cursor } = await getAllPostsPaginated(undefined, 5, user?.uid) // Carga 5 posts
      setPosts(fetchedPosts)
      setLastVisible(cursor)
      setHasMore(fetchedPosts.length === 5)
      setLoading(false)
    }
    if (!loadingUser) {
        loadInitialPosts()
    }
  }, [user, loadingUser])

  // Cargar más posts
  async function loadMorePosts() {
     if (loadingMore || !hasMore || !lastVisible) return
     setLoadingMore(true)
     try {
        const { posts: newPosts, lastVisible: newCursor } = await getAllPostsPaginated(lastVisible, 5, user?.uid)
        
        if (newPosts.length < 5) {
            setHasMore(false)
        }

        // Evitar duplicados
        setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id))
            const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id))
            return [...prev, ...uniqueNewPosts]
        })
        
        setLastVisible(newCursor)
     } catch (error) {
         console.error("Error loading more posts", error)
     } finally {
        setLoadingMore(false)
     }
  }

  // Scroll listener
  useEffect(() => {
      function handleScroll() {
          if (
              window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
              hasMore &&
              !loadingMore // Note: This relies on loadingMore being up to date in the closure
          ) {
              loadMorePosts()
          }
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, loadingMore, lastVisible]) // Dependencies ensure listener is recreated when loadingMore changes

  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <Toaster position="top-center" />
        <CreatePost onCreated={async () => {
          // Al crear, simplemente recargamos todo para ver el nuevo arriba, 
          // O podríamos prependearlo. Recargar es más seguro para consistencia.
          setLoading(true)
          const { posts: fetchedPosts, lastVisible: cursor } = await getAllPostsPaginated(undefined, 5)
          setPosts(fetchedPosts)
          setLastVisible(cursor)
          setHasMore(fetchedPosts.length === 5)
          setLoading(false)
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
          
          {loadingMore && (
              <div className="text-center py-4 text-gray-500">Cargando más...</div>
          )}
        </div>
      </div>
    </div>
  )
}
