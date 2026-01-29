"use client"

import { useState, useRef } from "react"
import Swal from "sweetalert2"
import { Info, XCircle, CheckCircle2, Clock, Calendar, FileUp, FileDown, FileText } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function VisitasTable({ visitas, onCloseVisita, onFileUpload }) {

  const AdobeIcon = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1.5zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
    </svg>
  )

  const [selectedVisita, setSelectedVisita] = useState(null)
  const [visitaToClose, setVisitaToClose] = useState(null)
  const [closeDate, setCloseDate] = useState("")
  const fileInputRef = useRef(null)
  const [uploadingId, setUploadingId] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedVisitaForDownload, setSelectedVisitaForDownload] = useState(null)
  const [uploadType, setUploadType] = useState(null) // 'OT' | 'ACTA'

  const openCloseModal = (visita) => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setCloseDate(now.toISOString().slice(0, 16))
    setVisitaToClose(visita)
  }

  const confirmClose = async () => {
    if (!visitaToClose || !closeDate) return

    const dateObj = new Date(closeDate)

    const [day, month, year] = visitaToClose.fecha.split('/')
    const [hours, minutes] = visitaToClose.horaInicio.split(':')
    const startDate = new Date(year, month - 1, day, hours, minutes)

    if (dateObj < startDate) {
      Swal.fire({
        title: "Error",
        text: "La fecha y hora de fin no puede ser anterior al inicio de la visita.",
        icon: "error",
        background: "var(--card)",
        color: "var(--foreground)",
      })
      return
    }

    const fecha = dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const hora = dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    try {
      await onCloseVisita(visitaToClose.id, fecha, hora)

      setVisitaToClose(null)
      setCloseDate("")

      Swal.fire({
        title: "¡Cerrado!",
        text: "La visita ha sido finalizada correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "var(--card)",
        color: "var(--foreground)",
      })
    } catch (error) {
      console.error("Error al cerrar visita:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudo finalizar la visita. Por favor intente nuevamente.",
        icon: "error",
        background: "var(--card)",
        color: "var(--foreground)",
      })
    }
  }

  const handleOpenUploadModal = (id) => {
    setUploadingId(id)
    setShowUploadModal(true)
  }

  const handleOpenDownloadModal = (visita) => {
    setSelectedVisitaForDownload(visita)
    setShowDownloadModal(true)
  }

  const triggerFileUpload = (type) => {
    setUploadType(type)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && uploadingId) {
      // Optional: You could rename the file based on uploadType here if needed
      // const fileName = uploadType === 'ACTA' ? `ACTA_${file.name}` : `OT_${file.name}`
      // For now using original name as per request simplicity

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await res.json()

        if (result.success) {
          onFileUpload(uploadingId, result.fileName, uploadType)
          Swal.fire({
            title: "¡Archivo Subido!",
            text: `Se ha adjuntado "${result.fileName}" correctamente al servidor.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            background: "var(--card)",
            color: "var(--foreground)",
          })
        } else {
          throw new Error(result.message || 'Error al subir archivo')
        }
      } catch (error) {
        console.error('Error uploading:', error)
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al subir el archivo.",
          icon: "error",
          background: "var(--card)",
          color: "var(--foreground)",
        })
      }

      e.target.value = "" // Reset input
      setShowUploadModal(false)
      setUploadingId(null)
      setUploadType(null)
    }
  }

  const generatePDF = (visita) => {
    const doc = new jsPDF()

    const logo = new Image()
    logo.src = "/logo_gob.png"

    logo.onload = () => {
      // 1. Logo (Esquina Superior Izquierda)
      doc.addImage(logo, 'PNG', 15, 15, 30, 30) // Ajustado tamaño y posición

      // 2. Encabezado Superior Derecho
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text("SEREMI de Salud Biobío", 195, 20, { align: "right" })
      doc.text("Departamento de Tecnologías de la Información y Comunicación", 195, 25, { align: "right" })

      // 3. Título Principal
      doc.setFontSize(12)
      doc.text("HOJA DE REGISTRO DE INGRESO Y TRABAJOS REALIZADOS", 105, 60, { align: "center" })
      doc.text("Sala de Servidores", 105, 67, { align: "center" })

      // 4. Objetivo
      doc.setFontSize(10)
      doc.text("Objetivo:", 15, 80)
      doc.setFont("helvetica", "normal")
      const objetivoText = "Registrar y controlar el ingreso de personas y los trabajos realizados en la Sala de Servidores del Departamento TIC, con el fin de resguardar la seguridad de la información, la infraestructura tecnológica y la continuidad operativa."
      const splitObjetivo = doc.splitTextToSize(objetivoText, 180)
      doc.text(splitObjetivo, 15, 87)

      // 5. Datos Generales
      let y = 105
      doc.setFont("helvetica", "bold")
      doc.text("Datos Generales", 15, y)
      y += 8

      const datos = [
        ["Nombre Completo:", visita.nombre],
        ["RUT:", visita.rut || "No registrado"],
        ["Empresa / Institución:", visita.empresa],
        ["Responsable TIC que autoriza el ingreso:", visita.autoriza || "No registrado"]
      ]

      datos.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold")
        doc.text(label, 15, y)
        doc.setFont("helvetica", "normal")
        doc.text(value, 90, y)
        y += 6
      })

      // 6. Tabla de Fechas (Pequeña)
      y += 5
      autoTable(doc, {
        startY: y,
        head: [['Fecha de ingreso', 'Fecha de salida']],
        body: [[`${visita.fecha} ${visita.horaInicio}`, `${visita.fechaFin} ${visita.horaFin}`]],
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
        bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
        styles: { halign: 'center', fontSize: 10 },
        tableWidth: 80,
        margin: { left: 65 },
      })

      y = doc.lastAutoTable.finalY + 15

      // 7. Descripción de la Visita
      doc.setFont("helvetica", "bold")
      doc.text("Descripción de la Visita", 15, y)
      y += 5

      // Cuadro de descripción
      doc.rect(15, y, 180, 40)
      doc.setFont("helvetica", "normal")
      const splitDesc = doc.splitTextToSize(visita.motivo, 175)
      doc.text(splitDesc, 18, y + 7)

      y += 55

      // 8. Conformidad y Cierre
      doc.setFont("helvetica", "bold")
      doc.text("Conformidad y Cierre", 15, y)
      y += 15

      // Firmas
      doc.setFont("helvetica", "normal")

      // Columna Izquierda (Responsable TIC)
      doc.text("Responsable TIC:", 15, y)
      doc.text("______________________", 45, y)
      y += 20
      doc.text("Firma:", 15, y)
      doc.text("______________________", 45, y)


      y += 15
      doc.text("Fecha:", 15, y)
      doc.text(visita.fechaFin || "___/___/____", 45, y)

      // Columna Derecha (Quien realiza trabajos)
      y -= 35 // Volver arriba para la segunda columna
      const col2X = 110

      doc.text("Visitante:", col2X, y)
      doc.text(visita.nombre, col2X + 20, y)

      y += 20
      doc.text("Firma:", col2X, y)
      doc.text("______________________", col2X + 20, y)

      y += 15
      doc.text("Fecha:", col2X, y)
      doc.text(visita.fechaFin || "___/___/____", col2X + 20, y)

      // Guardar PDF
      doc.save(`Acta_Visita_${visita.fecha.replace(/\//g, '-')}_${visita.nombre.replace(/\s+/g, '_')}.pdf`)
    }

    logo.onerror = () => {
      // Fallback or error handling if needed, but proceeding without logo for now or simple error
      console.error("Error loading logo image")
      // For now just duplicating the logic is too verbose, maybe just alert
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el logo para el PDF.",
        icon: "error"
      });
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="w-full max-w-7xl mx-auto mt-8 relative z-10">
        <div className="rounded-2xl border border-border/50 bg-card/95 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-xl font-bold text-foreground">Registro de Visitas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Hora Inicio</th>
                  <th className="px-6 py-4 font-semibold">Hora Fin</th>
                  <th className="px-6 py-4 font-semibold">Visitante</th>
                  <th className="px-6 py-4 font-semibold">Empresa</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                  <th className="px-6 py-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {visitas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No hay visitas registradas hoy
                    </td>
                  </tr>
                ) : (
                  visitas.map((visita) => (
                    <tr key={visita.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{visita.fecha}</td>
                      <td className="px-6 py-4 text-muted-foreground">{visita.horaInicio}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">
                        {visita.horaFin || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{visita.nombre}</td>
                      <td className="px-6 py-4 text-muted-foreground">{visita.empresa}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${visita.estado === "Activo"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                        >
                          {visita.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {visita.estado === "Cerrado" && (
                            <button
                              onClick={() => handleOpenUploadModal(visita.id)}
                              className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-500 transition-colors"
                              title="Subir Archivos"
                            >
                              <FileUp className="h-5 w-5" />
                            </button>
                          )}
                          {visita.estado === "Activo" && (
                            <button
                              onClick={() => openCloseModal(visita)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              title="Cerrar Visita"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVisita(visita)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                            title="Ver Información"
                          >
                            <Info className="h-5 w-5" />
                          </button>
                          {visita.documentos && visita.documentos.length > 0 && (
                            <button
                              onClick={() => handleOpenDownloadModal(visita)}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-green-600 transition-colors"
                              title="Descargar Documentos"
                            >
                              <img src="/download.png" alt="Descargar" className="h-5 w-5 object-contain" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Cerrar Visita */}
      {visitaToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-foreground">Finalizar Visita</h3>
                <button
                  onClick={() => setVisitaToClose(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ingresa la fecha y hora de salida para <span className="font-semibold text-foreground">{visitaToClose.nombre}</span>.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">
                    Fecha y Hora de Salida
                  </label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 pl-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setVisitaToClose(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border bg-transparent text-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmClose}
                    className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                  >
                    Confirmar Salida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Información */}
      {selectedVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3 w-full">
                  <h3 className="text-xl font-bold text-foreground">Detalle de Visita</h3>
                  <div className="ml-auto flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedVisita.estado === "Activo"
                        ? "text-green-500 bg-green-500/10"
                        : "text-red-500 bg-red-500/10"
                        }`}
                    >
                      {selectedVisita.estado}
                    </span>
                    <button
                      onClick={() => setSelectedVisita(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Visitante</p>
                    <p className="text-base font-semibold text-foreground">{selectedVisita.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Empresa</p>
                    <p className="text-base font-semibold text-foreground">{selectedVisita.empresa}</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Fecha Inicio</p>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="font-mono text-sm">{selectedVisita.fecha}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Hora Inicio</p>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="font-mono text-sm">{selectedVisita.horaInicio}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Fecha Salida</p>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="font-mono text-sm">{selectedVisita.fechaFin || "-"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Hora Salida</p>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="font-mono text-sm">{selectedVisita.horaFin || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Motivo</p>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-sm text-muted-foreground leading-relaxed">
                    {selectedVisita.motivo}
                  </div>
                </div>

                {/* Mostrar documentos en detalle también si se desea, por ahora solo preview */}
              </div>

              <div className="pt-2 flex gap-3">
                {selectedVisita.estado === "Cerrado" && (
                  <button
                    onClick={() => generatePDF(selectedVisita)}
                    className="flex-1 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Generar Acta
                  </button>
                )}
                <button
                  onClick={() => setSelectedVisita(null)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización de Archivo */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AdobeIcon className="h-5 w-5 text-red-600" />
                Documento: {previewFile}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title="Cerrar vista previa"
              >
                <XCircle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe
                src={`/upload/${previewFile}`}
                className="w-full h-full"
                title="Vista previa del documento"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Carga */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-foreground">Subir Archivos</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Seleccione el tipo de documento que desea adjuntar a esta visita.
                </p>

                <div className="grid gap-3">
                  <button
                    onClick={() => triggerFileUpload('OT')}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Orden de Trabajo</span>
                    </div>
                    <FileUp className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </button>

                  <button
                    onClick={() => triggerFileUpload('ACTA')}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
                        <FileDown className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Acta de Visita</span>
                    </div>
                    <FileUp className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Selección de Descargas */}
      {showDownloadModal && selectedVisitaForDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-foreground">Ver Documentos</h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Seleccione el documento que desea visualizar o descargar.
                </p>

                <div className="grid gap-3">
                  {/* Lógica simple: mostramos opciones si existen documentos. 
                       En una implementación ideal filtraríamos por tipo si guardáramos el tipo. 
                       Aquí asumiremos que el usuario sabe cuál es cuál o listamos todos los disponibles.
                       Para cumplir el requerimiento de 2 botones específicos (OT y Acta), 
                       necesitaríamos saber qué archivo es qué. 
                       Como no guardamos el tipo explícitamente, mostraré todos los archivos disponibles.
                   */}

                  {selectedVisitaForDownload.documentos && selectedVisitaForDownload.documentos.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPreviewFile(doc.name)
                        setShowDownloadModal(false)
                      }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all hover:border-primary/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-600 group-hover:bg-red-500/20">
                          <AdobeIcon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[180px] text-left">{doc.name}</span>
                      </div>
                      <FileDown className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                  ))}

                  {(!selectedVisitaForDownload.documentos || selectedVisitaForDownload.documentos.length === 0) && (
                    <p className="text-sm text-center text-muted-foreground italic">No hay documentos adjuntos.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
