import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faCopy, faUndo } from '@fortawesome/free-solid-svg-icons';
import { HexColorPicker } from 'react-colorful';

const Slider = ({ label, value, min, max, onChange, unit = 'px' }) => (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-slate-400">{label}</label>
            <span className="text-xs font-mono text-slate-300">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const Shadows = () => {
    const [offsetX, setOffsetX] = useState(10);
    const [offsetY, setOffsetY] = useState(10);
    const [blur, setBlur] = useState(20);
    const [spread, setSpread] = useState(5);
    const [opacity, setOpacity] = useState(0.5);
    const [color, setColor] = useState("#000000");
    const [inset, setInset] = useState(false);

    // Helper to convert hex to rgba
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
    const shadowValue = `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

    const copyCSS = () => {
        navigator.clipboard.writeText(`box-shadow: ${shadowValue};`);
    };

    const reset = () => {
        setOffsetX(10); setOffsetY(10); setBlur(20); setSpread(5); setOpacity(0.5); setColor('#000000'); setInset(false);
    }

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-cyan-500/10 text-cyan-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faImage} />
                </span>
                Shadow Generator
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="card-title">Configuration</h3>
                            <button onClick={reset} className="text-xs text-slate-500 hover:text-white">
                                <FontAwesomeIcon icon={faUndo} /> Reset
                            </button>
                        </div>

                        <Slider label="Horizontal Offset" value={offsetX} min={-100} max={100} onChange={setOffsetX} />
                        <Slider label="Vertical Offset" value={offsetY} min={-100} max={100} onChange={setOffsetY} />
                        <Slider label="Blur Radius" value={blur} min={0} max={100} onChange={setBlur} />
                        <Slider label="Spread Radius" value={spread} min={-50} max={100} onChange={setSpread} />

                        <Slider label="Opacity" value={opacity} min={0} max={1} onChange={setOpacity} unit="" />

                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={inset}
                                    onChange={(e) => setInset(e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-300">Inset Shadow</span>
                            </label>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title mb-4">Shadow Color</h3>
                        <div className="flex flex-col items-center">
                            <style>{`.react-colorful { width: 100%; height: 150px; border-radius: 8px; }`}</style>
                            <HexColorPicker color={color} onChange={setColor} />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="h-96 bg-white rounded-xl flex items-center justify-center p-12 overflow-hidden border border-slate-700/50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YxZjVZjkiPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWY1ZjkiPjwvcmVjdD4KPC9zdmc+')]">
                        <div
                            className="w-48 h-48 bg-blue-500 rounded-2xl transition-all duration-200"
                            style={{ boxShadow: shadowValue }}
                        />
                    </div>

                    <div className="card bg-slate-900 border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-slate-400">CSS Output</h3>
                            <button onClick={copyCSS} className="btn btn-secondary text-xs">
                                <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy
                            </button>
                        </div>
                        <code className="block p-4 bg-black/30 rounded-lg text-green-400 font-mono text-sm break-all">
                            box-shadow: {shadowValue};
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shadows;
