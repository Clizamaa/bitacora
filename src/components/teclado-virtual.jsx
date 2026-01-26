"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Button = ({ className, variant, size, children, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
    };

    const variantStyles = variants[variant] || variants.default;
    const sizeStyles = sizes[size] || sizes.default;

    return (
        <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`} {...props}>
            {children}
        </button>
    );
};

const TecladoVirtual = ({ onKeyPress, onBackspace, onSpace, onClose }) => {

    const letters = [
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ',
        'Z', 'X', 'C', 'V', 'B', 'N', 'M'
    ];

    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    // Manejar teclas del teclado físico cuando el teclado virtual está abierto
    useEffect(() => {
        const handleKeyDown = (event) => {
            // No prevenir default para permitir navegación normal si no es una tecla que manejamos
            // Pero si queremos que el teclado virtual tenga prioridad, podemos hacerlo.
            // En este caso, solo escuchamos para replicar la acción si es necesario o simplemente ignoramos 
            // y dejamos que el input maneje el evento nativo si está focado.

            // Sin embargo, si el foco no está en el input (ej. tocando botones), esto podría ser útil.
            // Modificamos ligeramente para no interferir con el input real si ya tiene foco.
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

            if (event.key === 'Escape') {
                onClose && onClose();
            } else if (event.key === 'Backspace') {
                onBackspace && onBackspace();
            } else if (event.key === ' ') {
                onSpace && onSpace();
            } else if (event.key.length === 1 && /^[a-zA-Z0-9ñÑ]$/.test(event.key)) {
                onKeyPress && onKeyPress(event.key.toUpperCase());
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onKeyPress, onBackspace, onSpace, onClose]);

    return (
        <div className="bg-card rounded-lg border shadow-lg p-4 mt-2 w-full z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Teclado Virtual</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="hover:bg-red-50 hover:border-red-300"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-3">
                {/* Números */}
                <div className="flex justify-center gap-1 flex-wrap">
                    {numbers.map((num) => (
                        <Button
                            key={num}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onKeyPress(num)}
                            className="w-10 h-10 text-sm font-medium"
                        >
                            {num}
                        </Button>
                    ))}
                </div>

                {/* Primera fila de letras */}
                <div className="flex justify-center gap-1 flex-wrap">
                    {letters.slice(0, 10).map((letter) => (
                        <Button
                            key={letter}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onKeyPress(letter)}
                            className="w-10 h-10 text-sm font-medium"
                        >
                            {letter}
                        </Button>
                    ))}
                </div>

                {/* Segunda fila de letras */}
                <div className="flex justify-center gap-1 flex-wrap">
                    {letters.slice(10, 20).map((letter) => (
                        <Button
                            key={letter}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onKeyPress(letter)}
                            className="w-10 h-10 text-sm font-medium"
                        >
                            {letter}
                        </Button>
                    ))}
                </div>

                {/* Tercera fila de letras */}
                <div className="flex justify-center gap-1 flex-wrap">
                    {letters.slice(20).map((letter) => (
                        <Button
                            key={letter}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onKeyPress(letter)}
                            className="w-10 h-10 text-sm font-medium"
                        >
                            {letter}
                        </Button>
                    ))}
                </div>

                {/* Controles */}
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onSpace}
                        className="px-8 h-10 text-sm font-medium"
                    >
                        Espacio
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onBackspace}
                        className="px-6 h-10 text-sm font-medium"
                    >
                        Borrar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="px-6 h-10 text-sm font-medium"
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TecladoVirtual;
