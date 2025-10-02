"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Post } from "@/types/post";
import { getUserById, getPostsByUserIdPaginated } from "@/lib/firebase"
// APP components
import ProfileAction from "@/components/profile-action-btn"
import CreatePost from "@/components/create-post"
import { Toaster } from "@/components/ui/sonner"
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostComponent from "@/components/post"

export default function ProfileView() {
    const { user, loadingUser } = useAuth()
    const router = useRouter()
    const params = useParams()
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Cargar perfil
    const fetchUser = useCallback(async () => {
        if (!params?.userId) return
        const data = await getUserById(params.userId as string)
        setProfile(data)
    }, [params?.userId])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    // Redirigir si no hay usuario
    useEffect(() => {
        if (!loadingUser && !user) {
            router.push("/login")
        }
    }, [loadingUser, user, router])

    // Cargar los primeros 20 posts
    useEffect(() => {
        async function loadInitialPosts() {
            setLoading(true)
            const fetchedPosts = await getPostsByUserIdPaginated(params.userId as string, undefined, 20)
            // Ensure fetchedPosts is of type Post[]
            setPosts(fetchedPosts as Post[])
            setHasMore(fetchedPosts.length === 20)
            setLoading(false)
        }
        if (params?.userId) loadInitialPosts()
    }, [params?.userId])

    // Handler para cargar más posts
    async function loadMorePosts() {
        if (loadingMore || !hasMore || posts.length === 0) return
        setLoadingMore(true)
        const lastPost = posts[posts.length - 1]
        const morePosts = await getPostsByUserIdPaginated(params.userId as string, lastPost.timestamp, 20)
        setPosts(prev => [...prev, ...(morePosts as Post[])])
        setHasMore(morePosts.length === 20)
        setLoadingMore(false)
    }

    // Detectar scroll al final
    useEffect(() => {
        function handleScroll() {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
                hasMore &&
                !loadingMore
            ) {
                loadMorePosts()
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [posts, hasMore, loadingMore])

    // Actualizar posts tras crear uno nuevo
    async function handleCreatedPost() {
        setLoading(true)
        const fetchedPosts = await getPostsByUserIdPaginated(params.userId as string, undefined, posts.length || 20)
        setPosts(fetchedPosts as Post[])
        setHasMore(fetchedPosts.length === (posts.length || 20))
        setLoading(false)
    }

    if (loadingUser) {
        return (
            <div className="font-sans h-full">
                <div className="w-full max-w-full md:max-w-200 mx-auto h-full overflow-x-auto">
                    <Card className="rounded-none h-full bg-transparent border-none shadow-none gap-4">
                        <CardHeader className="gap-2">
                            <Avatar className="size-20 mb-2">
                                <Skeleton className="rounded-full size-20" />
                            </Avatar>
                            <Skeleton className="w-full md:w-1/3 h-6" />
                            <CardAction />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-row gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex">
                                            <Skeleton className="w-4 h-4" />
                                        </div>
                                        <div className="flex">
                                            <Skeleton className="w-14 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="font-sans h-full">
            <div className="w-full max-w-full md:max-w-200 mx-auto h-full overflow-x-auto">
                <CreatePost onCreated={handleCreatedPost} />
                <Toaster position="top-center" />

                <Card className="rounded-none h-full bg-transparent border-none shadow-none">
                    <CardHeader className="gap-0">
                        <Avatar className="size-20 mb-2">
                            <AvatarImage src={user?.photoURL ?? undefined} />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-left text-2xl">
                            {profile?.username
                                ? profile.username
                                : user?.displayName
                                    ? user.displayName
                                    : "Usuario"}
                        </CardTitle>

                        <CardAction>
                            <ProfileAction
                                profile={{
                                    username: profile?.username,
                                    description: profile?.description,
                                }}
                                onUpdated={fetchUser}
                            />
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        <p>{profile?.description ?? ""}</p>
                    </CardContent>

                    <CardFooter>
                        <div className="flex flex-row gap-8">
                            <div className="flex flex-col">
                                <div className="flex">
                                    {loading ? (
                                        <Skeleton className="w-full h-4" />
                                    ) : posts.length}
                                </div>
                                <div className="flex">Posts</div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                <Tabs defaultValue="posts" className="px-6">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="media">Fotos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="py-4">
                        {loading ? (
                            <p className="text-center text-gray-500">Cargando posts...</p>
                        ) : posts.length === 0 ? (
                            <p className="text-center text-gray-400">
                                {profile?.username
                                    ? profile.username
                                    : user?.displayName
                                        ? user.displayName
                                        : "Mataroní"}{" "}
                                no ha publicado.</p>
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
                            <div className="flex justify-center py-4">
                                <Skeleton className="w-32 h-6" />
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="media">
                        <p>
                            {profile?.username
                                ? profile.username
                                : user?.displayName
                                    ? user.displayName
                                    : "Mataroní"}{" "}
                            no ha subido fotos.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
