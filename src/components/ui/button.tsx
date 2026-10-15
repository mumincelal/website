import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-mono transition-[color,background-color,border-color] duration-300 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        /** Bordered square on the card ground: prev / next, arrows, theme toggle. */
        outline:
          "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
        /** Hairline call to action that floods with the accent on hover. */
        line: "border text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground",
        /** Text-only mono control: back links, "All works →". */
        ghost: "text-muted-foreground hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "px-[9px] py-[5px] text-[11px] tracking-normal",
        sm: "px-[11px] py-[6px] text-[10px] tracking-[0.12em]",
        lg: "min-h-11 px-[clamp(15px,1.5vw,21px)] py-[clamp(13px,1.2vh,15px)] text-[10px] tracking-[0.16em] uppercase",
        icon: "size-9",
        /** Bare text control; its tap area grows invisibly on touch screens. */
        none: "p-0 pointer-coarse:hit-area"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

/** Base UI Button. Compose with another element through the `render` prop. */
function Button({
  className,
  variant,
  size,
  ...props
}: Omit<ButtonPrimitive.Props, "className"> &
  VariantProps<typeof buttonVariants> & { className?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
