import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request) {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
        return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the upload path
    const uploadDir = path.join(process.cwd(), 'public/upload');
    const filePath = path.join(uploadDir, file.name);

    try {
        await writeFile(filePath, buffer);
        return NextResponse.json({ success: true, fileName: file.name });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
