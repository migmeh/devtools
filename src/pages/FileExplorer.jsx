import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import getFileIcon from '../components/FileIcon';
import { generateVideoThumbnail } from '../components/videoThumbnail';
/* ================================================================
   PERSISTENCIA — IndexedDB (handles) + localStorage (preferencias)
   ================================================================ */
const DB_NAME = 'DevToolsFileExplorer';
const DB_STORE = 'sessions';
const DB_KEY = 'current-session';
const VIEW_STORAGE_KEY = 'dt-fe:viewMode';
const HIDDEN_TOGGLE_KEY = 'dt-fe:showHidden';
const VIEW_MODES = ['masonry', 'grid', 'list'];

const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const saveSession = async (session) => {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put({ ...session, timestamp: Date.now() }, DB_KEY);
    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn('No se pudo guardar la sesión:', e);
  }
};

const loadSession = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(DB_KEY);
    const result = await new Promise((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    db.close();
    return result || null;
  } catch {
    return null;
  }
};

const clearSession = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(DB_KEY);
    db.close();
  } catch {}
};

/* ================================================================
   Clasificación de archivos
   ================================================================ */

// ✅ Archivos basura de macOS (subconjunto de ocultos)
const isJunkFile = (name) => name.startsWith('._') || name === '.DS_Store';

// ✅ NUEVO — Archivos ocultos: cualquier nombre que empiece con "."
const isHiddenFile = (name) => {
  const clean = name.replace(/\/+$/, '');
  return clean.startsWith('.');
};

const getFileType = (name) => {
  if (isJunkFile(name)) return { type: 'file', name: 'Sistema' };

  const ext = name.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'svg+xml', 'avif', 'bmp', 'ico'].includes(ext)) {
    return { type: 'image', name: ext.toUpperCase() };
  }
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) {
    return { type: 'video', name: ext.toUpperCase() };
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return { type: 'audio', name: ext.toUpperCase() };
  }
  if (['json', 'txt', 'md', 'csv', 'xml', 'yml', 'yaml', 'log'].includes(ext)) {
    return { type: 'text', name: ext.toUpperCase() };
  }
  if (
    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'rs', 'dart', 'java', 'c', 'cpp', 'h', 'hpp', 'sh', 'sql', 'php', 'rb', 'go'].includes(ext) ||
    ['javascript', 'typescript', 'css-in-js'].includes(ext)
  ) {
    return { type: 'code', name: ext.toUpperCase() };
  }
  if (name.endsWith('/')) {
    return { type: 'folder', name: 'Carpeta' };
  }
  return { type: 'file', name: ext.toUpperCase() || 'Archivo' };
};

const formatFileSize = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/* ================================================================
   Utilidades URL ↔ stack de navegación
   ================================================================ */
const cleanName = (n) => n.replace(/\/+$/, '');
const stackToPath = (activeStack) =>
  activeStack.slice(1).map((d) => cleanName(d.name)).join('/');
const pathToSegments = (path) => (path ? path.split('/').filter(Boolean) : []);
const segKey = (arr) => arr.join('\u0000');
const pathParams = (activeStack) => {
  const p = stackToPath(activeStack);
  return p ? { path: p } : {};
};

const findDepthForPath = (stack, segments) => {
  for (let i = 0; i < segments.length; i++) {
    const entry = stack[i + 1];
    if (!entry || cleanName(entry.name) !== segments[i]) return null;
  }
  return Math.min(segments.length + 1, stack.length);
};

/* ================================================================
   ✅ NUEVO — Interruptor estilizado (toggle switch)
   ================================================================ */
