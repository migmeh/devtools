import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCopy, faCheck, faCode, faPlus, faTimes, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import CodeEditor from '../components/CodeEditor';

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

    // Sync active note data
    const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

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

    // Line count for footer
    const lineCount = activeNote.content.split('\n').length;

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
        red: '#f38ba8',
        green: '#a6e3a1'
    };

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: mocha.base }}>
            <style>{`
                /* Syntax Highlighting */
                .token.comment { color: ${mocha.overlay0}; font-style: italic; }
                .token.punctuation { color: ${mocha.overlay0}; }
                .token.property, .token.tag, .token.boolean, .token.number { color: ${mocha.red}; }
                .token.selector, .token.attr-name, .token.string { color: ${mocha.green}; }
                .token.operator, .token.entity { color: ${mocha.blue}; }
                .token.keyword { color: ${mocha.mauve}; }
                .token.function { color: ${mocha.blue}; }

                /* Scrollbars */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                ::-webkit-scrollbar-track {
                    background: ${mocha.mantle};
                }
                ::-webkit-scrollbar-thumb {
                    background: ${mocha.surface1};
                    border-radius: 5px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${mocha.overlay0};
                }
            `}</style>

            {/* Header */}
            <div style={{ backgroundColor: mocha.mantle }} className="flex justify-between items-center px-4 py-1">
                <div className="flex items-center">
                    <div className="flex gap-1.5 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex overflow-x-auto" style={{ maxWidth: '40vw' }}>
                        {notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => setActiveNoteId(note.id)}
                                style={{
                                    backgroundColor: activeNoteId === note.id ? mocha.base : mocha.crust,
                                    borderTop: activeNoteId === note.id ? `2px solid ${mocha.mauve}` : '2px solid transparent',
                                    color: activeNoteId === note.id ? mocha.text : mocha.overlay0,
                                    minWidth: '120px',
                                    maxWidth: '200px'
                                }}
                                className="flex items-center gap-2 px-4 py-1 text-xs cursor-pointer border-r border-white/10 group"
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
                                {notes.length > 1 && (
                                    <button
                                        onClick={(e) => closeTab(e, note.id)}
                                        className="opacity-0 group-hover:opacity-100 hover:bg-white/10 p-0.5 rounded"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addNewTab}
                            className="px-3 hover:bg-white/5 text-slate-500 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                        </button>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-black/20 rounded border border-white/5">
                        <FontAwesomeIcon icon={faSearchPlus} className="text-slate-500 text-xs" />
                        <input
                            type="range"
                            min="12"
                            max="32"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-16"
                            style={{ accentColor: mocha.blue }}
                        />
                        <span className="text-slate-500 text-xs w-6">{fontSize}px</span>
                    </div>
                    
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white p-1">
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-500" : ""} />
                    </button>
                    <button onClick={handleDownload} className="text-slate-400 hover:text-white p-1">
                        <FontAwesomeIcon icon={faDownload} />
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div style={{ 
                flex: 1, 
                minHeight: 0,
                position: 'relative',
                padding: 0
            }}>
                <CodeEditor
                    value={activeNote.content}
                    onChange={updateActiveContent}
                    placeholder="Start typing..."
                    zoom={fontSize / 14}
                    language="javascript"
                />
            </div>

            {/* Footer */}
            <div style={{ backgroundColor: mocha.crust, color: mocha.subtext0 }} 
                 className="px-4 py-1 text-xs flex justify-between">
                <div className="flex gap-4">
                    <span>UTF-8</span>
                    <span>{activeNote.content.length} chars</span>
                    <span>{lineCount} lines</span>
                </div>
                <div className="flex gap-4">
                    <span>{activeNote.title.split('.').pop()?.toUpperCase() || 'TXT'}</span>
                    <span>Zoom: {fontSize}px</span>
                </div>
            </div>
        </div>
    );
};

export default QuickNotes;