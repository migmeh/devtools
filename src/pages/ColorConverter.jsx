import React, { useState, useEffect } from 'react';
import { CheckIcon } from '../components/icons';
import { HexColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

extend([cmykPlugin, namesPlugin]);

const ColorInput = ({ label, value, onChange, onCopy, onAddToHistory, showAddButton = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) onCopy();
    };

    const handleAddToHistory = () => {
        if (onAddToHistory) {
            onAddToHistory(value);
        }
    };

    return (
        <div className="mb-4">
            <label className="label">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="input font-mono"
                />
                <button
                    onClick={handleCopy}
                    className="btn btn-secondary px-3"
                    title="Copy to clipboard"
                >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-500" : ""} />
                </button>
                {showAddButton && (
                    <button
                        onClick={handleAddToHistory}
                        className="btn btn-primary px-3"
                        title="Add to history"
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
};

const ColorConverter = () => {
    // Load saved state from localStorage
    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem('colorConverter');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    color: parsed.color || "#3b82f6",
                    colorHistory: parsed.colorHistory || [],
                    lastModified: parsed.lastModified || null
                };
            }
        } catch (error) {
            console.warn('Error loading color converter state:', error);
        }
        return {
            color: "#3b82f6",
            colorHistory: [],
            lastModified: null
        };
    };

    const savedState = loadSavedState();
    const [color, setColor] = useState(savedState.color);
    const [colorHistory, setColorHistory] = useState(savedState.colorHistory);
    const [hex, setHex] = useState(savedState.color);
    const [hex0x, setHex0x] = useState(savedState.color.replace("#", "0x"));
    const [rgb, setRgb] = useState("");
    const [hsl, setHsl] = useState("");
    const [cmyk, setCmyk] = useState("");
    const [name, setName] = useState("");
    const [lastSaved, setLastSaved] = useState(savedState.lastModified);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            color,
            colorHistory,
            lastModified: new Date().toISOString()
        };
        try {
            localStorage.setItem('colorConverter', JSON.stringify(stateToSave));
            setLastSaved(stateToSave.lastModified);
        } catch (error) {
            console.warn('Error saving color converter state:', error);
        }
    }, [color, colorHistory]);

    // Add color to history only when explicitly added (not on every change)
    const addToHistory = (colorToAdd) => {
        if (colorToAdd && colord(colorToAdd).isValid()) {
            setColorHistory(prev => {
                // Don't add if it's the same as the last entry
                if (prev.length > 0 && prev[0].hex === colorToAdd) {
                    return prev;
                }
                // Add new entry and keep last 15 colors
                const c = colord(colorToAdd);
                const newEntry = {
                    hex: colorToAdd,
                    rgb: c.toRgbString(),
                    hsl: c.toHslString(),
                    name: c.toName({ closest: true }) || "Unknown",
                    timestamp: new Date().toISOString()
                };
                return [newEntry, ...prev].slice(0, 15);
            });
        }
    };

    const updateColorValues = (newColor) => {
        const c = colord(newColor);
        if (c.isValid()) {
            const newHex = c.toHex();
            setHex(newHex);
            setHex0x(newHex.replace("#", "0x"));
            setRgb(c.toRgbString());
            setHsl(c.toHslString());
            setCmyk(c.toCmykString());
            setName(c.toName({ closest: true }) || "Unknown");
        }
    };

    useEffect(() => {
        updateColorValues(color);
    }, [color]);

    const handleHexChange = (val) => {
        setHex(val);
        if (colord(val).isValid()) {
            setColor(val);
        }
    };

    const loadFromHistory = (historyColor) => {
        setColor(historyColor.hex);
    };

    const clearHistory = () => {
        setColorHistory([]);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    // Helper to sync from other inputs could be added here
    // For simplicity, we drive mostly from the picker or valid hex input

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon="palette" />
                </span>
                Color Converter
                {lastSaved && (
                    <span className="text-xs text-green-400 opacity-75 ml-auto inline-flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4" aria-label="Guardado" /> Auto-saved {formatDate(lastSaved)}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Picker */}
                <div className="lg:col-span-4 card flex flex-col items-center">
                    <div className="mb-6 w-full max-w-[300px]">
                        <style>{`
              .react-colorful { width: 100%; height: 250px; border-radius: 12px; border: 2px solid #334155; }
              .react-colorful__pointer { width: 24px; height: 24px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            `}</style>
                        <HexColorPicker color={color} onChange={setColor} />
                    </div>

                    <div className="w-full mt-4">
                        <div
                            className="h-24 rounded-xl shadow-inner flex items-center justify-center border border-slate-200 mb-4"
                            style={{ backgroundColor: color }}
                        >
                            <span className="bg-white/80 backdrop-blur-md px-4 py-1 rounded-full text-slate-900 font-mono shadow-sm border border-white/20">
                                {name}
                            </span>
                        </div>
                        <button
                            onClick={() => addToHistory(color)}
                            className="btn btn-primary w-full"
                            title="Add current color to history"
                        >
                            Add to History
                        </button>
                    </div>
                </div>

                {/* Right Column: Values */}
                <div className="lg:col-span-5 card">
                    <h3 className="card-title mb-4">Color Values</h3>

                    <ColorInput
                        label="HEX"
                        value={hex}
                        onChange={handleHexChange}
                        onAddToHistory={addToHistory}
                        showAddButton={true}
                    />
                    <ColorInput
                        label="HEX (0x)"
                        value={hex0x}
                        onChange={() => { }} // Read-only
                    />
                    <ColorInput
                        label="RGB"
                        value={rgb}
                        onChange={() => { }} // Read-only for now or add parsing
                    />
                    <ColorInput
                        label="HSL"
                        value={hsl}
                        onChange={() => { }}
                    />
                    <ColorInput
                        label="CMYK"
                        value={cmyk}
                        onChange={() => { }}
                    />

                    <div className="mt-6 p-4 bg-black/30 rounded-lg border border-white/10">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">CSS Snippet</h4>
                        <code className="text-emerald-400 font-mono text-sm block">
                            color: {hex};
                        </code>
                        <code className="text-emerald-400 font-mono text-sm block">
                            background-color: {rgb};
                        </code>
                    </div>
                </div>

                {/* History Column */}
                <div className="lg:col-span-3 card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="card-title">Color History</h3>
                        {colorHistory.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="btn btn-secondary text-xs py-1"
                                title="Clear History"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {colorHistory.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p className="text-sm">No colors yet</p>
                                <p className="text-xs mt-1">Colors will appear here</p>
                            </div>
                        ) : (
                            colorHistory.map((historyColor, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer transition-colors"
                                    onClick={() => loadFromHistory(historyColor)}
                                    title="Click to load this color"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-8 h-8 rounded border border-slate-600 flex-shrink-0"
                                            style={{ backgroundColor: historyColor.hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-sm text-white truncate">
                                                {historyColor.hex}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">
                                                {historyColor.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono space-y-1">
                                        <div className="truncate">{historyColor.rgb}</div>
                                        <div className="truncate">{historyColor.hsl}</div>
                                    </div>
                                    <div className="text-xs text-slate-600 mt-2">
                                        {formatDate(historyColor.timestamp)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorConverter;
