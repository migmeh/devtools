import React, { useState, useEffect } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

extend([harmoniesPlugin]);

const Swatch = ({ color, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(color);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="group relative h-24 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex flex-col justify-end p-3 overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2MzYzVjNyIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2MzYzVjNyIvPgo8L3N2Zz4=')]"
            onClick={handleCopy}
        >
            <div
                className="absolute inset-0"
                style={{ backgroundColor: color }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1 z-10">
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-white text-xs" />
            </div>
            <span className="relative z-10 bg-black/40 backdrop-blur-md self-start px-2 py-1 rounded text-xs font-mono text-white/90 border border-white/10 break-all">
                {color}
            </span>
            {label && <span className="relative z-10 text-xs text-white/70 mt-1 uppercase font-semibold tracking-wider text-shadow-sm">{label}</span>}
        </div>
    );
};

const PaletteDisplay = ({ title, colors }) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {colors.map((c, i) => (
                <Swatch key={i} color={typeof c === 'string' ? c : c.toRgbString()} />
            ))}
        </div>
    </div>
);

const Palettes = () => {
    const [color, setColor] = useState("rgba(59, 130, 246, 1)");
    const [harmonies, setHarmonies] = useState({
        complementary: [],
        analogous: [],
        triadic: [],
        tetradic: [],
        monochromatic: []
    });

    useEffect(() => {
        const c = colord(color);
        // Note: colord harmonies() returns array of Colord objects. 
        // They inherit the alpha of the base color by default logic of colord usually.
        // If not, we might need to manually apply it. 
        // Testing reveals colord harmonies *do* respect alpha.

        setHarmonies({
            complementary: c.harmonies("complementary"),
            analogous: c.harmonies("analogous"),
            triadic: c.harmonies("triadic"),
            tetradic: c.harmonies("tetradic"),
            monochromatic: [
                c,
                c.lighten(0.1),
                c.lighten(0.2),
                c.darken(0.1),
                c.darken(0.2)
            ]
        });
    }, [color]);

    return (
        <div className="page-container animate-fade-in">
            <div className="section-title">
                <span className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faLayerGroup} />
                </span>
                Palette Generator
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Picker */}
                <div className="lg:col-span-4">
                    <div className="card sticky top-24">
                        <h3 className="card-title mb-4">Base Color</h3>
                        <div className="flex flex-col items-center">
                            <style>{`.react-colorful { width: 100%; height: 250px; border-radius: 12px; }`}</style>
                            <RgbaStringColorPicker color={color} onChange={setColor} />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="input mt-4 text-center font-mono text-sm"
                            />
                        </div>
                        <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-2">Alpha Channel Supported</p>
                            <div
                                className="h-12 w-full rounded lg border border-slate-600 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzMzNDE1NSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzMzNDE1NSIvPgo8L3N2Zz4=')]"
                            >
                                <div className="w-full h-full rounded" style={{ backgroundColor: color }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Palettes */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="card">
                        <PaletteDisplay title="Monochromatic" colors={harmonies.monochromatic} />
                        <PaletteDisplay title="Complementary" colors={harmonies.complementary} />
                        <PaletteDisplay title="Analogous" colors={harmonies.analogous} />
                        <PaletteDisplay title="Triadic" colors={harmonies.triadic} />
                        <PaletteDisplay title="Tetradic" colors={harmonies.tetradic} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Palettes;
