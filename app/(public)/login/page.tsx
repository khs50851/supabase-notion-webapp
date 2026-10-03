import { LoginForm } from "@/components/auth/login-form"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <LoginForm oauthError={error} />
    </div>
  )
}
