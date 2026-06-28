"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { login } from "@/lib/auth"

const FIELD_SHELL =
  "rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10 transition-[box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-primary/40"

const FIELD_INPUT =
  "w-full rounded-[calc(1rem-0.25rem)] bg-white/[0.03] px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] placeholder:text-muted-foreground/55 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push("/dashboard")
      router.refresh()
    } else {
      setError(result.error || "Erro ao fazer login")
      setLoading(false)
    }
  }

  return (
    <div className="login-form-enter">
      <div className="mb-8 space-y-2.5">
        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Admin
        </span>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          Bem-vindo de volta
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Entre com email e senha para acessar o painel de controle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="login-form-field space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground/90"
          >
            Email
          </label>
          <div className={FIELD_SHELL}>
            <input
              id="email"
              type="email"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div className="login-form-field space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground/90"
          >
            Senha
          </label>
          <div className={cn(FIELD_SHELL, "relative")}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className={cn(FIELD_INPUT, "pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="login-form-field text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "login-form-field group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground",
            "transition-[transform,background-color,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {loading ? "Entrando..." : "Entrar"}
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-white/10",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "group-hover:translate-x-0.5 group-hover:-translate-y-px",
            )}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </button>
      </form>
    </div>
  )
}
