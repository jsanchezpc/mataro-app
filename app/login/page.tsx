"use client"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/app/context/AuthContext"

export default function Login() {
  const { user, loadingUser } = useAuth()
  const router = useRouter()

  if (loadingUser) {
    return <div className="flex justify-center items-center min-h-svh">Cargando...</div>
  }

  if (user) {
    router.push("/")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 pt-0 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Mataró
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
