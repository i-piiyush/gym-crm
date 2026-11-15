"use client";
import * as React from "react";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Sheet = Primitive.Root;
export const SheetTrigger = Primitive.Trigger;
export const SheetClose = Primitive.Close;
export const SheetTitle = Primitive.Title;
export const SheetDescription = Primitive.Description;
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content> & {
    side?: "left" | "right";
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/25 backdrop-blur-sm" />
    <Primitive.Content
      ref={ref}
      data-side={side}
      className={cn(
        "sheet-content fixed inset-y-0 z-50 flex w-[min(90vw,480px)] flex-col overflow-y-auto border-border bg-card p-6 shadow-xl",
        side === "left" ? "left-0 border-r" : "right-0 border-l",
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Close className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
        <X className="size-4" />
        <span className="sr-only">Close panel</span>
      </Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>
));
SheetContent.displayName = "SheetContent";
