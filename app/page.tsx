"use client"

import { useState, useEffect } from "react"
import { StoreSelector } from "@/components/store-selector"
import { CategorySelector } from "@/components/category-selector"
import { EstimateList } from "@/components/estimate-list"
import { EstimatePreview } from "@/components/estimate-preview"
import { Button } from "@/components/ui/button"
import { Loader2, FileText } from "lucide-react"
import type { SpreadsheetItem } from "@/app/api/spreadsheet/route"

export default function Home() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [items, setItems] = useState<SpreadsheetItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SpreadsheetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/spreadsheet")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("[v0] データ取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = (item: SpreadsheetItem) => {
    setSelectedItems([...selectedItems, item])
  }

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  const handlePreview = () => {
    if (!selectedStore || selectedItems.length === 0) {
      alert("店舗と項目を選択してください")
      return
    }
    setShowPreview(true)
  }

  const handleSendToChat = async () => {
    try {
      const TAX_RATE = 0.1
      const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0)
      const tax = Math.floor(subtotal * TAX_RATE)
      const total = subtotal + tax

      console.log("[v0] 送信データ:", {
        store: selectedStore,
        itemsCount: selectedItems.length,
        subtotal,
        tax,
        total,
      })

      const response = await fetch("/api/send-to-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store: selectedStore,
          items: selectedItems,
          subtotal,
          tax,
          total,
        }),
      })

      console.log("[v0] レスポンスステータス:", response.status)

      const responseData = await response.json()
      console.log("[v0] レスポンスデータ:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "送信に失敗しました")
      }

      alert("見積書をGoogle Chatに送信しました！")
      // リセット
      setSelectedStore(null)
      setSelectedItems([])
      setShowPreview(false)
    } catch (error) {
      console.error("[v0] 送信エラー:", error)
      const errorMessage = error instanceof Error ? error.message : "送信に失敗しました"
      alert(`送信に失敗しました: ${errorMessage}\n\nもう一度お試しください。`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showPreview && selectedStore) {
    return (
      <EstimatePreview
        store={selectedStore}
        items={selectedItems}
        onBack={() => setShowPreview(false)}
        onSend={handleSendToChat}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">見積書作成</h1>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StoreSelector selectedStore={selectedStore} onSelectStore={setSelectedStore} />
            <CategorySelector items={items} onAddItem={handleAddItem} />
          </div>

          <div className="space-y-4">
            <EstimateList items={selectedItems} onRemoveItem={handleRemoveItem} />
            <Button
              className="w-full"
              size="lg"
              onClick={handlePreview}
              disabled={!selectedStore || selectedItems.length === 0}
            >
              <FileText className="h-5 w-5 mr-2" />
              見積書を作成
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
