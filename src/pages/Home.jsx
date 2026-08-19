import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faEyeDropper, faSwatchbook, faLayerGroup, faImage, faStickyNote, faCode, faList } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/200.png';

const ToolCard = ({ to, icon, title, description, colorClass, bgClass }) => (
    <Link to={to} className="card hover:border-primary/50 group block h-full transition-all hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${bgClass} bg-opacity-10`}>
            <FontAwesomeIcon icon={icon} className={`text-xl ${colorClass}`} />
        </div>
        <h3 className="card-title mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
    </Link>
);

const Home = () => {
    const tools = [
        {
            to: "/colors",
            icon: faPalette,
            title: "Color Converter",
            description: "Convert between RGB, HEX, HSL, and CMYK formats with real-time preview.",
            colorClass: "text-blue-500",

            bgClass: "bg-blue-500"
        },
        {
            to: "/color-names",
            icon: faList,
            title: "Color Names",
            description: "Searchable list of standard CSS colors with HEX and RGBA values.",
            colorClass: "text-indigo-500",
            bgClass: "bg-indigo-500"
        },
        {
            to: "/image-picker",
            icon: faEyeDropper,
            title: "Image Color Picker",
            description: "Extract colors from any image using a magnifying eyedropper tool.",
            colorClass: "text-purple-500",
            bgClass: "bg-purple-500"
        },
        {
            to: "/gradients",
            icon: faSwatchbook,
            title: "Gradient Generator",
            description: "Create beautiful CSS gradients with visual controls and code export.",
            colorClass: "text-pink-500",
            bgClass: "bg-pink-500"
        },
        {
            to: "/palettes",
            icon: faLayerGroup,
            title: "Palette Generator",
            description: "Get color recommendations and harmony palettes based on a single color.",
            colorClass: "text-orange-500",
            bgClass: "bg-orange-500"
        },
        {
            to: "/shadows",
            icon: faImage,
            title: "Shadow Generator",
            description: "Generate accessible CSS box-shadows with multiple layers.",
            colorClass: "text-cyan-500",
            bgClass: "bg-cyan-500"
        },
        {
            to: "/notes",
            icon: faStickyNote,
            title: "Quick Notes",
            description: "Simple scratchpad with .txt export. Supports multi-language characters.",
            colorClass: "text-yellow-500",
            bgClass: "bg-yellow-500"
        },
        {
            to: "/svg-tools",
            icon: faCode,
            title: "Helper SVG",
            description: "View, edit live code, and render SVG files instantly.",
            colorClass: "text-pink-500",
            bgClass: "bg-pink-500"
        }
    ];

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-gamer mb-4 flex items-center justify-center gap-4">
                    <img src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                    <span className="text-white">DEVELOPER</span> <span className="text-gradient-editable">TOOLKIT</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Essential web development tools designed for speed and aesthetics.
                    Everything you need for your next project, all in one place.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                    <ToolCard key={index} {...tool} />
                ))}
            </div>
        </div>
    );
};

export default Home;
