"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function DraggableDialog({
  open,
  onOpenChange,
  children,
  className,
}: DraggableDialogProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDragHandle, setShowDragHandle] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset position when dialog opens
  useEffect(() => {
    if (open) {
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the drag handle area
    const target = e.target as HTMLElement;
    if (!target.closest(".drag-handle-area")) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get dialog dimensions
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const dialogWidth = dialogElement.offsetWidth;
    const dialogHeight = dialogElement.offsetHeight;

    // Calculate boundaries
    const maxX = (viewportWidth - dialogWidth) / 2;
    const maxY = (viewportHeight - dialogHeight) / 2;
    const minX = -maxX;
    const minY = -maxY;

    // Constrain position within viewport
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className={cn(
          "transition-none",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Drag handle area - visible on hover near top border */}
        <div
          className="drag-handle-area absolute -top-8 left-0 right-0 h-12 flex items-end justify-center cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setShowDragHandle(true)}
          onMouseLeave={() => !isDragging && setShowDragHandle(false)}
        >
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-t-lg transition-all duration-200",
              "bg-background/95 backdrop-blur-sm border border-b-0 shadow-sm",
              showDragHandle || isDragging
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">拖动</span>
          </div>
        </div>

        {/* Hover area at the top edge of dialog */}
        <div
          className="absolute top-0 left-0 right-0 h-8 drag-handle-area cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setShowDragHandle(true)}
          onMouseLeave={() => !isDragging && setShowDragHandle(false)}
        />

        {children}
      </DialogContent>
    </Dialog>
  );
}
