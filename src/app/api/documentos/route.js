import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const data = await request.json();

        const documento = await prisma.documento.create({
            data: {
                nombre: data.nombre,
                tipo: data.tipo,
                visitaId: parseInt(data.visitaId),
                url: data.url
            }
        });

        return NextResponse.json(documento);
    } catch (error) {
        console.error('Error creating documento:', error);
        return NextResponse.json({ error: 'Error creating documento' }, { status: 500 });
    }
}
