import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"

export interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: CollapsibleSectionProps) {
  const [isOpenState, setIsOpenState] = React.useState(defaultOpen)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : isOpenState

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setIsOpenState(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-foreground text-lg">{title}</Label>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => handleOpenChange(!isOpen)}
        >
          {isOpen ? '收起' : '展开'}
        </Button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
