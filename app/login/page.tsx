import { LoginForm } from "@/components/login-form"
import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Gamepad2 } from "lucide-react"

export default async function LoginPage() {
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Gamepad2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Área Administrativa</h1>
          <p className="text-muted-foreground">Entre com a senha para acessar o painel de controle</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
