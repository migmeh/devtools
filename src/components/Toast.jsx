import React, { useEffect, useState } from 'react';
import { CheckIcon, InfoIcon, WarningIcon } from './icons';

// Toast accesible no-persistente (regla 17): notificaciones de estado sin bloquear.
const TOAST_TYPES = {
    success: { icon: CheckIcon, iconClass: 'text-green-400', barClass: 'bg-green-500' },
    error: { icon: WarningIcon, iconClass: 'text-red-400', barClass: 'bg-red-500' },
    info: { icon: InfoIcon, iconClass: 'text-cyan-400', barClass: 'bg-cyan-500' },
};

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, toast.duration || 3000);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;
    const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl px-4 py-3 animate-fade-in max-w-sm">
            <span className={`absolute left-0 top-0 h-full w-1 ${config.barClass}`} aria-hidden="true" />
            <Icon className={`w-5 h-5 ${config.iconClass}`} aria-label={toast.title} />
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{toast.title}</span>
                {toast.message && (
                    <span className="text-xs text-slate-400">{toast.message}</span>
                )}
            </div>
            <button
                onClick={onClose}
                aria-label="Cerrar notificación"
                className="ml-2 text-slate-500 hover:text-white p-1 rounded hover:bg-white/10"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;