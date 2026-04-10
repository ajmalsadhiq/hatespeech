import { createClient } from "@/lib/supabase/server"

export default async function DiagnosticsPage() {
  let connectionStatus = "Unknown"
  let errorMessage = ""
  const envVarsStatus = {
    serverUrl: !!process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL,
    serverKey: !!process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY,
    clientUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    clientKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      connectionStatus = "Error"
      errorMessage = error.message
    } else {
      connectionStatus = "Connected"
    }
  } catch (error) {
    connectionStatus = "Failed"
    errorMessage = error instanceof Error ? error.message : "Unknown error"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Diagnóstico de Supabase</h1>

        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Estado de Conexión</h2>
            <div className="flex items-center gap-3">
              <div
                className={`h-4 w-4 rounded-full ${
                  connectionStatus === "Connected"
                    ? "bg-green-500"
                    : connectionStatus === "Error" || connectionStatus === "Failed"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              <span className="text-lg font-medium">{connectionStatus}</span>
            </div>
            {errorMessage && <p className="mt-3 text-sm text-red-600">Error: {errorMessage}</p>}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Variables de Entorno (Servidor)</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">SUPABASE_NEXT_PUBLIC_SUPABASE_URL</span>
                <span className={`font-medium ${envVarsStatus.serverUrl ? "text-green-600" : "text-red-600"}`}>
                  {envVarsStatus.serverUrl ? "✓ Configurada" : "✗ Falta"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span className={`font-medium ${envVarsStatus.serverKey ? "text-green-600" : "text-red-600"}`}>
                  {envVarsStatus.serverKey ? "✓ Configurada" : "✗ Falta"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Variables de Entorno (Cliente)</h2>
            <p className="mb-3 text-sm text-gray-600">
              Estas variables son necesarias para autenticación en el navegador
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_URL</span>
                <span className={`font-medium ${envVarsStatus.clientUrl ? "text-green-600" : "text-red-600"}`}>
                  {envVarsStatus.clientUrl ? "✓ Configurada" : "✗ Falta"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span className={`font-medium ${envVarsStatus.clientKey ? "text-green-600" : "text-red-600"}`}>
                  {envVarsStatus.clientKey ? "✓ Falta" : "✗ Falta"}
                </span>
              </div>
            </div>
            {(!envVarsStatus.clientUrl || !envVarsStatus.clientKey) && (
              <div className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                <p className="font-semibold">Acción requerida:</p>
                <p className="mt-1">
                  Agrega estas variables en la sección "Vars" del sidebar con los mismos valores de las variables del
                  servidor (sin el prefijo SUPABASE_)
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Valores de Variables (parcial)</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">URL: </span>
                <span className="font-mono text-gray-600">
                  {process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Key: </span>
                <span className="font-mono text-gray-600">
                  {process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-block rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}
