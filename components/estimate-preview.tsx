"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import type { SpreadsheetItem } from "@/app/api/spreadsheet/route"
import { useState } from "react"

interface EstimatePreviewProps {
  store: string
  items: SpreadsheetItem[]
  onBack: () => void
  onSend: () => Promise<void>
}

export function EstimatePreview({ store, items, onBack, onSend }: EstimatePreviewProps) {
  const [sending, setSending] = useState(false)
  const total = items.reduce((sum, item) => sum + item.price, 0)
  const currentDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const canSendToChat = store !== "前橋50号店"

  const handleSend = async () => {
    setSending(true)
    try {
      await onSend()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">見積書プレビュー</h1>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 md:p-8 space-y-6">
          {/* ヘッダー */}
          <div className="space-y-2 border-b border-border pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">見積書</h2>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>

          {/* 店舗情報 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">店舗</h3>
            <p className="text-lg font-semibold text-foreground">{store}</p>
          </div>

          {/* 項目リスト */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">項目明細</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={`${item.itemName}-${index}`}
                  className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">¥{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 合計 */}
          <div className="pt-4 border-t-2 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">合計金額</span>
              <span className="text-2xl md:text-3xl font-bold text-primary">¥{total.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {canSendToChat ? (
          <Button className="w-full" size="lg" onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Google Chatに送信
              </>
            )}
          </Button>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            この店舗はGoogle Chat送信機能が利用できません
          </div>
        )}
      </div>
    </div>
  )
}
