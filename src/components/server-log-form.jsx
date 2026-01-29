"use client"

import { useState, useRef } from "react"
import { Server, Clock, Building2, User, FileText, CheckCircle2, CreditCard, UserCheck, Keyboard } from "lucide-react"
import TecladoVirtual from "@/components/teclado-virtual"

const Card = ({ className, children }) => <div className={className}>{children}</div>
const CardHeader = ({ className, children }) => <div className={className}>{children}</div>
const CardContent = ({ className, children }) => <div className={className}>{children}</div>
const CardTitle = ({ className, children }) => <h2 className={className}>{children}</h2>
const CardDescription = ({ className, children }) => <p className={className}>{children}</p>
const Input = (props) => <input {...props} />
const Label = (props) => <label {...props} />
const Textarea = (props) => <textarea {...props} />
const Button = (props) => <button {...props} />
const Select = (props) => <select {...props} />

export function ServerLogForm({ onVisitRegistered }) {
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    empresa: "",
    autoriza: "",
    horaInicio: "",
    motivo: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [showKeyboard, setShowKeyboard] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onVisitRegistered) {
      const result = await onVisitRegistered(formData)
      if (result === false) return
    }
    setSubmitted(true)
    setShowKeyboard(false)

    // Resetear formulario después de 4 segundos
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        rut: "",
        nombre: "",
        empresa: "",
        autoriza: "",
        horaInicio: "",
        motivo: "",
      })
      setActiveField(null)
    }, 4000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFieldFocus = (fieldName) => {
    setActiveField(fieldName)
    setShowKeyboard(true)
  }

  const handleVirtualKeyPress = (key) => {
    if (!activeField) return
    setFormData(prev => ({
      ...prev,
      [activeField]: prev[activeField] + key
    }))
  }

  const handleVirtualBackspace = () => {
    if (!activeField) return
    setFormData(prev => ({
      ...prev,
      [activeField]: prev[activeField].slice(0, -1)
    }))
  }

  const handleVirtualSpace = () => {
    if (!activeField) return
    setFormData(prev => ({
      ...prev,
      [activeField]: prev[activeField] + " "
    }))
  }

  return (
    <Card className="w-full max-w-5xl relative z-10 border border-border/50 shadow-xl bg-card/95 rounded-2xl">
      <div className="lg:grid lg:grid-cols-12">
        <div className="relative hidden lg:block lg:col-span-5 bg-secondary/15 border-r border-border/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124, 156, 64, 0.93),transparent_60%)]" />
          <img src="/ilustracion.jpeg" alt="Ilustración acceso a sala de servidores" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 w-full h-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/60" />
        </div>
        <div className="lg:col-span-7">
          <CardHeader className="space-y-1 py-5 border-b border-border/50 px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 ring-2 ring-primary/20">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">{"Bitácora de Acceso"}</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">{"Registro de ingreso a sala de servidores"}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-5 px-6 lg:px-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-accent/20 p-4 ring-4 ring-accent/30">
                  <CheckCircle2 className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{"¡Registro Exitoso!"}</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {"Tu ingreso ha sido registrado correctamente en el sistema"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de Información Personal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      {"Identificacion del Visitante"}
                    </h3>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className={`space-y-2 ${(activeField === "rut" || activeField === "nombre") ? "relative z-50" : ""}`}>
                      <Label htmlFor="rut" className="text-foreground font-medium">
                        {"RUT"}
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="rut"
                          name="rut"
                          placeholder="Ej: 12.345.678-9"
                          value={formData.rut}
                          onChange={handleChange}
                          onFocus={() => handleFieldFocus("rut")}
                          required
                          className="bg-input border-border focus:outline-none focus:ring-2 focus:ring-primary/20 pl-10 pr-4 h-10 rounded-xl transition w-full"
                        />
                      </div>
                      {showKeyboard && (activeField === "rut" || activeField === "nombre") && (
                        <div className="top-full left-0 z-50 w-[90vw] md:w-[calc(200%+2rem)] animate-in slide-in-from-top-2 fade-in duration-200 shadow-2xl rounded-lg">
                          <TecladoVirtual
                            onKeyPress={handleVirtualKeyPress}
                            onBackspace={handleVirtualBackspace}
                            onSpace={handleVirtualSpace}
                            onClose={() => setShowKeyboard(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-foreground font-medium">
                        {"Nombre Visitante"}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nombre"
                          name="nombre"
                          placeholder="Ej: Juan Pérez García"
                          value={formData.nombre}
                          onChange={handleChange}
                          onFocus={() => handleFieldFocus("nombre")}
                          required
                          className="bg-input border-border focus:outline-none focus:ring-2 focus:ring-primary/20 pl-10 pr-4 h-10 rounded-xl transition"
                        />
                      </div>

                    </div>

                    <div className={`space-y-2 ${activeField === "empresa" ? "relative z-50" : ""}`}>
                      <Label htmlFor="empresa" className="text-foreground font-medium">
                        {"Empresa"}
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="empresa"
                          name="empresa"
                          placeholder="Ej: SharshaSoft"
                          value={formData.empresa}
                          onChange={handleChange}
                          onFocus={() => handleFieldFocus("empresa")}
                          required
                          className="bg-input border-border focus:outline-none focus:ring-2 focus:ring-primary/20 pl-10 pr-4 h-10 rounded-xl transition"
                        />
                      </div>
                      {showKeyboard && activeField === "empresa" && (
                        <div className="top-full left-0 z-50 w-[90vw] md:w-[calc(200%+2rem)] animate-in slide-in-from-top-2 fade-in duration-200 shadow-2xl rounded-lg">
                          <TecladoVirtual
                            onKeyPress={handleVirtualKeyPress}
                            onBackspace={handleVirtualBackspace}
                            onSpace={handleVirtualSpace}
                            onClose={() => setShowKeyboard(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autoriza" className="text-foreground font-medium">
                        {"Autoriza Ingreso"}
                      </Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select
                          id="autoriza"
                          name="autoriza"
                          value={formData.autoriza}
                          onChange={handleChange}
                          required
                          className="bg-input border-border focus:outline-none focus:ring-2 focus:ring-primary/20 pl-10 pr-4 h-10 rounded-xl transition w-full appearance-none"
                        >
                          <option value="" disabled>Seleccione autorizador</option>
                          <option value="Alvaro Salgado">Alvaro Salgado</option>
                          <option value="Ricardo Sanhueza">Ricardo Sanhueza</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de Horario */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      {"Control de Tiempo"}
                    </h3>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio" className="text-foreground font-medium">
                        {"Fecha y Hora de Inicio"}
                      </Label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />

                        <Input
                          id="horaInicio"
                          name="horaInicio"
                          type="datetime-local"
                          value={formData.horaInicio}
                          onChange={handleChange}
                          required
                          className="w-full bg-input border-border focus:outline-none focus:ring-2 focus:ring-accent/20 pl-10 pr-4 h-10 rounded-xl transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de Motivo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <FileText className="h-4 w-4 text-chart-3" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{"Motivo de Visita"}</h3>
                  </div>

                  <div>
                    <Label htmlFor="motivo" className="text-foreground font-medium">
                      {"Descripción del Motivo"}
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="motivo"
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("motivo")}
                        required
                        rows={4}
                        className="w-full bg-input border-border focus:outline-none focus:ring-2 focus:ring-chart-3/20 resize-none pl-4 pr-4 rounded-xl transition"
                      />
                    </div>
                    {showKeyboard && activeField === "motivo" && (
                      <div className="top-full left-0 z-50 w-[550px] animate-in slide-in-from-top-2 fade-in duration-200 shadow-2xl rounded-lg">
                        <TecladoVirtual
                          onKeyPress={handleVirtualKeyPress}
                          onBackspace={handleVirtualBackspace}
                          onSpace={handleVirtualSpace}
                          onClose={() => setShowKeyboard(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Submit */}
                {/* Botón de Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-xl inline-flex items-center justify-center gap-2"
                  >
                    <Server className="h-5 w-5" />
                    {"Registrar Ingreso"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2 mb-4">
                  Departamento TIC
                </p>
              </form>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
