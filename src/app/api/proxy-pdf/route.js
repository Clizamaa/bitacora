import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch file: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'application/pdf';

        // Create a new response with the body stream
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'application/pdf', // Force PDF content type
                'Content-Disposition': 'inline',   // View in browser, don't download
                'Cache-Control': 'public, max-age=3600'
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
