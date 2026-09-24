"use client";
import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function YouTubeEmbed({
  src,
  title,
  className = "",
  wrapperClassName = "relative h-full w-full",
}: {
  src: string;
  title: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);

  const cmd = (func: string) =>
    ref.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    );

  const toggle = () => {
    const next = !muted;
    cmd(next ? "mute" : "unMute");
    if (!next) cmd("playVideo");
    setMuted(next);
  };

  const withJsApi =
    src + (src.includes("enablejsapi") ? "" : src.includes("?") ? "&enablejsapi=1" : "?enablejsapi=1");

  return (
    <div className={wrapperClassName}>
      <iframe
        ref={ref}
        src={withJsApi}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
