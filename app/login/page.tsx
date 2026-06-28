import { LoginForm } from "@/components/login-form"
import { LoginLayout } from "@/components/login/login-layout"
import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const admin = await isAdmin()

  if (admin) {
    redirect("/dashboard")
  }

  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  )
}
