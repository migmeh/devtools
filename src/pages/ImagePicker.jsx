import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { colord } from 'colord';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faEyeDropper, faTimes } from '@fortawesome/free-solid-svg-icons';

const ImagePicker = () => {
    const [image, setImage] = useState(null);
    const [color, setColor] = useState(null);
    const [magnifierPosition, setMagnifierPosition] = useState(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setColor(null);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Calculate aspect ratio to fit container
            const containerWidth = containerRef.current.clientWidth;
            const scale = Math.min(containerWidth / image.width, 1);

            canvas.width = image.width * scale;
            canvas.height = image.height * scale;

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
    }, [image]);

    const pickColor = (e) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = colord({ r: pixel[0], g: pixel[1], b: pixel[2] }).toHex();

        setColor(hex);
    };

    const handleMouseMove = (e) => {
        if (!canvasRef.current) return;
        // Future enhancement: Add magnifier logic here
    };

    const resetImage = () => {
        setImage(null);
        setColor(null);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faEyeDropper} />
                </span>
                Image Color Picker
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {!image ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl h-96 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-primary/50 hover:bg-slate-800/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-slate-500 mb-4" />
                            <p className="text-slate-300 font-medium">Drag & drop an image here</p>
                            <p className="text-slate-500 text-sm mt-2">or click to select file</p>
                        </div>
                    ) : (
                        <div className="relative group" ref={containerRef}>
                            <canvas
                                ref={canvasRef}
                                onClick={pickColor}
                                onMouseMove={handleMouseMove}
                                className="rounded-xl shadow-lg cursor-crosshair max-w-full"
                            />
                            <button
                                onClick={resetImage}
                                className="absolute top-2 right-2 bg-slate-900/80 text-white p-2 rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h3 className="card-title mb-4">Selected Color</h3>
                        {color ? (
                            <div className="space-y-4">
                                <div
                                    className="h-24 rounded-lg shadow-inner border border-slate-700 w-full"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <span className="text-slate-400 font-mono">HEX</span>
                                        <span className="font-mono text-white select-all">{color}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <span className="text-slate-400 font-mono">RGB</span>
                                        <span className="font-mono text-white select-all">
                                            {colord(color).toRgbString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>Click on the image to pick a color</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagePicker;
