"use client"

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageWidth, setPageWidth] = useState(600);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    useEffect(() => {
        function handleResize() {
            setPageWidth(window.innerWidth > 768 ? 600 : window.innerWidth - 64);
        }

        // Set initial
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col items-center w-full h-full overflow-y-auto p-4 bg-gray-100">
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="shadow-lg max-w-full"
                loading={
                    <div className="flex items-center justify-center p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                }
                error={
                    <div className="flex flex-col items-center justify-center gap-4 text-center p-6 text-red-500 bg-red-50 rounded-lg">
                        <p>No se pudo visualizar el PDF aquí.</p>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            Abrir en pestaña nueva
                        </a>
                    </div>
                }
            >
                <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white"
                    width={pageWidth}
                />
            </Document>

            {numPages && numPages > 1 && (
                <div className="flex items-center gap-4 mt-4 bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm sticky bottom-4 z-10">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(p => p - 1)}
                        className="px-3 py-1 rounded-full hover:bg-muted disabled:opacity-50 transition-colors text-sm font-medium text-foreground"
                    >
                        Anterior
                    </button>
                    <span className="text-sm font-medium text-foreground">
                        {pageNumber} / {numPages}
                    </span>
                    <button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(p => p + 1)}
                        className="px-3 py-1 rounded-full hover:bg-muted disabled:opacity-50 transition-colors text-sm font-medium text-foreground"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
