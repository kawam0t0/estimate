# ローカル開発セットアップガイド

このガイドでは、見積書作成アプリをローカル環境で開発するための詳細な手順を説明します。

## 必要なもの

- Node.js 18.17以上
- npm または yarn
- Googleアカウント（スプレッドシート用）
- Google Chatのアクセス権（Webhook用）

## ステップ1: プロジェクトのセットアップ

### 1.1 プロジェクトのダウンロード

v0から以下のいずれかの方法でプロジェクトを取得：

**方法A: ZIPダウンロード**
1. v0の画面右上の「...」メニューをクリック
2. 「Download ZIP」を選択
3. ダウンロードしたZIPファイルを解凍

**方法B: GitHubから**
1. v0の画面右上のGitHubアイコンをクリック
2. GitHubリポジトリにプッシュ
3. `git clone` でローカルにクローン

### 1.2 依存関係のインストール

\`\`\`bash
cd estimate-app
npm install
\`\`\`

## ステップ2: Google Sheets API認証の設定

### 2.1 Google Cloud Projectの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名を入力（例: estimate-app）

### 2.2 Google Sheets APIの有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 検索バーで「Google Sheets API」を検索
3. 「Google Sheets API」をクリック
4. 「有効にする」ボタンをクリック

### 2.3 サービスアカウントの作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウントの詳細を入力：
   - 名前: `estimate-app-service`
   - ID: 自動生成されます
   - 説明: `見積もりアプリ用サービスアカウント`
4. 「作成して続行」をクリック
5. ロールの選択はスキップ（「続行」をクリック）
6. 「完了」をクリック

### 2.4 サービスアカウントキーの作成

1. 作成したサービスアカウントをクリック
2. 「キー」タブを選択
3. 「鍵を追加」→「新しい鍵を作成」をクリック
4. キーのタイプで「JSON」を選択
5. 「作成」をクリック
6. **JSONファイルが自動的にダウンロードされます（重要: このファイルは安全に保管してください）**

ダウンロードされたJSONファイルの内容例：
\`\`\`json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "estimate-app-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
\`\`\`

## ステップ3: Googleスプレッドシートの設定

### 3.1 スプレッドシートの確認

既存のスプレッドシートを使用する場合：
- シートID: `1eynNDQX-qPSKog67kU9RXKUpomc906QqwAAGzx4Sm-k`
- シート名: `itemlist`

### 3.2 スプレッドシートへのアクセス権限の付与

**重要**: サービスアカウントにスプレッドシートへのアクセス権を付与する必要があります。

1. スプレッドシートを開く
2. 右上の「共有」ボタンをクリック
3. ダウンロードしたJSONファイルの `client_email` の値をコピー
   - 例: `estimate-app-service@your-project.iam.gserviceaccount.com`
4. 共有ダイアログにこのメールアドレスを貼り付け
5. 権限を「閲覧者」に設定
6. 「送信」をクリック（通知メールは不要）

### 3.3 新しいスプレッドシートを作成する場合

1. Google Sheetsで新しいスプレッドシートを作成
2. シート名を `itemlist` に変更
3. 以下の形式でデータを入力：

| A列（カテゴリー） | B列（アイテム名） | C列（金額） |
|------------------|------------------|------------|
| 外装工事          | 外壁塗装         | 150000     |
| 外装工事          | 屋根塗装         | 120000     |
| 内装工事          | クロス張替え      | 80000      |
| 内装工事          | フローリング      | 200000     |
| 設備工事          | エアコン設置      | 100000     |
| 設備工事          | 給湯器交換       | 180000     |

4. サービスアカウントに共有（上記3.2の手順を実行）

5. スプレッドシートのIDを取得：
   - URLから取得: `https://docs.google.com/spreadsheets/d/【ここがID】/edit`
   - `app/api/spreadsheet/route.ts` の `SHEET_ID` を更新

## ステップ4: 環境変数の設定

### 4.1 .env.localファイルの作成

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の内容を記入：

\`\`\`env
# Google Chat Webhook URL
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/AAAAZ6w-bSw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=DajRGVHjUPJfnN77EMUcuLyMaZQUNUM4QqcHHi_9CGc

# Google Sheets API認証情報
GOOGLE_SERVICE_ACCOUNT_EMAIL=【ダウンロードしたJSONのclient_emailの値】
GOOGLE_PRIVATE_KEY="【ダウンロードしたJSONのprivate_keyの値】"
\`\`\`

### 4.2 環境変数の設定例

ダウンロードしたJSONファイルから以下の値をコピー：

\`\`\`env
GOOGLE_SERVICE_ACCOUNT_EMAIL=estimate-app-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
\`\`\`

**注意**: 
- `private_key` の値は必ずダブルクォーテーション（"）で囲んでください
- 改行は `\n` として含まれている必要があります
- JSONファイルからそのままコピーすれば正しい形式になります

## ステップ5: Google Chat Webhookの設定

### 5.1 Webhookの作成（新規作成する場合）

1. Google Chatを開く
2. Webhookを設定したいスペースを選択
3. スペース名の横の「▼」をクリック
4. 「アプリと統合を管理」を選択
5. 「Webhook」タブを選択
6. 「Webhookを追加」をクリック
7. 名前を入力（例: 見積書通知）
8. 「保存」をクリック
9. 表示されたWebhook URLをコピーして `.env.local` に設定

既に提供されているWebhook URLを使用する場合は、そのまま `.env.local` に記載されているURLを使用してください。

## ステップ6: アプリの起動

### 6.1 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

### 6.2 ブラウザでアクセス

`http://localhost:3000` を開く

