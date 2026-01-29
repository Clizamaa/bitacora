import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const data = await request.json();

        // Convertir id a numero
        const visitaId = parseInt(id);

        const updatedVisita = await prisma.visita.update({
            where: {
                id: visitaId
            },
            data: {
                estado: 'Cerrado',
                fechaFin: data.fechaFin,
                horaFin: data.horaFin
            }
        });

        return NextResponse.json(updatedVisita);
    } catch (error) {
        console.error('Error updating visita:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