const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className="relative flex items-center gap-2 group/toggle cursor-pointer select-none"
  >
    {/* Riel */}
    <span
      className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-300 ${
        checked ? 'bg-indigo-600' : 'bg-slate-600'
      }`}
    >
      {/* Perilla */}
      <span
        className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </span>
    <span className={`text-xs font-medium transition-colors duration-200 ${
      checked ? 'text-indigo-400' : 'text-slate-500'
    } group-hover/toggle:text-white`}>
      {label}
    </span>
  </button>
);

/* ================================================================
   VISOR DE ARCHIVOS
   ================================================================ */
const FileViewer = ({ entry, onClose }) => {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const fileType = getFileType(entry.name);

  useEffect(() => {
    let url = null;
    let cancelled = false;

    const load = async () => {
      try {
        const file = await entry.handle.getFile();
        if (cancelled) return;
        setMeta({ size: file.size, mime: file.type, lastModified: file.lastModified });

        if (['image', 'video', 'audio'].includes(fileType.type)) {
          url = URL.createObjectURL(file);
          setMediaUrl(url);
        } else if (['text', 'code'].includes(fileType.type)) {
          if (file.size > 2 * 1024 * 1024) {
            setTextContent('⚠️ Archivo demasiado grande para previsualizar (> 2 MB).');
          } else {
            const text = await file.text();
            if (!cancelled) setTextContent(text);
          }
        }
      } catch (e) {
        if (!cancelled) setError(`No se pudo leer el archivo: ${e.message}`);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [entry, fileType.type]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60 shrink-0">
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{entry.name}</p>
            <p className="text-slate-500 text-xs">
              {fileType.name}
              {meta && ` · ${formatFileSize(meta.size)}`}
              {meta?.mime && ` · ${meta.mime}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Cerrar visor"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center min-h-[300px]">
          {error && <p className="text-red-400 text-sm p-6">{error}</p>}

          {!error && fileType.type === 'image' && mediaUrl && (
            <img src={mediaUrl} alt={entry.name} className="max-w-full max-h-[70vh] object-contain" />
          )}

          {!error && fileType.type === 'video' && mediaUrl && (
            <video src={mediaUrl} controls autoPlay className="max-w-full max-h-[70vh]" />
          )}

          {!error && fileType.type === 'audio' && mediaUrl && (
            <div className="p-8 w-full max-w-xl">
              <audio src={mediaUrl} controls autoPlay className="w-full" />
            </div>
          )}

          {!error && ['text', 'code'].includes(fileType.type) && textContent !== null && (
            <pre className="w-full h-full p-6 text-sm text-slate-200 font-mono whitespace-pre-wrap break-words overflow-auto text-left">
              {textContent}
            </pre>
          )}

          {!error && !['image', 'video', 'audio', 'text', 'code'].includes(fileType.type) && (
            <div className="text-center p-10">
              <div className="w-20 h-20 mx-auto mb-4 text-slate-600">{getFileIcon(fileType.type)}</div>
              <p className="text-slate-400">Vista previa no disponible para este tipo de archivo.</p>
              {meta && <p className="text-slate-600 text-sm mt-2">Tamaño: {formatFileSize(meta.size)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Modal de confirmación de eliminación
   ================================================================ */
const ConfirmDialog = ({ entry, onCancel, onConfirm }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 shrink-0 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </span>
          <h3 className="text-white font-semibold text-lg">Eliminar archivo</h3>
        </div>

        <p className="text-slate-400 text-sm mb-2">¿Seguro que deseas eliminar este archivo?</p>
        <p className="text-white font-mono text-sm bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 mb-3 truncate">
          {entry.name}
        </p>
        <p className="text-red-400/80 text-xs mb-5">Esta acción no se puede deshacer.</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Botón ✕ de eliminación
   ================================================================ */
const DeleteXButton = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    title="Eliminar archivo"
    aria-label="Eliminar archivo"
    className={`z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900/85 border border-slate-600 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-200 ${className}`}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
);

/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */
const FileExplorer = () => {
  const [dirStack, setDirStack] = useState([]);
  const [depth, setDepth] = useState(0);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({});

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return VIEW_MODES.includes(saved) ? saved : 'grid';
  });

  // ✅ NUEVO: toggle de archivos ocultos con persistencia
  const [showHiddenFiles, setShowHiddenFiles] = useState(() => {
    return localStorage.getItem(HIDDEN_TOGGLE_KEY) === 'true';
  });

  const [viewerEntry, setViewerEntry] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [removingFiles, setRemovingFiles] = useState(() => new Set());
  const [confirmEntry, setConfirmEntry] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentDir = depth > 0 ? dirStack[depth - 1] : null;

  /* ---------------------------------------------------------------
     ✅ NUEVO: Filtrar archivos según toggle de ocultos
     --------------------------------------------------------------- */
  const filteredFiles = showHiddenFiles
    ? files
    : files.filter((f) => !isHiddenFile(f.name));

  const hiddenCount = files.length - filteredFiles.length;

  /* ---------------------------------------------------------------
     Limpieza de object URLs al desmontar
     --------------------------------------------------------------- */
  const previewsRef = useRef({});
  useEffect(() => {
    previewsRef.current = imagePreviews;
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* ---------------------------------------------------------------
     Persistir preferencias
     --------------------------------------------------------------- */
  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(HIDDEN_TOGGLE_KEY, String(showHiddenFiles));
  }, [showHiddenFiles]);

  /* ---------------------------------------------------------------
     Cargar contenido de un directorio
     --------------------------------------------------------------- */
  const loadDirectory = useCallback(async (dirHandle) => {
    setIsLoading(true);
    setErrorMessage(null);

    setImagePreviews((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });

    try {
      const entries = [];
      for await (const [name, handle] of dirHandle.entries()) {
        const metadata = {
          name: handle.kind === 'directory' ? `${name}/` : name,
          handle,
          kind: handle.kind,
          thumbnail: null, // Nuevo campo
        };
        if (handle.kind === 'file') {
          try {
            metadata.file = await handle.getFile();
              // Si es un archivo de video, generamos su miniatura
              const fileType = getFileType(name);
              // Dentro de loadDirectory en FileExplorer.jsx
              if (fileType.type === 'video') {
                // Genera la miniatura sin detener el bucle principal de renderizado
                generateVideoThumbnail(fileObj).then((thumb) => {
                  if (thumb) {
                    setFiles((prev) =>
                      prev.map((f) => (f.name === entry.name ? { ...f, thumbnail: thumb } : f))
                    );
                  }
                });
              }
          } catch {
            // archivo individual ilegible, se ignora
          }
        }
        entries.push(metadata);
      }

      entries.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      });

      setFiles(entries);

      const newPreviews = {};
      for (const entry of entries) {
        const ft = getFileType(entry.name);
        if (ft.type === 'image' && entry.file) {
          newPreviews[entry.name] = URL.createObjectURL(entry.file);
        }
      }
      setImagePreviews(newPreviews);
    } catch (error) {
      setErrorMessage(`Error al cargar archivos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------------------------
     Sincronizar stack → URL
     --------------------------------------------------------------- */
  useEffect(() => {
    if (!depth) return;
    const path = stackToPath(dirStack.slice(0, depth));
    const current = searchParams.get('path') || '';
    if (path === current) return;
    setSearchParams(pathParams(dirStack.slice(0, depth)), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirStack, depth]);

  /* ---------------------------------------------------------------
     Sincronizar URL → stack (botones ⬅️➡️ del navegador)
     --------------------------------------------------------------- */
  useEffect(() => {
    if (!depth || isLoading || pendingSession) return;

    const segments = pathToSegments(searchParams.get('path') || '');
    const activeSegments = dirStack.slice(1, depth).map((d) => cleanName(d.name));
    if (segKey(segments) === segKey(activeSegments)) return;

    const target = findDepthForPath(dirStack, segments);
    if (!target || target === depth) return;

    setDepth(target);
    loadDirectory(dirStack[target - 1].handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ---------------------------------------------------------------
     Aplicar sesión restaurada
     --------------------------------------------------------------- */
  const applyRestoredSession = async (session) => {
    const { stack } = session;
    let targetDepth = Math.min(session.depth || stack.length, stack.length);

    const segments = pathToSegments(searchParams.get('path') || '');
    if (segments.length > 0) {
      const d = findDepthForPath(stack, segments);
      if (d) targetDepth = d;
    }

    setDirStack(stack);
    setDepth(targetDepth);
    await loadDirectory(stack[targetDepth - 1].handle);
  };

  /* ---------------------------------------------------------------
     Restaurar sesión al montar
     --------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const session = await loadSession();
      if (cancelled) return;

      if (!session?.stack?.length) {
        if (searchParams.get('path')) setSearchParams({}, { replace: true });
        return;
      }

      const { stack } = session;
      let targetDepth = Math.min(session.depth || stack.length, stack.length);
      const segments = pathToSegments(searchParams.get('path') || '');
      if (segments.length > 0) {
        const d = findDepthForPath(stack, segments);
        if (d) targetDepth = d;
      }

      try {
        const handle = stack[targetDepth - 1].handle;
        const permission = await handle.queryPermission({ mode: 'readwrite' });
        if (cancelled) return;

        if (permission === 'granted') {
          await applyRestoredSession({ ...session, depth: targetDepth });
        } else {
          setPendingSession({ stack, depth: targetDepth });
        }
      } catch {
        await clearSession();
        if (searchParams.get('path')) setSearchParams({}, { replace: true });
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (depth > 0 && dirStack.length > 0) {
      saveSession({ stack: dirStack, depth });
    }
  }, [dirStack, depth]);

  /* ---------------------------------------------------------------
     Re-autorizar sesión pendiente
     --------------------------------------------------------------- */
  const restorePendingSession = async () => {
    if (!pendingSession) return;
    setIsRestoring(true);
    setErrorMessage(null);

    try {
      const handle = pendingSession.stack[pendingSession.depth - 1].handle;
      const permission = await handle.requestPermission({ mode: 'readwrite' });

      if (permission === 'granted') {
        await applyRestoredSession(pendingSession);
        setPendingSession(null);
      } else {
        setErrorMessage('Permiso denegado. Selecciona un directorio nuevamente.');
      }
    } catch (e) {
      setErrorMessage(`Error al restaurar sesión: ${e.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const dismissPendingSession = async () => {
    await clearSession();
    setPendingSession(null);
    if (searchParams.get('path')) setSearchParams({}, { replace: true });
  };

  /* ---------------------------------------------------------------
     Seleccionar nuevo directorio
     --------------------------------------------------------------- */
  const selectDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      setErrorMessage('Tu navegador no soporta acceso a archivos. Usa Chrome, Edge u Opera.');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const initialStack = [{ name: handle.name || 'Raíz', handle }];
      setDirStack(initialStack);
      setDepth(1);
      setPendingSession(null);
      setSearchParams({});
      await loadDirectory(handle);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrorMessage(`Error al seleccionar directorio: ${error.message}`);
      }
    }
  };

  /* ---------------------------------------------------------------
     Navegación
     --------------------------------------------------------------- */
  const navigateToDirectory = async (metadata) => {
    const newStack = [...dirStack.slice(0, depth), { name: metadata.name, handle: metadata.handle }];
    setDirStack(newStack);
    setDepth(newStack.length);
    setSearchParams(pathParams(newStack));
    await loadDirectory(metadata.handle);
  };

  const navigateUp = async () => {
    if (depth <= 1) {
      resetExplorer();
      return;
    }
    const newDepth = depth - 1;
    setDepth(newDepth);
    setSearchParams(pathParams(dirStack.slice(0, newDepth)));
    await loadDirectory(dirStack[newDepth - 1].handle);
  };

  const resetExplorer = async () => {
    setDirStack([]);
    setDepth(0);
    setFiles([]);
    setImagePreviews((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    setSearchParams({}, { replace: true });
    await clearSession();
  };

  /* ---------------------------------------------------------------
     Eliminación con animación
     --------------------------------------------------------------- */
  const performDelete = async (entry) => {
    const parentHandle = currentDir?.handle;
    if (!parentHandle || removingFiles.has(entry.name)) return;

    setRemovingFiles((prev) => new Set(prev).add(entry.name));
    await new Promise((r) => setTimeout(r, 320));

    try {
      if (!parentHandle.removeEntry) {
        throw new Error('El navegador no soporta eliminación de archivos.');
      }
      await parentHandle.removeEntry(cleanName(entry.name));

      setFiles((prev) => prev.filter((f) => f.name !== entry.name));
      setImagePreviews((prev) => {
        const url = prev[entry.name];
        if (url) URL.revokeObjectURL(url);
        const rest = { ...prev };
        delete rest[entry.name];
        return rest;
      });
    } catch (e) {
      setErrorMessage(`No se pudo eliminar "${entry.name}": ${e.message}`);
    } finally {
      setRemovingFiles((prev) => {
        const next = new Set(prev);
        next.delete(entry.name);
        return next;
      });
    }
  };

  const handleFileClick = (entry) => {
    if (removingFiles.has(entry.name)) return;
    if (entry.kind === 'directory') return navigateToDirectory(entry);
    if (isJunkFile(entry.name)) return performDelete(entry);
    setViewerEntry(entry);
  };

  const onDeleteClick = (e, entry) => {
    e.stopPropagation();
    setConfirmEntry(entry);
  };

  const confirmDelete = () => {
    const entry = confirmEntry;
    setConfirmEntry(null);
    if (entry) performDelete(entry);
  };

  const onCardKey = (e, entry) => {
    if (e.key === 'Enter') handleFileClick(entry);
  };

  /* ================================================================
     ✅ NUEVO: Clases base para archivos ocultos (estilo gris)
     ================================================================ */
const hiddenClasses = (file, removing) => {
  const hidden = isHiddenFile(file.name);
  const junk = isJunkFile(file.name);
  if (removing) return 'opacity-0 scale-95 pointer-events-none';
  if (junk) return 'border-red-900/40 bg-red-950/10 hover:border-red-700/50';
  if (hidden) return 'border-slate-700/40 bg-slate-800/30 hover:border-indigo-500/40';
  return 'border-slate-700/60 bg-slate-800/50 hover:border-indigo-500/60 hover:bg-slate-800/80';
};

  /* ================================================================
     RENDER HELPERS
     ================================================================ */


const renderItemCard = (file) => {
  const fileType = getFileType(file.name);
  const IconComponent = getFileIcon(fileType.type);

  const isImage = fileType.type === 'image';
  const isVideo = fileType.type === 'video';
  const previewUrl = isImage ? imagePreviews[file.name] : isVideo ? file.thumbnail : null;

  const junk = isJunkFile(file.name);
  const hidden = isHiddenFile(file.name);
  const removing = removingFiles.has(file.name);
  const showX = file.kind === 'file' && !junk;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleFileClick(file)}
      onKeyDown={(e) => onCardKey(e, file)}
      title={junk ? 'Archivo basura de macOS' : hidden ? 'Archivo oculto' : undefined}
      className={`relative group border rounded-xl p-4 text-left cursor-pointer select-none transition-all duration-200 ${hiddenClasses(file, removing)}`}
    >
      {showX && (
        <DeleteXButton onClick={(e) => onDeleteClick(e, file)} className="absolute top-2 right-2" />
      )}

      <div className="flex items-center gap-3">
        {/* Previsualización: Imagen o Miniatura de Video */}
        {previewUrl && !hidden ? (
          <div className="relative w-12 h-12 shrink-0">
            <img
              src={previewUrl}
              alt={file.name}
              className="w-12 h-12 rounded-lg object-cover border border-slate-600/40"
              loading="lazy"
            />
            {isVideo && (
              <div className="absolute bottom-1 right-1 bg-black/80 rounded p-0.5 backdrop-blur-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <span className={hidden ? 'text-slate-400 opacity-80' : 'text-indigo-400'}>
            {IconComponent}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate transition-colors ${
            junk
              ? 'text-slate-600 line-through'
              : hidden
              ? 'text-slate-300' // Gris claro visible
              : 'text-white group-hover:text-indigo-400'
          }`}>
            {file.name}
          </p>
          <p className={`text-xs truncate flex items-center gap-1.5 ${
            junk ? 'text-red-400/70' : hidden ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {junk
              ? 'Basura · click para eliminar'
              : `${fileType.name}${file.file ? ` · ${formatFileSize(file.file.size)}` : ''}`}
            {hidden && !junk && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                oculto
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
  // Vista MASONRY
  const renderMasonry = () => (
    <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-4">
      {filteredFiles.map((file) => {
        const fileType = getFileType(file.name);
        const imageUrl = imagePreviews[file.name];
        const isImage = fileType.type === 'image';
        const removing = removingFiles.has(file.name);
        const hidden = isHiddenFile(file.name);

        if (!isImage || !imageUrl) {
          return (
            <div key={file.name} className="break-inside-avoid mb-4">
              {renderItemCard(file)}
            </div>
          );
        }

        return (
          <div key={file.name} className="break-inside-avoid mb-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleFileClick(file)}
              onKeyDown={(e) => onCardKey(e, file)}
              className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                removing
                  ? 'opacity-0 scale-95 pointer-events-none border-slate-700/50'
                  : hidden
                  ? 'opacity-40 grayscale border-dashed border-slate-600/30 hover:opacity-70'
                  : 'border-slate-700/50 hover:border-indigo-500/60'
              }`}
            >
              <img
                src={imageUrl}
                alt={file.name}
                className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-xs">
                  {fileType.name}
                  {hidden && <span className="ml-1 text-slate-500">· oculto</span>}
                </p>
              </div>
              <DeleteXButton onClick={(e) => onDeleteClick(e, file)} className="absolute top-2 right-2" />
            </div>
          </div>
        );
      })}
    </div>
  );

  // Vista GRID
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredFiles.map((file) => (
        <div key={file.name}>{renderItemCard(file)}</div>
      ))}
    </div>
  );

  // Vista LISTA
  const renderList = () => (
    <div className="space-y-1">
      <div className="grid grid-cols-[auto_1fr_110px_90px_40px] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-700/50">
        <span className="w-8"></span>
        <span>Nombre</span>
        <span>Tipo</span>
        <span className="text-right">Tamaño</span>
        <span></span>
      </div>

      {filteredFiles.map((file) => {
        const fileType = getFileType(file.name);
        const IconComponent = getFileIcon(fileType.type);
        const imageUrl = imagePreviews[file.name];
        const isImage = fileType.type === 'image';
        const junk = isJunkFile(file.name);
        const hidden = isHiddenFile(file.name);
        const removing = removingFiles.has(file.name);
        const showX = file.kind === 'file' && !junk;

        return (
          <div
            key={file.name}
            role="button"
            tabIndex={0}
            onClick={() => handleFileClick(file)}
            onKeyDown={(e) => onCardKey(e, file)}
            className={`group grid grid-cols-[auto_1fr_110px_90px_40px] gap-3 px-4 py-2.5 rounded-lg cursor-pointer select-none items-center transition-all duration-300 ${
              removing
                ? 'opacity-0 scale-95 pointer-events-none'
                : junk
                ? 'opacity-40 hover:opacity-70'
                : hidden
                ? 'opacity-40 hover:opacity-70'
                : 'hover:bg-slate-800/60'
            }`}
          >
            <span className="w-8 flex justify-center">
              {isImage && imageUrl && !hidden ? (
                <img
                  src={imageUrl}
                  alt={file.name}
                  className="w-8 h-8 rounded object-cover border border-slate-600/50"
                  loading="lazy"
                />
              ) : (
                <span className={hidden ? 'opacity-50 grayscale' : ''}>
                  {IconComponent}
                </span>
              )}
            </span>
            <span className={`font-medium truncate transition-colors flex items-center gap-1.5 ${
              junk
                ? 'text-slate-600 line-through'
                : hidden
                ? 'text-slate-500'
                : 'text-white group-hover:text-indigo-400'
            }`}>
              {file.name}
              {hidden && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700/50 text-slate-500 border border-slate-600/30 shrink-0">
                  oculto
                </span>
              )}
            </span>
            <span className={`text-sm truncate ${
              junk ? 'text-red-400/70 font-medium' : hidden ? 'text-slate-600' : 'text-slate-500'
            }`}>
              {junk ? 'Basura' : fileType.name}
            </span>
            <span className={`text-sm text-right ${hidden ? 'text-slate-600' : 'text-slate-500'}`}>
              {file.kind === 'directory' ? '—' : formatFileSize(file.file?.size)}
            </span>
            <span className="justify-self-end">
              {showX && <DeleteXButton onClick={(e) => onDeleteClick(e, file)} />}
            </span>
          </div>
        );
      })}
    </div>
  );

  /* ================================================================
     RENDER PRINCIPAL
     ================================================================ */
  return (
    <div className="h-full flex flex-col">
      {/* Banner de sesión pendiente */}
      {pendingSession && !currentDir && (
        <div className="mx-6 mt-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-indigo-200 text-sm font-medium">📂 Sesión anterior encontrada</p>
            <p className="text-indigo-400/70 text-xs mt-1 font-mono">
              Ruta: /{pendingSession.stack.slice(0, pendingSession.depth).map((d) => cleanName(d.name)).join('/')}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={restorePendingSession}
              disabled={isRestoring}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isRestoring ? 'Restaurando…' : 'Restaurar'}
            </button>
            <button
              onClick={dismissPendingSession}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Explorador de Archivos</h1>
          <p className="text-slate-400 text-sm">
            Accede a archivos de tu dispositivo. Los archivos permanecen en tu computadora.
          </p>
          {currentDir && (
            <p className="text-indigo-400 text-xs mt-1 font-mono">
              Ruta: /{dirStack.slice(0, depth).map((d) => cleanName(d.name)).join('/')}
            </p>
          )}
        </div>

        {!currentDir ? (
          <button
            onClick={selectDirectory}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-label="Seleccionar directorio">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <line x1="12" y1="9" x2="12" y2="17" />
            </svg>
            Seleccionar Directorio
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={navigateUp}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-label="Retroceder">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
              Subir
            </button>
            <button
              onClick={selectDirectory}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-label="Cambiar directorio">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mx-6 mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3" aria-label="Cargando" />
            <p className="text-slate-400">Cargando archivos...</p>
          </div>
        </div>
      )}

      {/* Contenido + toolbar */}
      {!isLoading && currentDir && files.length > 0 && (
        <>
          <div className="px-6 pt-4 flex flex-col gap-3">
            {/* Fila 1: contador + toggle de ocultos + toggle de vistas */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4">
                <p className="text-slate-500 text-sm">
                  {filteredFiles.length} elemento{filteredFiles.length !== 1 && 's'}
                  {!showHiddenFiles && hiddenCount > 0 && (
                    <span className="text-slate-600 ml-1">
                      ({hiddenCount} oculto{hiddenCount !== 1 && 's'})
                    </span>
                  )}
                </p>

                {/* ✅ NUEVO: Interruptor de archivos ocultos */}
                <ToggleSwitch
                  checked={showHiddenFiles}
                  onChange={() => setShowHiddenFiles((v) => !v)}
                  label="Ocultos"
                />
              </div>

              <div className="flex bg-slate-800/60 rounded-lg p-1 border border-slate-700/50">
                {[
                  { key: 'masonry', label: 'Masonry', icon: <path d="M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z" /> },
                  { key: 'grid', label: 'Grid', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></> },
                  { key: 'list', label: 'Lista', icon: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></> },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === mode.key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                    aria-label={`Vista ${mode.label}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      {mode.icon}
                    </svg>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 2: hint de archivos basura */}
            {showHiddenFiles && files.some((f) => isJunkFile(f.name)) && (
              <p className="text-slate-600 text-xs">
                💡 Click en archivos <span className="font-mono text-red-400/70">._*</span> para eliminarlos directamente
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {viewMode === 'masonry' && renderMasonry()}
            {viewMode === 'grid' && renderGrid()}
            {viewMode === 'list' && renderList()}
          </div>
        </>
      )}

      {/* Directorio vacío */}
      {!isLoading && currentDir && files.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-slate-600 mx-auto mb-3" aria-label="Directorio vacío">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <h3 className="text-xl font-medium text-slate-400 mb-2">Directorio vacío</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Este directorio no contiene archivos o subcarpetas</p>
          </div>
        </div>
      )}

      {/* ✅ NUEVO: Directorio con archivos pero todos ocultos */}
      {!isLoading && currentDir && files.length > 0 && filteredFiles.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-slate-700 mx-auto mb-3" aria-label="Archivos ocultos">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <h3 className="text-xl font-medium text-slate-400 mb-2">Solo hay archivos ocultos</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-4">
              Este directorio contiene {files.length} archivo{files.length !== 1 && 's'} oculto{files.length !== 1 && 's'}
            </p>
            <button
              onClick={() => setShowHiddenFiles(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Mostrar archivos ocultos
            </button>
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!isLoading && !currentDir && !pendingSession && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg" style={{ paddingTop: '15%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-indigo-500 mx-auto mb-3" aria-label="Seleccionar directorio">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M13 13v6" />
              <path d="M16 16l-3-3-3 3" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">
              Selecciona un directorio de tu computadora
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Si usas Brave, ábrelo en la dirección:
              <br /><br />
              <strong>brave://flags/#file-system-access-api</strong><br /><br />
              Cambia el estado a <strong>Enabled</strong> y reinicia el navegador.
              <span className="text-slate-600 text-sm block mt-2">
                Los archivos no se suben a ningún servidor, quedan en tu dispositivo.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Modales */}
      {viewerEntry && <FileViewer entry={viewerEntry} onClose={() => setViewerEntry(null)} />}
      {confirmEntry && (
        <ConfirmDialog
          entry={confirmEntry}
          onCancel={() => setConfirmEntry(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default FileExplorer;