import React, { useState, useEffect } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCopy, faSwatchbook, faUndo } from '@fortawesome/free-solid-svg-icons';

const GradientGenerator = () => {
    const [type, setType] = useState('linear');
    const [angle, setAngle] = useState(90);
    const [stops, setStops] = useState([
        { id: 1, offset: 0, color: 'rgba(59, 130, 246, 1)' },
        { id: 2, offset: 100, color: 'rgba(139, 92, 246, 0.5)' }
    ]);
    const [activeStopId, setActiveStopId] = useState(1);
    const [gradientCSS, setGradientCSS] = useState('');

    // Generate CSS whenever state changes
    useEffect(() => {
        const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
        const stopString = sortedStops.map(s => `${s.color} ${s.offset}%`).join(', ');

        let css = '';
        if (type === 'linear') {
            css = `linear-gradient(${angle}deg, ${stopString})`;
        } else {
            css = `radial-gradient(circle, ${stopString})`;
        }
        setGradientCSS(css);
    }, [type, angle, stops]);

    const addStop = () => {
        const newId = Math.max(...stops.map(s => s.id)) + 1;
        setStops([...stops, { id: newId, offset: 50, color: 'rgba(255, 255, 255, 1)' }]);
        setActiveStopId(newId);
    };

    const removeStop = (id) => {
        if (stops.length <= 2) return; // Minimum 2 stops
        const newStops = stops.filter(s => s.id !== id);
        setStops(newStops);
        if (activeStopId === id) setActiveStopId(newStops[0].id);
    };

    const updateStop = (id, updates) => {
        setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const activeStop = stops.find(s => s.id === activeStopId);

    const copyCSS = () => {
        navigator.clipboard.writeText(`background: ${gradientCSS};`);
        // Toast or indication could go here
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-pink-500/10 text-pink-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faSwatchbook} />
                </span>
                Gradient Generator
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* Left: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card">
                        <h3 className="card-title mb-4">Settings</h3>

                        <div className="mb-4">
                            <label className="label">Type</label>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                <button
                                    onClick={() => setType('linear')}
                                    className={`flex-1 py-1 rounded-md text-sm transition-colors ${type === 'linear' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Linear
                                </button>
                                <button
                                    onClick={() => setType('radial')}
                                    className={`flex-1 py-1 rounded-md text-sm transition-colors ${type === 'radial' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Radial
                                </button>
                            </div>
                        </div>

                        {type === 'linear' && (
                            <div className="mb-4">
                                <label className="label">Angle: {angle}°</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={angle}
                                    onChange={(e) => setAngle(Number(e.target.value))}
                                    className="w-full accent-primary"
                                />
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="card-title">Color Stops</h3>
                            <button onClick={addStop} className="btn btn-secondary text-xs px-2 py-1">
                                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {stops.map((stop) => (
                                <div
                                    key={stop.id}
                                    onClick={() => setActiveStopId(stop.id)}
                                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${activeStopId === stop.id ? 'border-primary bg-primary/10' : 'border-slate-700 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded border border-slate-600 shadow-sm relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzMzNDE1NSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzMzNDE1NSIvPgo8L3N2Zz4=')]">
                                        <div
                                            className="absolute inset-0"
                                            style={{ backgroundColor: stop.color }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-400 block">Position</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={stop.offset}
                                            onChange={(e) => updateStop(stop.id, { offset: Number(e.target.value) })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full h-1 accent-slate-400"
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-slate-300 w-8 text-right">{stop.offset}%</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeStop(stop.id); }}
                                        className="text-slate-500 hover:text-red-400 px-2"
                                        disabled={stops.length <= 2}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title mb-4">Pick Color ({activeStop ? activeStop.offset : 0}%)</h3>
                        {activeStop && (
                            <div className="flex flex-col items-center">
                                <style>{`.react-colorful { width: 100%; height: 200px; border-radius: 8px; }`}</style>
                                <RgbaStringColorPicker
                                    color={activeStop.color}
                                    onChange={(c) => updateStop(activeStop.id, { color: c })}
                                />
                                <input
                                    type="text"
                                    value={activeStop.color}
                                    onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                                    className="input mt-4 text-center font-mono text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Preview & Output */}
                <div className="lg:col-span-8 space-y-6">
                    <div
                        className="w-full h-96 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjkzYiIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjkzYiIvPgo8L3N2Zz4=')]"
                    >
                        <div className="w-full h-full rounded-xl" style={{ background: gradientCSS }} />
                    </div>

                    <div className="card bg-slate-900 border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-slate-400">CSS Output</h3>
                            <button onClick={copyCSS} className="btn btn-secondary text-xs">
                                <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy
                            </button>
                        </div>
                        <code className="block p-4 bg-black/30 rounded-lg text-green-400 font-mono text-sm break-all">
                            background: {gradientCSS};
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientGenerator;
