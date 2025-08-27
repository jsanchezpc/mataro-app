"use client"
// Firebase Auth
import { useAuth } from "@/app/context/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginButton() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div></div>
        )
    }

    return (
        <div>
            {user ?
                <div></div>
                : <Link className="ml-4" href="/login">
                    <Button className="cursor-pointer">Entrar</Button>
                </Link>}
        </div>
    )
}