import React, { useState, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup'; // HTML/SVG
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faCode, faImage, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

const SvgTools = () => {
    const [svgCode, setSvgCode] = useState('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n</svg>');
    const [fileName, setFileName] = useState('untitled.svg');
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

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
            alert('Please upload a valid SVG file.');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(svgCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Editor / Input Column */}
                <div className="card flex flex-col min-h-0 bg-surface-dim border-white/10">
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
                <div className="card flex flex-col min-h-0 bg-surface-dim border-white/10">
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
            </div>
        </div>
    );
};

export default SvgTools;
