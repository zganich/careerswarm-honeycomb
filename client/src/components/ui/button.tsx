import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: Honey background, Charcoal text, no border, matte finish
        default: "bg-[#D4A55B] text-[#1A1D24] hover:bg-[#C49550] active:bg-[#B48545] rounded-[4px] shadow-none",
        
        // Secondary: Clay background, Charcoal text, 1px Slate border
        secondary: "bg-[#8C7A6B] text-white hover:bg-[#7C6A5B] active:bg-[#6C5A4B] border border-[#6C7D8C] rounded-[4px] shadow-none",
        
        // Tertiary: Text only with Honey underline on hover
        tertiary: "bg-transparent text-[#2A2D34] dark:text-[#D8D8D8] hover:underline hover:decoration-[#D4A55B] hover:underline-offset-4 rounded-none shadow-none",
        
        // Destructive: Terra Cotta
        destructive: "bg-[#B46A55] text-white hover:bg-[#A45A45] active:bg-[#944A35] rounded-[4px] shadow-none",
        
        // Outline: Transparent with border
        outline: "border border-[#8C7A6B] bg-transparent text-[#2A2D34] dark:text-[#D8D8D8] hover:bg-[#8C7A6B]/10 dark:hover:bg-[#8C7A6B]/20 rounded-[4px] shadow-none",
        
        // Ghost: Minimal hover state
        ghost: "bg-transparent text-[#2A2D34] dark:text-[#D8D8D8] hover:bg-[#D8D8D8]/20 dark:hover:bg-[#6C7D8C]/20 rounded-[4px] shadow-none",
        
        // Link: Simple text link
        link: "text-[#D4A55B] underline-offset-4 hover:underline rounded-none shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
