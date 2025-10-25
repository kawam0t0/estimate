"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { SpreadsheetItem } from "@/app/api/spreadsheet/route"

interface EstimateListProps {
  items: SpreadsheetItem[]
  onRemoveItem: (index: number) => void
}

export function EstimateList({ items, onRemoveItem }: EstimateListProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <Card className="p-4 sticky top-4">
      <h2 className="text-lg font-semibold mb-3 text-foreground">見積書</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">項目を追加してください</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.itemName}-${index}`}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.itemName}</p>
                <p className="text-xs text-muted-foreground">¥{item.price.toLocaleString()}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onRemoveItem(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">合計</span>
              <span className="text-lg font-bold text-primary">¥{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
