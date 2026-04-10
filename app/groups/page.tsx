import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GroupsList } from "@/components/groups-list"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function GroupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all groups
  const { data: groups } = await supabase
    .from("groups")
    .select(
      `
      *,
      leader:profiles!groups_leader_id_fkey(id, full_name, display_name, is_verified, reputation_score)
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/home">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
            </div>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              asChild
            >
              <Link href="/groups/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <GroupsList groups={groups || []} />
      </main>
    </div>
  )
}
