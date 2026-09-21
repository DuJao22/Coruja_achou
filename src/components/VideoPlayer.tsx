import React from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

/**
 * Extracts YouTube embed URL from various YouTube link formats
 * (e.g. youtube.com/watch?v=xyz, youtu.be/xyz, youtube.com/shorts/xyz, youtube.com/embed/xyz)
 */
export function getYouTubeEmbedUrl(url: string, autoPlay = false, muted = true): string | null {
  if (!url) return null;

  try {
    // YouTube Shorts: youtube.com/shorts/ID
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) {
      const videoId = shortsMatch[1];
      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
      });
      if (autoPlay) {
        params.set('autoplay', '1');
        if (muted) params.set('mute', '1');
      }
      return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    }

    // Direct embed or already formatted
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Vimeo: vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=1`;
    }
  } catch (e) {
    console.error('Error parsing video url', e);
  }

  return null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = 'Vídeo do Produto',
  className = 'w-full h-full rounded-2xl overflow-hidden',
  autoPlay = false,
  controls = true,
  loop = true,
  muted = false,
}) => {
  if (!url) return null;

  const youtubeUrl = getYouTubeEmbedUrl(url, autoPlay, muted);

  if (youtubeUrl) {
    return (
      <div className={`relative aspect-video bg-black overflow-hidden ${className}`}>
        <iframe
          src={youtubeUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    );
  }

  // Direct MP4 / WebM / OGG video file
  return (
    <div className={`relative aspect-video bg-black overflow-hidden ${className}`}>
      <video
        src={url}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        className="w-full h-full object-contain"
      >
        <track kind="captions" />
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
    </div>
  );
};
