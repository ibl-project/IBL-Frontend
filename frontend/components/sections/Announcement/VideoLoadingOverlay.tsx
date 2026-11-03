"use client";

import React, { useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface VideoLoadingOverlayProps {
  onVideoEnd: () => void;
  videoType: "lolos" | "tidak_lolos";
}

const subscribeNoop = () => () => {};

export default function VideoLoadingOverlay({ onVideoEnd, videoType }: VideoLoadingOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // True only on the client, so createPortal can safely access document.body
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  useEffect(() => {
    // Ensure the video and audio play on mount
    if (mounted) {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay was blocked or video play failed:", err);
        });
      }
      if (audioRef.current) {
        audioRef.current.volume = 0.35; // Set volume to 35% (besarin dikit)
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay was blocked or audio play failed:", err);
        });
      }

      // Prevent pausing when switching tabs/apps
      const video = videoRef.current;
      const audio = audioRef.current;

      const forcePlay = () => {
        if (video && video.paused && video.currentTime < (video.duration || 100)) {
          video.play().catch(() => {});
        }
        if (audio && audio.paused && audio.currentTime < (audio.duration || 100)) {
          audio.play().catch(() => {});
        }
      };

      // Attach listeners to forcefully resume playback if the browser pauses it
      if (video) video.addEventListener("pause", forcePlay);
      if (audio) audio.addEventListener("pause", forcePlay);
      document.addEventListener("visibilitychange", forcePlay);
      window.addEventListener("blur", forcePlay);
      window.addEventListener("focus", forcePlay);

      return () => {
        if (video) video.removeEventListener("pause", forcePlay);
        if (audio) audio.removeEventListener("pause", forcePlay);
        document.removeEventListener("visibilitychange", forcePlay);
        window.removeEventListener("blur", forcePlay);
        window.removeEventListener("focus", forcePlay);
      };
    }
  }, [mounted]);

  if (!mounted) return null;

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "black",
        zIndex: 9999,
        animation: "fadeInOverlay 1.5s ease-out forwards",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInOverlay {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `,
        }}
      />
      <audio
        ref={audioRef}
        src="/audio/bbc_drums---lo_07011243.mp3"
        preload="auto"
      />
      <video
        ref={videoRef}
        src={videoType === "lolos" ? "/video/AnnouncementVideo/Success.mp4" : "/video/AnnouncementVideo/Miss.mp4"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        playsInline
        muted
        onEnded={onVideoEnd}
      />
    </div>
  );

  // Render directly into document.body to bypass PageScaleWrapper's CSS transform
  // stacking context which would otherwise limit fixed positioning to the wrapper bounds
  return createPortal(overlay, document.body);
}
