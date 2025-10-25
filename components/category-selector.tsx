"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, ArrowLeft } from "lucide-react"
import type { SpreadsheetItem } from "@/app/api/spreadsheet/route"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CategorySelectorProps {
  items: SpreadsheetItem[]
  onAddItem: (item: SpreadsheetItem) => void
}

export function CategorySelector({ items, onAddItem }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, SpreadsheetItem[]>,
  )

  const categories = Object.keys(groupedItems)

  const handleAddItem = (item: SpreadsheetItem) => {
    onAddItem(item)
    toast({
      title: "アイテムが追加されました",
      description: `${item.itemName} を見積書に追加しました`,
    })
  }

  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">カテゴリーを選択</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="lg"
              onClick={() => setSelectedCategory(category)}
              className="h-20 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-1" />
          戻る
        </Button>
        <h2 className="text-lg font-semibold text-foreground">{selectedCategory}</h2>
      </div>

      <div className="space-y-2">
        {groupedItems[selectedCategory].map((item, index) => (
          <Card key={`${item.itemName}-${index}`} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">{item.itemName}</p>
                <p className="text-lg font-semibold text-primary">¥{(item.price ?? 0).toLocaleString()}</p>
              </div>
              <Button size="default" onClick={() => handleAddItem(item)} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
