import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("Missing Cloudinary Configuration");
            return NextResponse.json({ success: false, message: "Server configuration error: Missing Environment Variables" }, { status: 500 });
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        const resourceType = isPdf ? 'raw' : 'auto';

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: "bitacora_visitas",
                    use_filename: true,
                    unique_filename: true,
                    filename_override: file.name
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        resolve(NextResponse.json({ success: false, message: error.message }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json({
                            success: true,
                            fileName: file.name,
                            url: result.secure_url
                        }));
                    }
                }
            );
            // Write buffer to stream
            const Readable = require('stream').Readable;
            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(uploadStream);
        });
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ success: false, message: "Internal Server Error: " + error.message }, { status: 500 });
    }
}
