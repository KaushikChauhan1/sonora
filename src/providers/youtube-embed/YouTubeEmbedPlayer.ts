export type PlayerEventType = 'ready' | 'stateChange' | 'timeUpdate' | 'error';

export interface PlayerEvents {
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number, buffered: number) => void;
  onError?: (errorCode: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export class YouTubeEmbedPlayer {
  private player: any = null;
  private isPlayerReady: boolean = false;
  private containerId: string;
  private events: PlayerEvents;
  private timeUpdateInterval: number | null = null;
  private pendingVideoId: string | null = null;

  constructor(containerId: string, events: PlayerEvents = {}) {
    this.containerId = containerId;
    this.events = events;
    this.initApi();
  }

  private initApi() {
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    // Save previous callback if any
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      this.createPlayer();
    };

    // Load iframe script if not already added
    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }

  private createPlayer() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      setTimeout(() => this.createPlayer(), 100);
      return;
    }

    try {
      this.player = new window.YT.Player(this.containerId, {
        height: '100%',
        width: '100%',
        videoId: this.pendingVideoId || '4NRXx6U8ABQ',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.isPlayerReady = true;
            this.startTimeTicker();
            if (this.pendingVideoId) {
              this.loadVideo(this.pendingVideoId);
              this.pendingVideoId = null;
            }
            if (this.events.onReady) this.events.onReady();
          },
          onStateChange: (e: any) => {
            if (this.events.onStateChange) this.events.onStateChange(e.data);
          },
          onError: (e: any) => {
            console.warn('YouTube Player error code:', e.data);
            if (this.events.onError) this.events.onError(e.data);
          },
        },
      });
    } catch (err) {
      console.error('Failed to instantiate YouTube player:', err);
    }
  }

  private startTimeTicker() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    this.timeUpdateInterval = window.setInterval(() => {
      if (!this.player || !this.isPlayerReady) return;
      try {
        const currentTime = this.player.getCurrentTime?.() || 0;
        const duration = this.player.getDuration?.() || 0;
        const buffered = (this.player.getVideoLoadedFraction?.() || 0) * duration;
        if (this.events.onTimeUpdate) {
          this.events.onTimeUpdate(currentTime, duration, buffered);
        }
      } catch {
        // Ignored
      }
    }, 150);
  }

  public loadVideo(videoId: string) {
    if (!this.isPlayerReady || !this.player) {
      this.pendingVideoId = videoId;
      return;
    }
    try {
      this.player.loadVideoById({
        videoId,
        startSeconds: 0,
      });
    } catch (err) {
      console.warn('loadVideo error:', err);
    }
  }

  public play() {
    if (this.player && this.isPlayerReady && this.player.playVideo) {
      try {
        this.player.playVideo();
      } catch (err) {
        console.warn('playVideo error:', err);
      }
    }
  }

  public pause() {
    if (this.player && this.isPlayerReady && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch (err) {
        console.warn('pauseVideo error:', err);
      }
    }
  }

  public seekTo(seconds: number) {
    if (this.player && this.isPlayerReady && this.player.seekTo) {
      try {
        this.player.seekTo(seconds, true);
      } catch (err) {
        console.warn('seekTo error:', err);
      }
    }
  }

  public setVolume(volume: number) {
    if (this.player && this.isPlayerReady && this.player.setVolume) {
      try {
        this.player.setVolume(Math.min(100, Math.max(0, volume)));
      } catch (err) {
        console.warn('setVolume error:', err);
      }
    }
  }

  public destroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
    if (this.player && this.player.destroy) {
      try {
        this.player.destroy();
      } catch {}
      this.player = null;
    }
    this.isPlayerReady = false;
  }
}
