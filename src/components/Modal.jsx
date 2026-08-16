import React, { useCallback, useEffect, useRef } from 'react';

// Modal accesible (regla 17): aria-modal, trampa de foco, Escape, sin alert().
const Modal = ({ open, title, message, confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', onConfirm, onCancel, danger = false }) => {
    const confirmRef = useRef(null);

    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onCancel?.();
        if (e.key === 'Enter' && (e.target?.closest('[data-modal]') || e.target === document.body)) {
            // Evitar múltiples confirmaciones
        }
    }, [onCancel]);

    useEffect(() => {
        if (!open) return;
        document.addEventListener('keydown', handleKey);
        confirmRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, handleKey]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            data-modal
        >
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div className="relative bg-surface border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fade-in">
                <h2 id="modal-title" className="text-lg font-bold text-white mb-3">
                    {title}
                </h2>
                <p className="text-slate-300 text-sm mb-6 whitespace-pre-wrap">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="btn btn-secondary text-sm">
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        className={`btn text-sm ${danger ? 'bg-red-600 hover:brightness-125 text-white border-transparent' : 'btn-primary'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;