### 6.3 スマートフォンでアクセス

同じWi-Fiネットワークに接続されたスマートフォンからアクセスする場合：

1. PCのローカルIPアドレスを確認：

**Mac/Linux:**
\`\`\`bash
ifconfig | grep "inet " | grep -v 127.0.0.1
\`\`\`

**Windows:**
\`\`\`bash
ipconfig
\`\`\`

2. スマートフォンのブラウザで以下にアクセス：
\`\`\`
http://【PCのIPアドレス】:3000
\`\`\`

例: `http://192.168.1.100:3000`

## ステップ7: 動作確認

### 7.1 データ取得の確認

1. アプリを開く
2. カテゴリーが表示されることを確認
3. カテゴリーをクリックしてアイテムが表示されることを確認

### 7.2 見積書作成の確認

1. 店舗を選択
2. 複数のアイテムを追加
3. 「見積書を作成」ボタンをクリック
4. プレビューが表示されることを確認

### 7.3 Google Chat送信の確認

1. 「Google Chatに送信」ボタンをクリック
2. Google Chatのスペースにメッセージが届くことを確認

## トラブルシューティング

### エラー: Google認証情報が設定されていません

**原因**: `.env.local` ファイルが正しく設定されていない

**解決方法**:
1. `.env.local` ファイルがプロジェクトのルートディレクトリに存在するか確認
2. `GOOGLE_SERVICE_ACCOUNT_EMAIL` と `GOOGLE_PRIVATE_KEY` が正しく設定されているか確認
3. `GOOGLE_PRIVATE_KEY` がダブルクォーテーションで囲まれているか確認
4. 開発サーバーを再起動

### エラー: スプレッドシートの取得に失敗

**原因1**: サービスアカウントにスプレッドシートへのアクセス権がない

**解決方法**:
1. スプレッドシートを開く
2. 「共有」ボタンをクリック
3. サービスアカウントのメールアドレス（`client_email`）を追加
4. 権限を「閲覧者」に設定

**原因2**: スプレッドシートIDが正しくない

**解決方法**:
1. スプレッドシートのURLを確認
2. `app/api/spreadsheet/route.ts` の `SHEET_ID` を更新

### エラー: Google Chatに送信できない

**原因**: Webhook URLが正しくない、または期限切れ

**解決方法**:
1. `.env.local` ファイルのURLを確認
2. Google ChatでWebhookを再作成
3. 新しいURLを `.env.local` に設定
4. 開発サーバーを再起動

### スマートフォンでアクセスできない

**原因**: ファイアウォールまたはネットワーク設定

**解決方法**:
1. PCとスマートフォンが同じWi-Fiに接続されているか確認
2. PCのファイアウォール設定を確認
3. Next.jsを `0.0.0.0` でバインド：
\`\`\`bash
npm run dev -- -H 0.0.0.0
\`\`\`

### データが表示されない

**原因**: スプレッドシートの構造が正しくない

**解決方法**:
1. A列にカテゴリー、B列にアイテム名、C列に金額が入力されているか確認
2. 数値が正しく入力されているか確認
3. シート名が `itemlist` になっているか確認

## セキュリティに関する注意事項

1. **JSONファイルの管理**
   - ダウンロードしたサービスアカウントのJSONファイルは安全に保管してください
   - Gitリポジトリにコミットしないでください
   - `.gitignore` に `.env.local` が含まれていることを確認してください

2. **環境変数の管理**
   - `.env.local` ファイルは絶対にGitにコミットしないでください
   - 本番環境では、Vercelの環境変数設定を使用してください

3. **アクセス権限**
   - サービスアカウントには必要最小限の権限のみを付与してください
   - スプレッドシートへのアクセスは「閲覧者」権限で十分です

## 開発のヒント

### デバッグモード

コンソールログを確認する場合：
- ブラウザの開発者ツールを開く（F12）
- Consoleタブを確認
- `[v0]` で始まるログがアプリからの出力です

### スプレッドシートのデータ構造を変更する場合

`app/api/spreadsheet/route.ts` を編集してデータ取得ロジックを変更できます。

### UIのカスタマイズ

- `app/globals.css` でカラーテーマを変更
- `components/` 内のコンポーネントでUIを変更

## 次のステップ

- Vercelにデプロイして本番環境で使用
- 追加機能の実装（PDF出力、履歴管理など）
- デザインのカスタマイズ
