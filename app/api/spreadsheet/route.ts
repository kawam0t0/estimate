import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = "1eynNDQX-qPSKog67kU9RXKUpomc906QqwAAGzx4Sm-k"
const SHEET_NAME = "itemlist"

export interface SpreadsheetItem {
  category: string
  itemName: string
  price: number
}

async function getGoogleSheetsClient() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  return sheets
}

export async function GET() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Google認証情報が設定されていません")
    }

    const sheets = await getGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const items: SpreadsheetItem[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const category = row[0]
      const itemName = row[1]
      const priceRaw = row[2]

      console.log("[v0] 行データ:", { row: i, category, itemName, priceRaw })

      if (category && itemName) {
        const priceStr = String(priceRaw || "0").replace(/[^\d.-]/g, "")
        const price = Number.parseFloat(priceStr)
        const validPrice = isNaN(price) ? 0 : price

        console.log("[v0] 変換後の価格:", { priceRaw, priceStr, price, validPrice })

        items.push({
          category: String(category).trim(),
          itemName: String(itemName).trim(),
          price: validPrice,
        })
      }
    }

    console.log("[v0] 取得したアイテム数:", items.length)
    return NextResponse.json({ items })
  } catch (error) {
    console.error("[v0] スプレッドシート取得エラー:", error)
    return NextResponse.json(
      { error: "データの取得に失敗しました", details: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 },
    )
  }
}