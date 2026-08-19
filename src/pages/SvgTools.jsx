import React, { useState, useRef, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup'; // HTML/SVG
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faCode, faImage, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { CheckIcon } from '../components/icons';
import Toast from '../components/Toast';

const SvgTools = () => {
    // Load saved state from localStorage
    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem('svgTools');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    svgCode: parsed.svgCode || '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n</svg>',
                    fileName: parsed.fileName || 'untitled.svg',
                    history: parsed.history || [],
                    lastModified: parsed.lastModified || null
                };
            }
        } catch (error) {
            console.warn('Error loading SVG tools state:', error);
        }
        return {
            svgCode: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n</svg>',
            fileName: 'untitled.svg',
            history: [],
            lastModified: null
        };
    };

    const savedState = loadSavedState();
    const [svgCode, setSvgCode] = useState(savedState.svgCode);
    const [fileName, setFileName] = useState(savedState.fileName);
    const [history, setHistory] = useState(savedState.history);
    const [copied, setCopied] = useState(false);
    const [lastSaved, setLastSaved] = useState(savedState.lastModified);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const showToast = (type, title, message, duration) =>
        setToast({ type, title, message, duration });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            svgCode,
            fileName,
            history,
            lastModified: new Date().toISOString()
        };
        try {
            localStorage.setItem('svgTools', JSON.stringify(stateToSave));
            setLastSaved(stateToSave.lastModified);
        } catch (error) {
            console.warn('Error saving SVG tools state:', error);
        }
    }, [svgCode, fileName, history]);

    // Add to history when SVG code changes significantly
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (svgCode && svgCode.trim() !== '') {
                setHistory(prev => {
                    // Don't add if it's the same as the last entry
                    if (prev.length > 0 && prev[0].code === svgCode) {
                        return prev;
                    }
                    // Add new entry and keep last 10
                    const newEntry = {
                        code: svgCode,
                        timestamp: new Date().toISOString(),
                        fileName: fileName
                    };
                    return [newEntry, ...prev].slice(0, 10);
                });
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [svgCode, fileName]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSvgCode(event.target.result);
                setFileName(file.name);
            };
            reader.readAsText(file);
        } else {
            showToast('error', 'Archivo no válido', 'Selecciona un archivo SVG.');
        }
    };

    const handleCopy = () => {
        navigator.clipboard?.writeText(svgCode)
            .then(() => {
                setCopied(true);
                showToast('success', 'Copiado', 'Código SVG copiado al portapapeles.');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                showToast('error', 'Error al copiar', 'No se pudo acceder al portapapeles.');
            });
    };

    const loadFromHistory = (historyItem) => {
        setSvgCode(historyItem.code);
        setFileName(historyItem.fileName);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const resetToDefault = () => {
        const defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n</svg>';
        setSvgCode(defaultSvg);
        setFileName('untitled.svg');
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    // Encode SVG for data URI to ensure it renders if it doesn't have proper headers
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;

    return (
        <div className="page-container animate-fade-in h-[calc(100vh-theme(spacing.20))] flex flex-col">
            <div className="section-title">
                <span className="bg-pink-500/10 text-pink-500 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faCode} />
                </span>
                SVG Tools
                <div className="ml-auto flex items-center gap-4">
                    {lastSaved && (
                        <span className="text-xs text-green-400 opacity-75 inline-flex items-center gap-1.5">
                            <CheckIcon className="w-4 h-4" aria-label="Guardado" /> Auto-saved {formatDate(lastSaved)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Editor / Input Column */}
                <div className="lg:col-span-5 card flex flex-col min-h-0 bg-surface-dim border-white/10">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="btn btn-primary text-sm py-1.5"
                            >
                                <FontAwesomeIcon icon={faCloudUploadAlt} /> Upload SVG
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".svg"
                                onChange={handleFileUpload}
                            />
                        </div>
                            <button
                                onClick={resetToDefault}
                                className="btn btn-secondary text-xs py-1.5"
                                title="Reset to Default"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleCopy}
                                className="btn btn-secondary text-xs py-1.5"
                                title="Copy Code"
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-500" : ""} /> Copy
                            </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative rounded-lg border border-white/5 bg-[#1e1e2e]"> {/* Using dark code bg */}
                        <Editor
                            value={svgCode}
                            onValueChange={code => setSvgCode(code)}
                            highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                            padding={20}
                            style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                fontSize: 14,
                                backgroundColor: 'transparent',
                                color: '#cdd6f4', // Catppuccin text
                                minHeight: '100%',
                            }}
                            className="absolute inset-0"
                            textareaClassName="focus:outline-none"
                        />
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-4 card flex flex-col min-h-0 bg-surface-dim border-white/10">
                    <h3 className="card-title mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faImage} className="text-slate-400" /> Preview
                        <span className="text-xs font-normal text-slate-500 ml-auto">{fileName}</span>
                    </h3>

                    <div className="flex-1 rounded-xl flex items-center justify-center p-8 overflow-hidden border border-white/10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PC9yZWN0Pgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PC9yZWN0Pgo8L3N2Zz4=')]">
                        <img
                            src={svgDataUrl}
                            alt="SVG Preview"
                            className="max-w-full max-h-full transition-all duration-300 drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* History Column */}
                <div className="lg:col-span-3 card flex flex-col min-h-0 bg-surface-dim border-white/10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="card-title">History</h3>
                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="btn btn-secondary text-xs py-1"
                                title="Clear History"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p className="text-sm">No history yet</p>
                                <p className="text-xs mt-1">Changes will appear here</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => loadFromHistory(item)}
                                    title="Click to restore this version"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-slate-300 truncate">
                                            {item.fileName}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                                            {formatDate(item.timestamp)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono bg-black/20 p-2 rounded overflow-hidden">
                                        <div className="truncate">
                                            {item.code.split('\n')[0]}...
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default SvgTools;
