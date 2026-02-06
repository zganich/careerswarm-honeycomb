import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";
import * as React from "react";

function Input({
  className,
  type,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: React.ComponentProps<"input">) {
  // Get dialog composition context if available (will be no-op if not inside Dialog)
  const dialogComposition = useDialogComposition();

  // Add composition event handlers to support input method editor (IME) for CJK languages.
  const {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  } = useComposition<HTMLInputElement>({
    onKeyDown: e => {
      // Check if this is an Enter key that should be blocked
      const isComposing =
        (e.nativeEvent as any).isComposing ||
        dialogComposition.justEndedComposing();

      // If Enter key is pressed while composing or just after composition ended,
      // don't call the user's onKeyDown (this blocks the business logic)
      if (e.key === "Enter" && isComposing) {
        return;
      }

      // Otherwise, call the user's onKeyDown
      onKeyDown?.(e);
    },
    onCompositionStart: e => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: e => {
      // Mark that composition just ended - this helps handle the Enter key that confirms input
      dialogComposition.markCompositionEnd();
      // Delay setting composing to false to handle Safari's event order
      // In Safari, compositionEnd fires before the ESC keydown event
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Light beige background, warm yellow border, charcoal text
        "bg-[#F9F5EF] dark:bg-[#3A3D44] border-[#F4E5A1] text-[#2A2D34] dark:text-[#F9F5EF]",
        "placeholder:text-[#8C8C8C] placeholder:italic",
        "file:text-foreground selection:bg-[#E8D399] selection:text-[#2A2D34]",
        "h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base shadow-none transition-all outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        // Focus state: Honey Gold border with ring
        "focus-visible:border-[#E8D399] focus-visible:ring-2 focus-visible:ring-[#E8D399]/30",
        // Invalid state: Soft Coral
        "aria-invalid:ring-[#F5E3E0]/40 dark:aria-invalid:ring-[#F5E3E0]/20 aria-invalid:border-[#F5E3E0]",
        className
      )}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export { Input };
