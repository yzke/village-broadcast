import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string;
  hasStream?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function VideoPlayer({
  hlsUrl,
  hasStream = true,
  autoPlay = true,
  muted = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 如果没有直播流，不尝试加载
    if (!hasStream || !hlsUrl) {
      setError(null);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setError(null);

    // 检查浏览器是否支持 HLS
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // 浏览器可能阻止自动播放，需要用户交互
            console.log('Auto-play blocked, waiting for user interaction');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error:', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error:', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error:', data);
              setError('视频加载失败');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持 HLS
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().catch(() => {
            console.log('Auto-play blocked, waiting for user interaction');
          });
        }
      });

      video.addEventListener('error', () => {
        setError('视频加载失败');
      });
    } else {
      setError('您的浏览器不支持 HLS 播放');
    }
  }, [hlsUrl, hasStream, autoPlay]);

  // 全屏状态监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen().catch((err) => {
        console.error('全屏失败:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // 无流状态 - 显示占位符
  if (!hasStream) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-900">
        {/* 不需要渲染任何内容，因为 Live 页面已经覆盖了未开播提示 */}
        <video
          ref={videoRef}
          className="w-full h-full opacity-0"
          playsInline
          muted={muted}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full group">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        muted={muted}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white">
            <p className="text-xl mb-2">视频加载失败</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {/* 播放/暂停按钮（悬停显示） */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
          {isPlaying ? (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </button>

      {/* 控制栏（底部） */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          {/* 播放/暂停按钮 */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-amber-400 transition-colors"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-amber-400 transition-colors"
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
