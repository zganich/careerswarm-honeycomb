import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: Matte Orange background, White text, rounded, matte finish
        default: "bg-[#E8934C] text-white hover:bg-[#D67F3A] active:bg-[#C46B28] rounded-lg shadow-none border-none",
        
        // Secondary: Soft Amber background, Charcoal text, light yellow border
        secondary: "bg-[#D4A574] text-[#2A2D34] hover:bg-[#C89563] active:bg-[#BC8552] border border-[#F4E5A1] rounded-lg shadow-none",
        
        // Tertiary: Text only with Honey Gold underline on hover
        tertiary: "bg-transparent text-[#2A2D34] dark:text-[#F9F5EF] hover:underline hover:decoration-[#E8D399] hover:underline-offset-4 rounded-none shadow-none",
        
        // Destructive: Soft Coral with darker text
        destructive: "bg-[#F5E3E0] text-[#8C3A2B] hover:bg-[#EDD3CF] active:bg-[#E5C3BE] rounded-lg shadow-none border border-[#F4E5A1]",
        
        // Outline: Transparent with warm yellow border
        outline: "border border-[#F4E5A1] bg-transparent text-[#2A2D34] dark:text-[#F9F5EF] hover:bg-[#F4E5A1]/20 dark:hover:bg-[#F4E5A1]/10 rounded-lg shadow-none",
        
        // Ghost: Minimal hover state with light beige
        ghost: "bg-transparent text-[#2A2D34] dark:text-[#F9F5EF] hover:bg-[#F9F5EF] dark:hover:bg-[#5A5A5A]/20 rounded-lg shadow-none",
        
        // Link: Honey Gold text link
        link: "text-[#E8D399] underline-offset-4 hover:underline rounded-none shadow-none",
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
