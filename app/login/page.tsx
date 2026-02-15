"use client"

import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-green-800 text-white rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  )
}
