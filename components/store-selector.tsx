"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const STORES = ["前橋50号店", "伊勢崎韮塚店", "高崎棟高店", "足利緑町店", "新前橋店", "太田新田店"]

interface StoreSelectorProps {
  selectedStore: string | null
  onSelectStore: (store: string) => void
}

export function StoreSelector({ selectedStore, onSelectStore }: StoreSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">店舗を選択</h2>
      <div className="grid grid-cols-2 gap-2">
        {STORES.map((store) => (
          <Button
            key={store}
            variant={selectedStore === store ? "default" : "outline"}
            className="h-auto py-3 px-4 text-left justify-start relative"
            onClick={() => onSelectStore(store)}
          >
            <span className="text-sm font-medium">{store}</span>
            {selectedStore === store && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />}
          </Button>
        ))}
      </div>
    </div>
  )
}
