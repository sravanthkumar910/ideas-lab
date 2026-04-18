import { useEffect, useRef } from "react";

export function BlobBackground() {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${x * 25}px, ${y * 25}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none" aria-hidden="true">
      <div
        ref={blob1Ref}
        className="fixed -top-20 -left-20 w-[600px] h-[600px] rounded-full opacity-100 animate-blob"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.18) 0%, rgba(124,58,237,0.12) 60%, transparent 100%)",
          filter: "blur(80px)",
          zIndex: 0,
          willChange: "transform",
          transition: "transform 0.1s linear",
        }}
      />
      <div
        ref={blob2Ref}
        className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-blob-2"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.14) 0%, rgba(244,63,94,0.08) 60%, transparent 100%)",
          filter: "blur(80px)",
          zIndex: 0,
          willChange: "transform",
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
}
