"use client"

import { useState, useEffect } from "react"
import { VisitasTable } from "@/components/visitas-table"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function VisitasPage() {
  const [visitas, setVisitas] = useState([])

  const fetchVisitas = async () => {
    try {
      const res = await fetch('/api/visitas')
      if (res.ok) {
        const data = await res.json()
        // Mapear documentos para adaptar 'nombre' de BD a 'name' usado en el componente visual (si es necesario)
        // O simplemente pasar los datos tal cual si actualizamos el componente.
        // Por compatibilidad rapida:
        const mappedData = data.map(v => ({
          ...v,
          documentos: v.documentos ? v.documentos.map(d => ({
            ...d,
            name: d.nombre
          })) : []
        }))
        setVisitas(mappedData)
      }
    } catch (error) {
      console.error("Error fetching visits", error)
    }
  }

  useEffect(() => {
    fetchVisitas()
  }, [])

  const handleCloseVisita = async (id, fechaFin, horaFin) => {
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaFin, horaFin })
      })
      if (!res.ok) {
        throw new Error('Failed to close visit')
      }
      await fetchVisitas()
    } catch (e) {
      console.error("Error closing visit", e)
      throw e
    }
  }

  const handleFileUpload = async (id, fileName, type) => {
    try {
      const res = await fetch(`/api/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitaId: id,
          nombre: fileName,
          tipo: type
        })
      })
      if (res.ok) {
        fetchVisitas()
      }
    } catch (e) {
      console.error("Error saving document metadata", e)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-y-auto">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none z-50" />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Registro
          </Link>
        </div>

        <VisitasTable
          visitas={visitas}
          onCloseVisita={handleCloseVisita}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  )
}
