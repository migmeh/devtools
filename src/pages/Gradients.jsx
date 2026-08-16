import React, { useState, useEffect } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCopy, faSwatchbook, faUndo } from '@fortawesome/free-solid-svg-icons';
import { CheckIcon } from '../components/icons';

import { colord } from 'colord';

const GradientGenerator = () => {
    // Load saved state from localStorage or use defaults
    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem('gradientGenerator');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    type: parsed.type || 'linear',
                    angle: parsed.angle || 90,
                    stops: parsed.stops || [
                        { id: 1, offset: 0, color: 'rgba(59, 130, 246, 1)' },
                        { id: 2, offset: 100, color: 'rgba(139, 92, 246, 0.5)' }
                    ],
                    activeStopId: parsed.activeStopId || 1
                };
            }
        } catch (error) {
            console.warn('Error loading gradient state:', error);
        }
        return {
            type: 'linear',
            angle: 90,
            stops: [
                { id: 1, offset: 0, color: 'rgba(59, 130, 246, 1)' },
                { id: 2, offset: 100, color: 'rgba(139, 92, 246, 0.5)' }
            ],
            activeStopId: 1
        };
    };

    const savedState = loadSavedState();
    const [type, setType] = useState(savedState.type);
    const [angle, setAngle] = useState(savedState.angle);
    const [stops, setStops] = useState(savedState.stops);
    const [activeStopId, setActiveStopId] = useState(savedState.activeStopId);
    const [gradientCSS_Hex, setGradientCSS_Hex] = useState('');
    const [gradientCSS_Rgba, setGradientCSS_Rgba] = useState('');

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            type,
            angle,
            stops,
            activeStopId
        };
        try {
            localStorage.setItem('gradientGenerator', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Error saving gradient state:', error);
        }
    }, [type, angle, stops, activeStopId]);

    // Generate CSS whenever state changes
    useEffect(() => {
        const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

        const stopStringHex = sortedStops.map(s => `${colord(s.color).toHex()} ${s.offset}%`).join(', ');
        const stopStringRgba = sortedStops.map(s => `${s.color} ${s.offset}%`).join(', ');

        if (type === 'linear') {
            setGradientCSS_Hex(`linear-gradient(${angle}deg, ${stopStringHex})`);
            setGradientCSS_Rgba(`linear-gradient(${angle}deg, ${stopStringRgba})`);
        } else {
            setGradientCSS_Hex(`radial-gradient(circle, ${stopStringHex})`);
            setGradientCSS_Rgba(`radial-gradient(circle, ${stopStringRgba})`);
        }
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

    const copyCSS = (text) => {
        navigator.clipboard.writeText(`background: ${text};`);
    };

    const resetGradient = () => {
        const defaultState = {
            type: 'linear',
            angle: 90,
            stops: [
                { id: 1, offset: 0, color: 'rgba(59, 130, 246, 1)' },
                { id: 2, offset: 100, color: 'rgba(139, 92, 246, 0.5)' }
            ],
            activeStopId: 1
        };
        setType(defaultState.type);
        setAngle(defaultState.angle);
        setStops(defaultState.stops);
        setActiveStopId(defaultState.activeStopId);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-pink-500/10 text-pink-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faSwatchbook} />
                </span>
                Gradient Generator
                <button 
                    onClick={resetGradient}
                    className="btn btn-secondary text-sm ml-auto"
                    title="Reset to default gradient"
                >
                    <FontAwesomeIcon icon={faUndo} className="mr-2" /> Reset
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* Left: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="card-title">Settings</h3>
                            <span className="text-xs text-green-400 opacity-75 inline-flex items-center gap-1.5">
                                <CheckIcon className="w-4 h-4" aria-label="Guardado" /> Auto-saved
                            </span>
                        </div>

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
                                <div className="flex gap-2 w-full mt-4">
                                    <input
                                        type="text"
                                        value={activeStop.color}
                                        onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                                        className="input text-center font-mono text-sm w-1/2"
                                    />
                                    <input
                                        type="text"
                                        value={colord(activeStop.color).toHex().replace("#", "0x")}
                                        readOnly
                                        className="input text-center font-mono text-sm w-1/2 bg-slate-800 text-slate-400"
                                        title="HEX (0x)"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Preview & Output */}
                <div className="lg:col-span-8 space-y-6">
                    <div
                        className="w-full h-96 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjkzYiIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjkzYiIvPgo8L3N2Zz4=')]"
                    >
                        <div className="w-full h-full rounded-xl" style={{ background: gradientCSS_Rgba }} />
                    </div>

                    <div className="card bg-slate-900 border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-slate-400">CSS Output (HEX)</h3>
                            <button onClick={() => copyCSS(gradientCSS_Hex)} className="btn btn-secondary text-xs">
                                <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy
                            </button>
                        </div>
                        <code className="block p-4 bg-black/30 rounded-lg text-green-400 font-mono text-sm break-all mb-4">
                            background: {gradientCSS_Hex};
                        </code>

                        <div className="flex justify-between items-center mb-2 pt-4 border-t border-slate-700">
                            <h3 className="text-sm font-medium text-slate-400">CSS Output (RGBA)</h3>
                            <button onClick={() => copyCSS(gradientCSS_Rgba)} className="btn btn-secondary text-xs">
                                <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy
                            </button>
                        </div>
                        <code className="block p-4 bg-black/30 rounded-lg text-blue-400 font-mono text-sm break-all">
                            background: {gradientCSS_Rgba};
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientGenerator;
