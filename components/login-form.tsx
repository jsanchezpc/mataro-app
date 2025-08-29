"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logInWithGoogle, logInWithEmail, signUpWithEmail } from "@/lib/firebase"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegister) {
        await signUpWithEmail(email, password)
        console.log("✅ Registro correcto")
      } else {
        await logInWithEmail(email, password)
        console.log("✅ Login correcto")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ha ocurrido un error desconocido")
      }
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido a Mataró</CardTitle>
          <CardDescription>
            {isRegister
              ? "Crea tu cuenta con tu correo o con Google"
              : "Entra con tu cuenta de Google o tu correo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button onClick={logInWithGoogle} variant="outline" className="w-full">
                  Entrar con Google
                </Button>
              </div>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  O continua con
                </span>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@mataro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    {!isRegister && (
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        ¿Has olvidado tu contraseña?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-slate-100"
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : isRegister
                      ? "Registrarse"
                      : "Entrar"}
                </Button>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>

              <div className="text-center text-sm">
                {isRegister ? (
                  <>
                    ¿Ya tienes una cuenta?{" "}
                    <p
                      onClick={() => setIsRegister(false)}
                      className="underline hover:cursor-pointer underline-offset-4"
                    >
                      Inicia sesión
                    </p>
                  </>
                ) : (
                  <>
                    ¿Aún no tienes una cuenta?{" "}
                    <p
                      onClick={() => setIsRegister(true)}
                      className="underline hover:cursor-pointer underline-offset-4"
                    >
                      Crear una
                    </p>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
