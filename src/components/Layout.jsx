import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faEyeDropper, faSwatchbook, faLayerGroup, faImage, faHome, faStickyNote, faCode, faList } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/200.png';

const Sidebar = () => {
    const navItems = [
        { to: "/colors", icon: faPalette, label: "Color Converter" },
        { to: "/color-names", icon: faList, label: "Color Names" },
        { to: "/image-picker", icon: faEyeDropper, label: "Image Picker" },
        { to: "/gradients", icon: faSwatchbook, label: "Gradients" },
        { to: "/palettes", icon: faLayerGroup, label: "Palettes" },
        { to: "/shadows", icon: faImage, label: "Shadows" },
        { to: "/svg-tools", icon: faCode, label: "Helper SVG" },
        { to: "/notes", icon: faStickyNote, label: "Quick Notes" },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-slate-700/50 hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-slate-700/50">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    <h2 className="text-2xl font-gamer">
                        <span className="text-white">DEV</span><span className="text-gradient-editable">TOOLS</span>
                    </h2>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive ? "nav-item nav-item-active" : "nav-item"
                        }
                    >
                        <FontAwesomeIcon icon={item.icon} className="w-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 text-center">
                    &copy; 2026 DevTools App
                </div>
            </div>
        </aside>
    );
};

const MobileNav = () => {
    // Basic mobile nav for now
    return (
        <div className="md:hidden bg-surface border-b border-slate-700/50 p-4 flex justify-between items-center sticky top-0 z-50">
            <h2 className="text-lg font-bold text-white">DevTools</h2>
            {/* Mobile menu toggle would go here */}
        </div>
    )
}

const Layout = () => {
    const location = useLocation();
    const isNotesPage = location.pathname === '/notes';

    return (
        <div className="min-h-screen bg-background text-white">
            <Sidebar />
            <div className="md:ml-64 min-h-screen flex flex-col">
                <MobileNav />
                <main className={`flex-1 ${isNotesPage ? 'overflow-hidden' : 'p-6 md:p-8'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
