import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-(--r8,8px) border-2 border-(--bor) bg-(--sur) px-2.5 py-2 text-[13px] leading-[1.55] transition-colors duration-150 outline-none placeholder:text-(--t3) focus-visible:border-(--cy) focus-visible:ring-3 focus-visible:ring-(--cy)/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
