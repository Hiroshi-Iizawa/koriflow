# 🚀 KoriFlow デプロイメントガイド

## デプロイメント構成

- **Application**: AWS EC2 (Tokyo ap-northeast-1)
- **Database**: AWS RDS PostgreSQL (Tokyo ap-northeast-1)
- **Load Balancer**: AWS ALB
- **CI/CD**: GitHub Actions + AWS CodeDeploy

## 📋 デプロイメント手順

### 1. AWS インフラストラクチャ作成

```bash
# 1. VPC, Subnets, Security Groups作成
# 2. RDS PostgreSQL インスタンス作成 (ap-northeast-1)
# 3. EC2 インスタンス作成 (Amazon Linux 2)
# 4. Application Load Balancer作成
# 5. Route53 ホストゾーン設定
```

### 2. EC2 セットアップ

```bash
# Node.js 22 + pnpm + PM2 インストール
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs
sudo npm install -g pnpm pm2

# CodeDeploy Agent インストール
sudo yum install -y ruby wget
wget https://aws-codedeploy-ap-northeast-1.s3.ap-northeast-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
```

### 3. RDS セットアップ

```bash
# 1. RDS PostgreSQL 15 インスタンス作成
# 2. セキュリティグループ: EC2からの5432ポートアクセス許可
# 3. DATABASE_URL取得
```

### 4. GitHub Secrets 設定

```
AWS_ACCESS_KEY_ID=<access_key>
AWS_SECRET_ACCESS_KEY=<secret_key>
AWS_REGION=ap-northeast-1
EC2_HOST=<ec2_public_ip>
DATABASE_URL=<rds_connection_string>
NEXTAUTH_SECRET=<32_char_secret>
```

### 5. アプリケーションデプロイ

```bash
# GitHub Actions で自動デプロイ
# - EC2 に SSH 接続
# - アプリケーション更新
# - PM2 で再起動
# - ヘルスチェック
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