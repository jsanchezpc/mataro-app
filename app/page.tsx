"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
// APP components
import CreatePost from "@/components/create-post"
import PostComponent from "@/components/post"
import { Post } from "@/types/post";
import { getAllPostsPaginated, getFollowingPostsPaginated } from "@/lib/firebase";

export default function Home() {
  const { user, loadingUser } = useAuth()
  
  // State for All Posts
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<unknown | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // State for Following Posts
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])
  const [loadingFollowing, setLoadingFollowing] = useState(true)
  const [lastVisibleFollowing, setLastVisibleFollowing] = useState<unknown | null>(null)
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true)
  const [loadingMoreFollowing, setLoadingMoreFollowing] = useState(false)

  const [activeTab, setActiveTab] = useState("mataro")

  // Initial load for All Posts
  useEffect(() => {
    async function loadInitialPosts() {
      setLoading(true)
      const { posts: fetchedPosts, lastVisible: cursor, snapshotSize } = await getAllPostsPaginated(undefined, 5, user?.uid)
      setPosts(fetchedPosts)
      setLastVisible(cursor)
      setHasMore(snapshotSize === 5)
      setLoading(false)
    }
    if (!loadingUser) {
      loadInitialPosts()
    }
  }, [user, loadingUser])

  // Initial load for Following Posts
  useEffect(() => {
    async function loadInitialFollowing() {
      if (!user?.uid) {
        setLoadingFollowing(false)
        return
      }
      setLoadingFollowing(true)
      const { posts: fetchedPosts, lastVisible: cursor, snapshotSize } = await getFollowingPostsPaginated(user.uid, undefined, 5)
      setFollowingPosts(fetchedPosts)
      setLastVisibleFollowing(cursor)
      setHasMoreFollowing(snapshotSize === 5)
      setLoadingFollowing(false)
    }

    if (!loadingUser && activeTab === "following" && followingPosts.length === 0) {
      loadInitialFollowing()
    }
  }, [user, loadingUser, activeTab, followingPosts.length]) 

  // Load More: All Posts
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !lastVisible) return
    setLoadingMore(true)
    try {
      const { posts: newPosts, lastVisible: newCursor, snapshotSize } = await getAllPostsPaginated(lastVisible, 5, user?.uid)
      if (snapshotSize < 5) setHasMore(false)
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
  }, [loadingMore, hasMore, lastVisible, user])

  // Load More: Following Posts
  const loadMoreFollowingPosts = useCallback(async () => {
    if (loadingMoreFollowing || !hasMoreFollowing || !lastVisibleFollowing || !user?.uid) return
    setLoadingMoreFollowing(true)
    try {
      const { posts: newPosts, lastVisible: newCursor, snapshotSize } = await getFollowingPostsPaginated(user.uid, lastVisibleFollowing, 5)
      if (snapshotSize < 5) setHasMoreFollowing(false)
      setFollowingPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNewPosts]
      })
      setLastVisibleFollowing(newCursor)
    } catch (error) {
      console.error("Error loading more following posts", error)
    } finally {
      setLoadingMoreFollowing(false)
    }
  }, [loadingMoreFollowing, hasMoreFollowing, lastVisibleFollowing, user])

  // Scroll Listener
  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        if (activeTab === "mataro") {
            if (hasMore && !loadingMore && !loading) loadMorePosts()
        } else if (activeTab === "following") {
            if (hasMoreFollowing && !loadingMoreFollowing && !loadingFollowing) loadMoreFollowingPosts()
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [
      activeTab, 
      hasMore, loadingMore, loading, loadMorePosts,
      hasMoreFollowing, loadingMoreFollowing, loadingFollowing, loadMoreFollowingPosts
  ])

  // Handle Post Created
  const handlePostCreated = async () => {
    // Reload active tab
    if (activeTab === "mataro") {
      setLoading(true)
      const { posts: fetchedPosts, lastVisible: cursor } = await getAllPostsPaginated(undefined, 5, user?.uid)
      setPosts(fetchedPosts)
      setLastVisible(cursor)
      setHasMore(fetchedPosts.length === 5)
      setLoading(false)
    } else if (activeTab === "following" && user?.uid) {
      setLoadingFollowing(true)
      const { posts: fetchedPosts, lastVisible: cursor } = await getFollowingPostsPaginated(user.uid, undefined, 5)
      setFollowingPosts(fetchedPosts)
      setLastVisibleFollowing(cursor)
      setHasMoreFollowing(fetchedPosts.length === 5)
      setLoadingFollowing(false)
    }
  }

  return (
    <div className="font-sans rounded md:p-4">
      <div className="max-w-200 mx-auto">
        <Toaster position="top-center" />
        <CreatePost onCreated={handlePostCreated} />
        <Tabs defaultValue="mataro" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mx-auto mb-8">
            <TabsTrigger value="mataro">Mataró</TabsTrigger>
            <TabsTrigger value="following">Siguiendo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mataro">
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
          </TabsContent>

          <TabsContent value="following">
             <div className="pt-0 pb-20 flex flex-col">
              {loadingFollowing ? (
                <p className="text-center text-gray-500">Cargando posts de gente que sigues...</p>
              ) : followingPosts.length === 0 ? (
                <div className="text-center pt-10">
                    <h1 className="text-3xl font-light text-gray-500/50 mb-4">Aun no sigues a nadie</h1>
                    <p className="text-gray-400">¡Sigue a usuarios para ver sus posts aquí!</p>
                </div>
              ) : (
                followingPosts.map((post) => (
                  <PostComponent
                    key={post.id}
                    post={post}
                    isPreview={false}
                    onDeleted={(deletedId) =>
                      setFollowingPosts((prev) => prev.filter((p) => p.id !== deletedId))
                    }
                  />
                ))
              )}

              {loadingMoreFollowing && (
                <div className="text-center py-4 text-gray-500">Cargando más...</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
