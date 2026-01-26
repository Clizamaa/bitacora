"use client"

import { ServerLogForm } from "@/components/server-log-form"
import Link from "next/link"
import { ClipboardList, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  const handleRegister = async (formData) => {
    const inputDate = new Date(formData.horaInicio)
    const fecha = inputDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const hora = inputDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const body = {
      rut: formData.rut,
      nombre: formData.nombre,
      empresa: formData.empresa,
      autoriza: formData.autoriza,
      horaInicio: hora,
      motivo: formData.motivo,
      fecha: fecha
    }

    try {
      const res = await fetch('/api/visitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setTimeout(() => {
          router.push("/visitas")
        }, 3000)
      }
    } catch (e) {
      console.error("Error creating visit", e)
    }
  }

  return (
    <div className="h-screen bg-background p-4 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Fondo decorativo con efecto tech */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none z-50" />

      {/* Botón flotante debajo del toggle de tema */}
      <Link
        href="/visitas"
        className="fixed top-16 right-3 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 backdrop-blur px-3 py-2 text-foreground shadow-sm hover:bg-secondary/80 text-xs font-medium"
      >
        <ClipboardList className="h-4 w-4" />
        Ver Registros
      </Link>

      {/* Botón Salir */}
      <Link
        href="https://10.8.245.100:8084/"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 backdrop-blur text-foreground px-4 py-2 shadow-lg transition-all hover:bg-red-500/50 hover:border-red-200"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </Link>

      <div className="w-full flex justify-center items-center">
        <ServerLogForm onVisitRegistered={handleRegister} />
      </div>
    </div>
  )
}
