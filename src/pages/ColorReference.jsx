import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faCopy, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';

extend([cmykPlugin]);

const cssColors = {
    "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff",
    "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff",
    "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887", "cadetblue": "#5f9ea0", "chartreuse": "#7fff00",
    "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c",
    "cyan": "#00ffff", "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9",
    "darkgreen": "#006400", "darkgrey": "#a9a9a9", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkslategrey": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3",
    "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dimgrey": "#696969", "dodgerblue": "#1e90ff",
    "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff", "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000",
    "greenyellow": "#adff2f", "grey": "#808080", "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred": "#cd5c5c",
    "indigo": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa", "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2", "lightgray": "#d3d3d3", "lightgreen": "#90ee90", "lightgrey": "#d3d3d3", "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
    "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead", "navy": "#000080", "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23",
    "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6", "palegoldenrod": "#eee8aa", "palegreen": "#98fb98",
    "paleturquoise": "#afeeee", "palevioletred": "#db7093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f",
    "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080", "rebeccapurple": "#663399",
    "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "saddlebrown": "#8b4513", "salmon": "#fa8072",
    "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0",
    "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "slategrey": "#708090", "snow": "#fffafa",
    "springgreen": "#00ff7f", "steelblue": "#4682b4", "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8",
    "tomato": "#ff6347", "turquoise": "#40e0d0", "violet": "#ee82ee", "wheat": "#f5deb3", "white": "#ffffff",
    "whitesmoke": "#f5f5f5", "yellow": "#ffff00", "yellowgreen": "#9acd32"
};

const ColorCard = ({ name, hex }) => {
    const [copied, setCopied] = useState(null);
    const color = colord(hex);
    const rgb = color.toRgbString();
    const cmyk = color.toCmykString();

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="card hover:border-white/20 transition-all flex flex-col group bg-surface-dim border-white/10">
            <div className="h-24 w-full rounded-lg mb-4 relative shadow-inner overflow-hidden flex items-center justify-center">
                {/* Checkerboard background for transparency/light colors */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSI+PC9yZWN0Pgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSI+PC9yZWN0Pgo8L3N2Zz4=')]"></div>

                <div className="absolute inset-0" style={{ backgroundColor: hex }}></div>

                {/* Copy overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleCopy(hex, 'hex')}
                        className="btn btn-sm bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-sm"
                    >
                        {copied === 'hex' ? <FontAwesomeIcon icon={faCheck} className="text-green-400" /> : 'HEX'}
                    </button>
                    <button
                        onClick={() => handleCopy(rgb, 'rgb')}
                        className="btn btn-sm bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-sm"
                    >
                        {copied === 'rgb' ? <FontAwesomeIcon icon={faCheck} className="text-green-400" /> : 'RGB'}
                    </button>
                    <button
                        onClick={() => handleCopy(cmyk, 'cmyk')}
                        className="btn btn-sm bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-sm"
                    >
                        {copied === 'cmyk' ? <FontAwesomeIcon icon={faCheck} className="text-green-400" /> : 'CMYK'}
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-white font-medium capitalize">{name}</h3>
                    <span className="text-xs text-slate-500 font-mono">{hex}</span>
                </div>
                <button
                    onClick={() => handleCopy(name, 'name')}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                    title="Copy Name"
                >
                    <FontAwesomeIcon icon={copied === 'name' ? faCheck : faCopy} className={copied === 'name' ? "text-green-500" : ""} />
                </button>
            </div>
            <div className="mt-1">
                <div className="mt-1 flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-600 font-mono block truncate" title={rgb}>{rgb}</span>
                    <span className="text-[10px] text-slate-600 font-mono block truncate" title={cmyk}>{cmyk}</span>
                </div>
            </div>
        </div>
    );
};

const ColorReference = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredColors = Object.entries(cssColors).filter(([name, hex]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hex.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="section-title mb-0">
                    <span className="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faList} />
                    </span>
                    Color Names
                </div>

                <div className="relative w-full md:w-64">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search colors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 bg-surface-dim border-white/10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredColors.map(([name, hex]) => (
                    <ColorCard key={name} name={name} hex={hex} />
                ))}
            </div>

            {filteredColors.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>No colors found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default ColorReference;
