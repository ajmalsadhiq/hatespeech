import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SportSelector } from "@/components/sport-selector"
import { Button } from "@/components/ui/button"
import { Bell, User, LogOut, Users, Shield } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile doesn't exist, create one
  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
    })
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              SafeMove
            </h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/safety">
                  <Shield className="w-5 h-5" />
                  <span className="sr-only">Safety</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/groups">
                  <Users className="w-5 h-5" />
                  <span className="sr-only">Groups</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/notifications">
                  <Bell className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="w-5 h-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <form action={handleSignOut}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="w-5 h-5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
            </h2>
            <p className="text-lg text-gray-600">What sport are you interested in today?</p>
          </div>

          {/* Sport Selector */}
          <SportSelector />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{profile?.total_events_attended || 0}</div>
              <div className="text-sm text-gray-600">Events Joined</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-pink-600">{profile?.total_events_created || 0}</div>
              <div className="text-sm text-gray-600">Events Created</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-teal-600">{profile?.reputation_score || 0}</div>
              <div className="text-sm text-gray-600">Reputation</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
