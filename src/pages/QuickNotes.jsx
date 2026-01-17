import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCopy, faTrash, faCheck, faCode, faPlus, faTimes, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-json';

const QuickNotes = () => {
    // Initial State Structure
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('quick_notes_multitab');
        if (saved) return JSON.parse(saved);
        return [
            { id: '1', title: 'note-1.js', content: '// Welcome to Quick Notes!\n// Supports multiple tabs and auto-save.' }
        ];
    });

    const [activeNoteId, setActiveNoteId] = useState(() => {
        return localStorage.getItem('quick_notes_active_id') || '1';
    });

    const [fontSize, setFontSize] = useState(() => {
        return parseInt(localStorage.getItem('quick_notes_font_size')) || 14;
    });

    const [copied, setCopied] = useState(false);
    const lineNumbersRef = useRef(null);

    // Sync active note data
    const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

    // Sync scrolling between editor and line numbers
    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // Auto-save
    useEffect(() => {
        localStorage.setItem('quick_notes_multitab', JSON.stringify(notes));
        localStorage.setItem('quick_notes_active_id', activeNoteId);
        localStorage.setItem('quick_notes_font_size', fontSize.toString());
    }, [notes, activeNoteId, fontSize]);

    const updateActiveContent = (newContent) => {
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content: newContent } : n));
    };

    const updateActiveTitle = (newTitle) => {
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, title: newTitle } : n));
    };

    const addNewTab = () => {
        const newId = Date.now().toString();
        const newNote = { id: newId, title: `note-${notes.length + 1}.js`, content: '' };
        setNotes([...notes, newNote]);
        setActiveNoteId(newId);
    };

    const closeTab = (e, id) => {
        e.stopPropagation();
        if (notes.length === 1) return;

        const noteToClose = notes.find(n => n.id === id);
        if (noteToClose?.content.trim() && !window.confirm(`Close "${noteToClose.title}"? Unsaved changes will be lost.`)) {
            return;
        }

        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (activeNoteId === id) {
            setActiveNoteId(newNotes[0].id);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = activeNote.title.includes('.') ? activeNote.title : `${activeNote.title}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(activeNote.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lineCount = activeNote.content.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

    // Calculated Layout constants
    const lineHeightMultiplier = 1.5;
    const currentLineHeight = fontSize * lineHeightMultiplier;

    // Catppuccin Mocha Palette
    const mocha = {
        base: '#1e1e2e',
        mantle: '#181825',
        crust: '#11111b',
        text: '#cdd6f4',
        subtext0: '#a6adc8',
        overlay0: '#6c7086',
        surface0: '#313244',
        surface1: '#45475a',
        blue: '#89b4fa',
        lavender: '#b4befe',
        mauve: '#cba6f7',
        pink: '#f5c2e7',
        red: '#f38ba8',
        orange: '#fab387',
        yellow: '#f9e2af',
        green: '#a6e3a1',
        teal: '#94e2d5'
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen animate-fade-in overflow-hidden">
            <style>{`
                /* Syntax Highlighting - Catppuccin Mocha */
                .token.comment, .token.prolog, .token.doctype, .token.cdata { color: ${mocha.overlay0}; font-style: italic; }
                .token.punctuation { color: ${mocha.overlay0}; }
                .token.namespace { opacity: .7; }
                .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: ${mocha.orange}; }
                .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: ${mocha.green}; }
                .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: ${mocha.teal}; }
                .token.atrule, .token.attr-value, .token.keyword { color: ${mocha.mauve}; }
                .token.function, .token.class-name { color: ${mocha.blue}; }
                .token.regex, .token.important, .token.variable { color: ${mocha.yellow}; }

                .editor-container::-webkit-scrollbar { width: 10px; height: 10px; }
                .editor-container::-webkit-scrollbar-track { background: ${mocha.crust}; }
                .editor-container::-webkit-scrollbar-thumb { background: ${mocha.surface0}; border-radius: 5px; }
                .editor-container::-webkit-scrollbar-thumb:hover { background: ${mocha.surface1}; }
                
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                
                .react-simple-code-editor { min-height: 100%; }
                .react-simple-code-editor textarea { outline: none !important; }

                .tab-active {
                    background-color: ${mocha.base};
                    border-top: 2px solid ${mocha.mauve};
                    color: ${mocha.text};
                }
                .tab-inactive {
                    background-color: ${mocha.crust};
                    color: ${mocha.overlay0};
                    border-top: 2px solid transparent;
                }
                .tab-inactive:hover {
                    background-color: ${mocha.surface0};
                    color: ${mocha.subtext0};
                }

                .zoom-slider {
                    -webkit-appearance: none;
                    height: 4px;
                    background: ${mocha.surface0};
                    border-radius: 5px;
                    outline: none;
                }
                .zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: ${mocha.blue};
                    cursor: pointer;
                    border-radius: 50%;
                }
            `}</style>

            <div
                className="flex-1 flex flex-col"
                style={{ backgroundColor: mocha.base }}
            >
                {/* VS Code Style Header & Tool Bar */}
                <div
                    className="flex justify-between items-center bg-mantle shadow-lg z-10"
                    style={{ backgroundColor: mocha.mantle }}
                >
                    <div className="flex items-center">
                        <div className="flex gap-1.5 px-4">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>

                        {/* Tab Bar */}
                        <div className="flex overflow-x-auto hide-scrollbar max-w-[40vw]">
                            {notes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => setActiveNoteId(note.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer transition-all border-r border-slate-800/50 min-w-[120px] max-w-[200px] group ${activeNoteId === note.id ? 'tab-active' : 'tab-inactive'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faCode} className="text-[10px] opacity-60" />
                                    {activeNoteId === note.id ? (
                                        <input
                                            value={note.title}
                                            onChange={(e) => updateActiveTitle(e.target.value)}
                                            className="bg-transparent outline-none w-full"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="truncate flex-1">{note.title}</span>
                                    )}
                                    <button
                                        onClick={(e) => closeTab(e, note.id)}
                                        className={`p-0.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${notes.length === 1 ? 'hidden' : ''}`}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addNewTab}
                                className="px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                                title="New File"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons & Zoom */}
                    <div className="flex items-center gap-4 pr-4">
                        {/* Zoom Slider */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/20 rounded-lg border border-white/5">
                            <FontAwesomeIcon icon={faSearchPlus} className="text-[10px] text-slate-500" />
                            <input
                                type="range"
                                min="12"
                                max="32"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="zoom-slider w-20"
                            />
                            <span className="text-[10px] font-mono text-slate-500 w-6">{fontSize}px</span>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                                title="Copy All"
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-500" : ""} />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                                title="Download Current Tab"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar Line Numbers */}
                    <div
                        ref={lineNumbersRef}
                        className="w-12 flex flex-col items-end pt-6 pr-3 select-none overflow-hidden hide-scrollbar font-mono text-xs"
                        style={{
                            backgroundColor: mocha.mantle,
                            color: mocha.overlay0,
                            borderRight: `1px solid ${mocha.surface0}`,
                            fontSize: `${fontSize * 0.85}px`,
                            lineHeight: `${currentLineHeight}px`
                        }}
                    >
                        {lineNumbers.map(num => (
                            <div key={num} style={{ height: currentLineHeight }}>
                                {num}
                            </div>
                        ))}
                    </div>

                    {/* Main Editor */}
                    <div
                        className="flex-1 overflow-auto editor-container scroll-smooth"
                        onScroll={handleScroll}
                    >
                        <Editor
                            value={activeNote.content}
                            onValueChange={code => updateActiveContent(code)}
                            highlight={code => {
                                // Simple language detection based on extension
                                const ext = activeNote.title.split('.').pop();
                                let lang = Prism.languages.js;
                                if (ext === 'css') lang = Prism.languages.css;
                                if (ext === 'html' || ext === 'xml') lang = Prism.languages.markup;
                                if (ext === 'json') lang = Prism.languages.json;

                                return Prism.highlight(code, lang, ext);
                            }}
                            padding={24}
                            style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                fontSize: fontSize,
                                minHeight: '100%',
                                color: mocha.text,
                                caretColor: mocha.blue,
                                lineHeight: `${currentLineHeight}px`
                            }}
                            className="min-h-full"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="px-4 py-1 text-[10px] font-mono flex justify-between items-center"
                    style={{ backgroundColor: mocha.crust, color: mocha.subtext0 }}
                >
                    <div className="flex gap-4">
                        <span>UTF-8</span>
                        <span>{activeNote.content.length} chars</span>
                        <span>{lineCount} lines</span>
                    </div>
                    <div className="flex gap-4">
                        <span>{activeNote.title.split('.').pop()?.toUpperCase() || 'PLAINTEXT'}</span>
                        <span>Zoom: {fontSize}px</span>
                        <span>Catppuccin Mocha</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickNotes;
