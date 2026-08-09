import React, { useState, useCallback } from 'react';
import getFileIcon from '../components/FileIcon';

const getFileType = (name) => {
  const ext = name.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'svg+xml'].includes(ext)) {
    return { type: 'image', name: ext.toUpperCase() };
  }

  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) {
    return { type: 'video', name: ext.toUpperCase() };
  }

  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return { type: 'audio', name: ext.toUpperCase() };
  }

  if (['json', 'txt'].includes(ext)) {
    return { type: 'text', name: ext.toUpperCase() };
  }

  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'rs', 'dart', 'java', 'c', 'cpp', 'h', 'hpp'].includes(ext) || ['javascript', 'typescript', 'css-in-js'].includes(ext)) {
    return { type: 'code', name: ext.toUpperCase() };
  }

  if (name.endsWith('/')) {
    return { type: 'folder', name: 'Carpeta' };
  }

  return { type: 'file', name: ext.toUpperCase() || 'Archivo' };
};

const FileExplorer = () => {
  const [currentHandle, setCurrentHandle] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadDirectory = useCallback(async (dirHandle, pathName) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentPath(prev => [...prev, pathName]);

    try {
      const entries = [];
      for await (const [name, handle] of dirHandle.entries()) {
        const metadata = {
          name: handle.kind === 'directory' ? `${name}/` : name,
          handle: handle,
          kind: handle.kind,
        };

        if (handle.kind === 'file') {
          metadata.file = await handle.getFile();
        }

        entries.push(metadata);
      }

      setFiles(entries);
    } catch (error) {
      setErrorMessage(`Error al cargar archivos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      setErrorMessage('Tu navegador no soporta acceso a archivos. Por favor usa Chrome, Edge u Opera.');
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({
        mode: 'read',
      });

      const dirEntry = Array.from(currentPath).pop();

      if (dirEntry) {
        await handle.entry();
      }

      setCurrentHandle(handle);
      await loadDirectory(handle, '');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrorMessage(`Error al seleccionar directorio: ${error.message}`);
      }
    }
  };

  const navigateToDirectory = async (metadata) => {
    if (metadata.kind === 'directory') {
      await loadDirectory(metadata.handle, metadata.name);
    }
  };

  const navigateBack = async () => {
    if (currentPath.length === 0) return;

    const newPath = [...currentPath];
    newPath.pop();
    const parentDirName = newPath.length > 0 ? newPath[newPath.length - 1] : '';

    if (newPath.length === 0) {
      setCurrentHandle(null);
      setFiles([]);
    } else {
      const parentHandle = await currentHandle.getDirectoryHandle(newPath[newPath.length - 2], { create: false });
      await loadDirectory(parentHandle, parentDirName);
      setCurrentPath(newPath);
    }
  };

  const navigateUp = async () => {
    await navigateBack();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Explorador de Archivos</h1>
          <p className="text-slate-400 text-sm">
            Accede a archivos de tu dispositivo. Los archivos permanecen en tu computadora.
          </p>
        </div>

        {!currentHandle && (
          <button
            onClick={selectDirectory}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-label="Seleccionar directorio"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <line x1="12" y1="9" x2="12" y2="17" />
            </svg>
            Seleccionar Directorio
          </button>
        )}

        {currentHandle && (
          <>
            <button
              onClick={navigateUp}
              disabled={currentPath.length === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                aria-label="Retroceder"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              Subir
            </button>

            <button
              onClick={selectDirectory}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                aria-label="Cambiar directorio"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Cambiar
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-6 mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"
              aria-label="Cargando"
            />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .animate-spin {
                animation: spin 1s linear infinite;
              }
            `}</style>
            <p className="text-slate-400">Cargando archivos...</p>
          </div>
        </div>
      )}

      {/* File List */}
      {!isLoading && currentHandle && files.length > 0 && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {files.map((file, index) => {
              const fileType = getFileType(file.name);
              return (
                <button
                  key={index}
                  onClick={() => navigateToDirectory(file)}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-4 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <getFileIcon(fileType.type, fileType.name) />

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors">
                        {file.name}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {fileType.name}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && currentHandle && files.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-16 h-16 text-slate-600 mx-auto mb-3"
              aria-label="Directorio vacío"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <h3 className="text-xl font-medium text-slate-400 mb-2">
              Directorio vacío
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Este directorio no contiene archivos o subcarpetas
            </p>
          </div>
        </div>
      )}

      {!isLoading && !currentHandle && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-16 h-16 text-indigo-500 mx-auto mb-3"
              aria-label="Seleccionar directorio"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M13 13v6" />
              <path d="M16 16l-3-3-3 3" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">
              No hay directorio seleccionado
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Selecciona un directorio de tu computadora para empezar a explorar.
              <br />
              <span className="text-slate-600 text-sm">
                Los archivos no se suben a ningún servidor, quedan en tu dispositivo.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;