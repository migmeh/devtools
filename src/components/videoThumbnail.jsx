export const generateVideoThumbnail = (file) => {
  return new Promise((resolve) => {
    if (!file) return resolve(null);

    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    // Timeout de 2s por si el video viene corrupto o sin pista de video
    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 2000);

    // 1. Esperar a que la metadata cargue ANTES de mover la línea de tiempo
    video.onloadedmetadata = () => {
      // Avanza a 1 segundo o a la mitad si dura menos
      video.currentTime = Math.min(1, video.duration / 2 || 0.5);
    };

    // 2. Una vez posicionado en el fotograma, se dibuja en el canvas
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        clearTimeout(timer);
        cleanup();
        resolve(dataUrl);
      } catch {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      }
    };

    video.onerror = () => {
      clearTimeout(timer);
      cleanup();
      resolve(null);
    };

    // Asignar la URL al final para activar la cadena de eventos
    video.src = url;
  });
};