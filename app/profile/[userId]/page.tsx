"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useEffect, useState } from "react"
import { getUserById } from "@/lib/firebase"
import { useParams, useRouter } from "next/navigation"

// APP components
import ProfileAction from "@/components/profile-action-btn"

// UI components
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
import { Separator } from "@radix-ui/react-separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/components/create-post"

export default function ProfileView() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [loading, user, router])

    async function fetchUser() {
        if (!params?.userId) return
        const data = await getUserById(params.userId as string)
        setProfile(data)
    }

    useEffect(() => {
        fetchUser()
    }, [params?.userId])

    if (loading) {
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
                <CreatePost />
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
                                onUpdated={fetchUser} // 👈 refresca perfil al actualizar
                            />
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        <p>{profile?.description ?? ""}</p>
                    </CardContent>

                    <CardFooter>
                        <div className="flex flex-row gap-8">
                            <div className="flex flex-col">
                                <div className="flex">0</div>
                                <div className="flex">Posts</div>
                            </div>
                            <Separator orientation="vertical" />
                            <div className="flex flex-col">
                                <div className="flex">0</div>
                                <div className="flex">Fotos</div>
                            </div>
                            <Separator orientation="vertical" />
                            <div className="flex flex-col">
                                <div className="flex">0</div>
                                <div className="flex">Seguidores</div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                <Tabs defaultValue="posts" className="px-6">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="media">Fotos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts">
                        <p>
                            {profile?.username
                                ? profile.username
                                : user?.displayName
                                    ? user.displayName
                                    : "Mataroní"}{" "}
                            no ha publicado.
                        </p>
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
