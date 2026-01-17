import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

extend([cmykPlugin, namesPlugin]);

const ColorInput = ({ label, value, onChange, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) onCopy();
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
            </div>
        </div>
    );
};

const ColorConverter = () => {
    const [color, setColor] = useState("#3b82f6");
    const [hex, setHex] = useState(color);
    const [rgb, setRgb] = useState("");
    const [hsl, setHsl] = useState("");
    const [cmyk, setCmyk] = useState("");
    const [name, setName] = useState("");

    const updateColorValues = (newColor) => {
        const c = colord(newColor);
        if (c.isValid()) {
            setHex(c.toHex());
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

    // Helper to sync from other inputs could be added here
    // For simplicity, we drive mostly from the picker or valid hex input

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon="palette" />
                </span>
                Color Converter
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Picker */}
                <div className="card flex flex-col items-center">
                    <div className="mb-6 w-full max-w-[300px]">
                        <style>{`
              .react-colorful { width: 100%; height: 250px; border-radius: 12px; border: 2px solid #334155; }
              .react-colorful__pointer { width: 24px; height: 24px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            `}</style>
                        <HexColorPicker color={color} onChange={setColor} />
                    </div>

                    <div className="w-full mt-4">
                        <div
                            className="h-24 rounded-xl shadow-inner flex items-center justify-center border border-slate-700"
                            style={{ backgroundColor: color }}
                        >
                            <span className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full text-white font-mono shadow-sm border border-white/10">
                                {name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Values */}
                <div className="card">
                    <h3 className="card-title mb-4">Color Values</h3>

                    <ColorInput
                        label="HEX"
                        value={hex}
                        onChange={handleHexChange}
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

                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700/50">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">CSS Snippet</h4>
                        <code className="text-green-400 font-mono text-sm block">
                            color: {hex};
                        </code>
                        <code className="text-green-400 font-mono text-sm block">
                            background-color: {rgb};
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorConverter;
