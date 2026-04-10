import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, AlertTriangle, Phone, Users, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function SafetyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/home">
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Safety Guidelines</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Emergency Contact Card */}
          <Card className="border-0 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Emergency Contacts</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Emergency Services (Chile):</strong> 133 (Police), 131 (Ambulance), 132 (Fire)
                    </p>
                    <p className="text-gray-700">
                      <strong>SafeMove Support:</strong> +56 9 XXXX XXXX (24/7)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <CardTitle>Safety Tips for Group Activities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Always inform someone</h4>
                    <p className="text-sm text-gray-600">
                      Let a friend or family member know where you're going and when you expect to return
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Meet in public places</h4>
                    <p className="text-sm text-gray-600">
                      Always choose well-known, public meeting points for the start of your activities
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Check participant profiles</h4>
                    <p className="text-sm text-gray-600">
                      Review the profiles and reputation scores of other participants before joining
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Bring essential equipment</h4>
                    <p className="text-sm text-gray-600">
                      Always carry water, phone, ID, and any sport-specific safety gear
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Stay with the group</h4>
                    <p className="text-sm text-gray-600">
                      Don't separate from the group, especially in unfamiliar areas
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Trust your instincts</h4>
                    <p className="text-sm text-gray-600">
                      If something doesn't feel right, it's okay to leave or not participate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Importance */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-teal-600" />
                <CardTitle>Why Verification Matters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                SafeMove uses identity verification to create a trusted community. Verified members have completed one
                of our verification processes, which helps ensure everyone's safety.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Look for the verified badge</strong> when joining events. Verified members have proven their
                  identity and are more trustworthy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Route Safety */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" />
                <CardTitle>Route Safety Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Review the route description and difficulty level before joining</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Check weather conditions for the day of the event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Ensure you have the required equipment listed by the organizer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Know your physical limits and choose appropriate difficulty levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Carry a fully charged phone with emergency contacts saved</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Report Issues */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <CardTitle>Report Safety Concerns</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                If you experience or witness any safety concerns, inappropriate behavior, or suspicious activity, please
                report it immediately.
              </p>
              <Button className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700">
                Report an Issue
              </Button>
              <p className="text-xs text-gray-500 text-center">
                All reports are confidential and reviewed by our safety team
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
