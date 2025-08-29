"use client"

import { useAuth } from "@/app/context/AuthContext"
import Link from "next/link"

export default function ProfileView() {
    const { user, loading } = useAuth()

    return (
        <div className="font-sans rounded md:p-8">
            <div className="max-w-200 mx-auto">
                <h1 className="text-4xl">
                    {loading ? <p className="text-lg">Cargando...</p> : user ? (
                        user.displayName || "Mataroní"
                    ) : (
                        <Link href="/login">Entrar</Link>
                    )}
                </h1>
            </div>
        </div>
    )
}
