import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const visitas = await prisma.visita.findMany({
            include: {
                documentos: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(visitas);
    } catch (error) {
        console.error('Error fetching visitas:', error);
        return NextResponse.json({ error: 'Error fetching visitas' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validar datos mínimos si es necesario

        const visita = await prisma.visita.create({
            data: {
                rut: data.rut,
                nombre: data.nombre,
                empresa: data.empresa,
                autoriza: data.autoriza,
                horaInicio: data.horaInicio,
                motivo: data.motivo,
                fecha: data.fecha || new Date().toLocaleDateString('es-ES'),
                estado: 'Activo'
            }
        });

        return NextResponse.json(visita);
    } catch (error) {
        console.error('Error creating visita:', error);
        return NextResponse.json({ error: 'Error creating visita', details: error.message }, { status: 500 });
    }
}
