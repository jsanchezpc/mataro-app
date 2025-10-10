"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Post } from "@/types/post";
import { getUserByUsername, getPostsByUserIdPaginated } from "@/lib/firebase"
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
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string, avatarURL?: string } | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [lastVisible, setLastVisible] = useState<number | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Cargar perfil
    const fetchUser = useCallback(async () => {
        if (!params?.username) return
        const data = await getUserByUsername(params.username as string)
        setProfile(data)
    }, [params?.username])

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
            if (!profile?.id) return
            setLoading(true)
            const { posts: fetchedPosts, lastVisible: cursor } =
                await getPostsByUserIdPaginated(profile.id, 0, 20)

            setPosts(fetchedPosts as Post[])
            setLastVisible(cursor)
            setHasMore(fetchedPosts.length === 20)
            setLoading(false)
        }

        loadInitialPosts()
    }, [profile?.id])



    const loadMorePosts = useCallback(async () => {
        if (loadingMore || !hasMore || lastVisible === null || !profile?.id) return
        setLoadingMore(true)

        const { posts: morePosts, lastVisible: newCursor } =
            await getPostsByUserIdPaginated(profile.id, lastVisible, 20)

        setPosts(prev => [...prev, ...(morePosts as Post[])])
        setLastVisible(newCursor)
        setHasMore(morePosts.length === 20)
        setLoadingMore(false)
    }, [loadingMore, hasMore, lastVisible, profile?.id])


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
    }, [posts, hasMore, loadingMore, loadMorePosts])

    async function handleCreatedPost() {
        setLoading(true)
        const { posts: fetchedPosts, lastVisible: cursor } =
            await getPostsByUserIdPaginated(params.username as string, undefined, 20)

        setPosts(fetchedPosts as Post[])
        setLastVisible(cursor)
        setHasMore(fetchedPosts.length === 20)
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
                        <Avatar className="size-20">
                            <AvatarImage
                                src={profile?.avatarURL}
                                className="object-contain w-full h-full"
                            />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>


                        <CardTitle className="text-left text-2xl">
                            {profile?.username
                                ? profile.username
                                : "Mataroní/nesa"}
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

                <Tabs defaultValue="posts" className="">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="media">Fotos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="py-4">
                        {loading ? (
                            <p className="text-center text-gray-500">Cargando posts...</p>
                        ) : posts.length === 0 ? (
                            <p className="text-gray-400">
                                {profile?.username
                                    ? profile.username
                                    : "Mataroní/nesa"}
                                no ha publicado.</p>
                        ) : (
                            // Ordena los posts por timestamp descendente antes de renderizar
                            [...posts]
                                .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
                                .map((post) => (
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
                    <TabsContent value="media" className="py-4">
                        <p className="text-gray-400">
                            {profile?.username
                                ? profile.username
                                : "Mataroní/nesa"}
                            no ha subido fotos.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
