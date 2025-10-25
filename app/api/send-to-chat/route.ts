import { NextResponse } from "next/server"

const STORE_WEBHOOK_MAP: Record<string, string | undefined> = {
  伊勢崎韮塚店: process.env.GOOGLE_CHAT_WEBHOOK_ISESAKI,
  高崎棟高店: process.env.GOOGLE_CHAT_WEBHOOK_TAKASAKI,
  足利緑町店: process.env.GOOGLE_CHAT_WEBHOOK_ASHIKAGA,
  新前橋店: process.env.GOOGLE_CHAT_WEBHOOK_SHINMAEBASHI,
  太田新田店: process.env.GOOGLE_CHAT_WEBHOOK_OTA,
  // 前橋50号店はWebhook URLなし（送信機能なし）
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Google Chat送信リクエスト開始")

    const body = await request.json()
    console.log("[v0] リクエストボディ:", body)

    const { store, items, subtotal, tax, total } = body

    console.log("[v0] 店舗:", store)
    console.log("[v0] 環境変数確認:", {
      ISESAKI: !!process.env.GOOGLE_CHAT_WEBHOOK_ISESAKI,
      TAKASAKI: !!process.env.GOOGLE_CHAT_WEBHOOK_TAKASAKI,
      ASHIKAGA: !!process.env.GOOGLE_CHAT_WEBHOOK_ASHIKAGA,
      SHINMAEBASHI: !!process.env.GOOGLE_CHAT_WEBHOOK_SHINMAEBASHI,
      OTA: !!process.env.GOOGLE_CHAT_WEBHOOK_OTA,
    })

    const WEBHOOK_URL = STORE_WEBHOOK_MAP[store]
    console.log("[v0] Webhook URL存在:", !!WEBHOOK_URL)

    if (!WEBHOOK_URL) {
      console.log("[v0] Webhook URLが見つかりません")
      // 前橋50号店など、Webhook URLが設定されていない店舗の場合
      return NextResponse.json({ error: "この店舗はGoogle Chat送信機能が利用できません" }, { status: 400 })
    }

    const itemsList = items
      .map((item: { itemName: string; price: number; category: string; isEmergency?: boolean }) => {
        const itemPrice = item.price + (item.isEmergency ? 1000 : 0)
        const emergencyNote = item.isEmergency ? " ※緊急対応費+¥1,000含む" : ""
        return `• ${item.itemName} (${item.category}): ¥${itemPrice.toLocaleString()}${emergencyNote}`
      })
      .join("\n")

    const currentDate = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const message = {
      cards: [
        {
          header: {
            title: "お見積書(概算金額となります)",
            subtitle: currentDate,
            imageUrl: "https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg",
          },
          sections: [
            {
              widgets: [
                {
                  keyValue: {
                    topLabel: "店舗",
                    content: store,
                    contentMultiline: false,
                  },
                },
              ],
            },
            {
              header: "項目明細",
              widgets: [
                {
                  textParagraph: {
                    text: itemsList,
                  },
                },
              ],
            },
            {
              widgets: [
                {
                  keyValue: {
                    topLabel: "小計（税抜き）",
                    content: `¥${subtotal.toLocaleString()}`,
                    contentMultiline: false,
                  },
                },
                {
                  keyValue: {
                    topLabel: "消費税（10%）",
                    content: `¥${tax.toLocaleString()}`,
                    contentMultiline: false,
                  },
                },
                {
                  keyValue: {
                    topLabel: "合計金額（税込）",
                    content: `¥${total.toLocaleString()}`,
                    contentMultiline: false,
                  },
                },
              ],
            },
          ],
        },
      ],
    }

    console.log("[v0] Google Chatへ送信開始")
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(message),
    })

    console.log("[v0] Google Chatレスポンスステータス:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Google Chat送信エラー:", errorText)
      throw new Error(`Google Chatへの送信に失敗しました: ${response.status}`)
    }

    console.log("[v0] Google Chat送信成功")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Google Chat送信エラー:", error)
    const errorMessage = error instanceof Error ? error.message : "送信に失敗しました"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
