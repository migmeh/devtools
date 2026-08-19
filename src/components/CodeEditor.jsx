import React, { useState, useEffect, useRef } from 'react';
import { Highlight, themes } from "prism-react-renderer";

const CodeEditor = ({ value, onChange, placeholder, zoom = 1, language = "javascript" }) => {
    const [themeConfig, setThemeConfig] = useState(themes.nightOwl || themes.dracula);
    const lineNumbersRef = useRef(null);
    const preRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        setThemeConfig(themes.nightOwl || themes.dracula);
    }, []);

    // Sincronizar scroll de los números de línea y el pre con el textarea
    const handleScroll = (e) => {
        const { scrollTop, scrollLeft } = e.target;
        
        // Sincronizar números de línea (solo scroll vertical)
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = scrollTop;
        }
        
        // Sincronizar pre (scroll vertical y horizontal)
        if (preRef.current) {
            preRef.current.scrollTop = scrollTop;
            preRef.current.scrollLeft = scrollLeft;
        }
    };

    const lineCount = value.split('\n').length;
    const fontSize_ = 14 * zoom;
    const lineHeight = 1.5;
    const lineHeightPx = fontSize_ * lineHeight;

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            backgroundColor: themeConfig.plain.backgroundColor,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
        }}>
            {/* Números de línea - con scroll vertical sincronizado */}
            <div 
                ref={lineNumbersRef}
                style={{
                    padding: '10px 5px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'right',
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: `${fontSize_}px`,
                    lineHeight: `${lineHeight}em`,
                    color: '#858585',
                    userSelect: 'none',
                    minWidth: '3.5em',
                    whiteSpace: 'pre',
                    flexShrink: 0,
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 3
                }}
            >
                <div style={{ 
                    paddingTop: '0',
                    paddingBottom: '0'
                }}>
                    {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
                        <div key={i} style={{ height: `${lineHeightPx}px`, paddingRight: '5px' }}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenedor del editor */}
            <div style={{
                flex: 1,
                position: 'relative',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: 'transparent'
            }}>
                {/* Pre con sintaxis - con scroll propio sincronizado */}
                <div
                    ref={preRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'auto',
                        pointerEvents: 'none',
                        zIndex: 1,
                        backgroundColor: 'transparent'
                    }}
                >
                    <pre style={{
                        margin: 0,
                        padding: '10px',
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: `${fontSize_}px`,
                        lineHeight: `${lineHeight}em`,
                        color: '#cdd6f4',
                        backgroundColor: 'transparent',
                        whiteSpace: 'pre',
                        wordWrap: 'normal',
                        width: 'max-content',
                        minWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <Highlight theme={themeConfig} code={value || ''} language={language}>
                            {({ tokens, getLineProps, getTokenProps }) => (
                                <div style={{ display: 'inline-block', minWidth: '100%' }}>
                                    {tokens.map((line, i) => (
                                        <div 
                                            key={i} 
                                            {...getLineProps({ line })} 
                                            style={{ 
                                                height: `${lineHeightPx}px`,
                                                ...getLineProps({ line }).style 
                                            }}
                                        >
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Highlight>
                    </pre>
                </div>

                {/* Textarea - EL QUE MANEJA EL SCROLL PRINCIPAL */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    placeholder={placeholder}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        margin: 0,
                        padding: '10px',
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: `${fontSize_}px`,
                        lineHeight: `${lineHeight}em`,
                        color: 'transparent',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        whiteSpace: 'pre',
                        wordWrap: 'normal',
                        overflow: 'auto',
                        width: '100%',
                        height: '100%',
                        caretColor: '#cdd6f4',
                        boxSizing: 'border-box',
                        zIndex: 2
                    }}
                    spellCheck="false"
                    wrap="off"
                />
            </div>
        </div>
    );
};

export default CodeEditor; // ¡CORREGIDO!