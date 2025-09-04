"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@radix-ui/react-separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileView() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [loading, user, router])

    const params = useParams()

    if (loading) {
        return (
            <div className="font-sans h-full">
                <div className="w-full max-w-full md:max-w-200  mx-auto h-full overflow-x-auto">
                    <Card className="rounded-none h-full bg-transparent border-none shadow-none gap-4">
                        <CardHeader className="gap-2">
                            <Avatar className="size-20 mb-2">
                                <Skeleton className="rounded-full size-20" />
                            </Avatar>
                            <Skeleton className="w-full md:w-1/3 h-6" />
                            <CardAction>

                            </CardAction>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-row gap-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <Skeleton className="w-4 h-4" />
                                    </div>
                                    <div className="flex">
                                        <Skeleton className="w-14 h-4" />
                                    </div>
                                </div>
                                <Separator orientation="vertical" />
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <Skeleton className="w-4 h-4" />
                                    </div>
                                    <div className="flex">
                                        <Skeleton className="w-14 h-4" />
                                    </div>
                                </div>
                                <Separator orientation="vertical" />
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <Skeleton className="w-4 h-4" />
                                    </div>
                                    <div className="flex">
                                        <Skeleton className="w-14 h-4" />
                                    </div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    return (

        <div className="font-sans h-full">
            <div className="w-full max-w-full md:max-w-200  mx-auto h-full overflow-x-auto">
                <Card className="rounded-none h-full bg-transparent border-none shadow-none">
                    <CardHeader className="gap-0">
                        <Avatar className="size-20 mb-2">
                            <AvatarImage src={user?.photoURL ?? undefined} />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-left text-2xl">{user?.displayName ? user.displayName : "Usuario"}</CardTitle>

                        <CardAction>
                            {user?.uid && user.uid === params?.userId ? (
                                <Button variant="outline">Editar</Button>
                            ) : (
                                <Button variant="outline">Seguir</Button>
                            )}
                        </CardAction>

                    </CardHeader>
                    <CardContent>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus consequuntur voluptatem nemo laudantium cum ratione! Explicabo eveniet laborum similique sed fuga nihil quae quod suscipit veritatis impedit culpa, fugiat tenetur?</p>
                    </CardContent>
                    <CardFooter>
                        <div className="flex flex-row gap-8">
                            <div className="flex flex-col">
                                <div className="flex">
                                    0
                                </div>
                                <div className="flex">
                                    Posts
                                </div>
                            </div>
                            <Separator orientation="vertical" />
                            <div className="flex flex-col">
                                <div className="flex">
                                    0
                                </div>
                                <div className="flex">
                                    Fotos
                                </div>
                            </div>
                            <Separator orientation="vertical" />
                            <div className="flex flex-col">
                                <div className="flex">
                                    0
                                </div>
                                <div className="flex">
                                    Seguidores
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
                <Tabs defaultValue="posts" className=" px-6">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="Fotos">Fotos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts">Make changes to your account here.</TabsContent>
                    <TabsContent value="media">
                        <p className="text-slate-100">{user?.displayName ? user.displayName : "Mataroní"} no ha subido fotos.</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
