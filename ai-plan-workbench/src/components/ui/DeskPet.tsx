"use client";
import { useState, useEffect, useRef } from "react";

export function DeskPet({ message }: { message: string | null }) {
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 150 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <div
      className="fixed z-50 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform"
      style={{ left: `${position.x}px`, top: `${position.y}px`, transform: isDragging ? "scale(1.1)" : "scale(1)" }}
      onMouseDown={handleMouseDown}
    >
      {/* 梯形说话框 (Trapezoid Speech Bubble) */}
      <div 
        className={`mb-2 py-2 px-4 bg-[var(--paper)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-opacity duration-300 ${message ? "opacity-100 animate-bounce" : "opacity-0"}`}
        style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0% 100%)" }}
      >
        <p className="text-sm font-black text-[var(--ink)] text-center drop-shadow-sm min-w-[100px]">
          {message || "..."}
        </p>
      </div>

      {/* 宠物本体 */}
      <div className="relative group">
        <div className="w-16 h-16 bg-[var(--sun)] rounded-2xl rotate-45 border-2 border-[var(--glass-border)] shadow-[0_0_15px_var(--sun)] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:rotate-90 group-hover:scale-110">
          <div className="-rotate-45 text-3xl drop-shadow-md">
            {message ? "🤩" : "😎"}
          </div>
        </div>
      </div>
    </div>
  );
}