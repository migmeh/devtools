const getFileIcon = (type, name) => {
  type = type || name?.split('.').pop()?.toLowerCase() || 'file';

  switch (type) {
    case 'image':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
    case 'svg':
    case 'svg+xml':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-purple-400"
          aria-label="Imagen"
          role="img"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );

    case 'text':
    case 'json':
    case 'txt':
    case 'javascript':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-blue-400"
          aria-label="Archivo de texto"
          role="img"
        >
          <polyline points="14 2 6 2 6 18" />
          <polyline points="8 14 14 20 20 14" />
          <line x1="14" y1="2" x2="14" y2="18" />
          <line x1="8" y1="14" x2="14" y2="8" />
        </svg>
      );

    case 'video':
    case 'mp4':
    case 'mov':
    case 'webm':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-red-400"
          aria-label="Video"
          role="img"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );

    case 'audio':
    case 'mp3':
    case 'wav':
    case 'ogg':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-yellow-400"
          aria-label="Audio"
          role="img"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );

    case 'folder':
    case 'directory':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-yellow-500"
          aria-label="Carpeta"
          role="img"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );

    case 'code':
    case 'html':
    case 'css': 
    case 'py': 
    case 'rust': 
    case 'dart': 
    case 'java':
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-green-400"
          aria-label="Archivo de código"
          role="img"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'system':
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-slate-600"
      aria-label="Archivo de sistema"
      role="img"
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-slate-400"
          aria-label="Archivo"
          role="img"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      );
  }
};

export default getFileIcon;