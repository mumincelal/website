import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

function Tabs({
  className,
  ...props
}: WithClassName<TabsPrimitive.Root.Props>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva("inline-flex w-fit items-center justify-center", {
  variants: {
    variant: {
      default: "h-9 rounded-lg bg-muted p-[3px] text-muted-foreground",
      /** Bare row of indices with an accent underline on the active one. */
      line: "gap-[clamp(8px,1vw,16px)]"
    }
  },
  defaultVariants: { variant: "default" }
});

function TabsList({
  className,
  variant,
  ...props
}: WithClassName<TabsPrimitive.List.Props> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    />
  );
}

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap data-disabled:pointer-events-none data-disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "h-[calc(100%-1px)] flex-1 gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium text-foreground transition-[color,box-shadow] data-active:bg-background data-active:shadow-sm",
        line: "border-b border-transparent pb-[3px] pointer-coarse:hit-area pointer-coarse:min-w-6 font-mono text-[10px] tracking-[0.14em] text-faint uppercase transition-[color,border-color] duration-300 hover:text-primary data-active:border-primary data-active:text-primary"
      }
    },
    defaultVariants: { variant: "default" }
  }
);

function TabsTrigger({
  className,
  variant,
  ...props
}: WithClassName<TabsPrimitive.Tab.Props> &
  VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: WithClassName<TabsPrimitive.Panel.Props>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
