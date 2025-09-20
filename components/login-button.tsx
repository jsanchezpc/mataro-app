"use client"
// Firebase Auth
import { useAuth } from "@/app/context/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginButton() {
    const { user, loadingUser } = useAuth()

    if (loadingUser) {
        return (
            <div></div>
        )
    }

    return (
        <div>
            {user ?
                <div></div>
                : <Link className="ml-4" href="/login">
                    <Button className="cursor-pointer text-amber-50">Entrar</Button>
                </Link>}
        </div>
    )
}