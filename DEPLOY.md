# 🚀 KoriFlow デプロイメントガイド

## デプロイメント構成

- **Frontend**: Vercel (Next.js 15)
- **Database**: Neon (PostgreSQL)
- **Cache**: Upstash Redis
- **CI/CD**: GitHub Actions

## 📋 デプロイメント手順

### 1. Neon Database セットアップ

```bash
# 1. Neon Console (https://console.neon.tech) でプロジェクト作成
# 2. DATABASE_URLをコピー
# 3. Branchingを有効化 (main/preview/development)
```

### 2. Upstash Redis セットアップ

```bash
# 1. Upstash Console (https://console.upstash.com) でデータベース作成
# 2. Region: Asia Pacific (Tokyo)
# 3. REDIS_URL と REST credentials をコピー
```

### 3. Vercel プロジェクト作成

```bash
# 1. Vercel CLI インストール
npm i -g vercel

# 2. プロジェクトの初期化
vercel

# 3. 環境変数設定
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add REDIS_URL production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

### 4. GitHub Secrets 設定

リポジトリの Settings → Secrets で以下を設定：

```
VERCEL_TOKEN=<vercel_token>
VERCEL_ORG_ID=<org_id>
VERCEL_PROJECT_ID=<project_id>
```

### 5. データベースマイグレーション

```bash
# Production環境でのマイグレーション
DATABASE_URL="<neon_production_url>" pnpm db:push
DATABASE_URL="<neon_production_url>" pnpm db:seed
```

## 🔧 環境別設定

### Production
- Branch: `main`
- URL: `https://koriflow.vercel.app`
- Database: Neon main branch
- Redis: Upstash production

### Preview (PR)
- Branch: `feature/*`
- URL: `https://koriflow-<hash>.vercel.app`
- Database: Neon preview branch
- Redis: Upstash development

### Development
- Branch: `dev`
- URL: `http://localhost:3000`
- Database: Local PostgreSQL or Neon dev branch
- Redis: Local Redis or Upstash development

## 📊 監視・ログ

### Vercel Analytics
- リアルタイムアクセス解析
- パフォーマンス監視
- エラー追跡

### Neon Monitoring
- データベースパフォーマンス
- Connection pooling状況
- バックアップ状況

### Upstash Monitoring
- Redis使用量
- レスポンス時間
- エラー率

## 🔍 トラブルシューティング

### ビルドエラー
```bash
# ローカルでのビルド確認
pnpm build

# 型チェック
pnpm type-check

# テスト実行
pnpm test
```

### データベース接続エラー
```bash
# 接続テスト
psql $DATABASE_URL

# Prisma schema 同期
pnpm db:generate
pnpm db:push
```

### Redis接続エラー
```bash
# Redis接続テスト
redis-cli -u $REDIS_URL ping
```

## 📈 スケーリング

### Vercel
- **Hobby**: 無料 (開発用)
- **Pro**: $20/月 (本格運用)
- **Enterprise**: カスタム (大規模)

### Neon
- **Free**: 512MB (開発用)
- **Scale**: $19/月 (本格運用)
- **Enterprise**: カスタム (大規模)

### Upstash
- **Free**: 10K requests/月
- **Pay as you go**: $0.2/100K requests
- **Pro**: $280/月 (dedicated)

## 🚨 セキュリティ

- [ ] NEXTAUTH_SECRET: 32文字以上のランダム文字列
- [ ] Database: SSL必須 (`sslmode=require`)
- [ ] Redis: TLS暗号化 (`rediss://`)
- [ ] 環境変数: GitHub Secrets管理
- [ ] CORS: 本番ドメインのみ許可

## 📝 デプロイメントチェックリスト

- [ ] Neon Database 作成・設定
- [ ] Upstash Redis 作成・設定
- [ ] Vercel プロジェクト作成
- [ ] GitHub Secrets 設定
- [ ] 環境変数 設定
- [ ] マイグレーション実行
- [ ] ビルド・テスト成功確認
- [ ] 本番デプロイ
- [ ] 動作確認・監視設定