# KoriFlow - Ice Cream Manufacturing & Inventory System

A production-ready ice cream manufacturing and inventory management system built with modern technologies.

## 🚀 Features

- **Inventory Management**: Track raw materials, finished goods, and WIP items
- **Lot Tracking**: Manage inventory lots with expiry dates, batch numbers, and locations
- **Inventory Movements**: Record and track all inventory transactions
- **Barcode Scanning**: Quick inventory movements with barcode support
- **User Authentication**: Role-based access control (Warehouse, Production, Manager)
- **Real-time Updates**: Modern React-based UI with server-side rendering
- **Background Jobs**: Automated nightly cost rollup and reporting

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript 5
- **Backend**: Node.js 22 (ESM), NextAuth.js, Prisma ORM
- **Database**: PostgreSQL 15
- **UI**: shadcn/ui, Tailwind CSS, TanStack Table
- **Queue**: BullMQ with Redis
- **Deployment**: Docker Compose, GitHub Actions CI

## 📁 Project Structure

```
koriflow/
├── apps/
│   └── web/                    # Next.js 15 application
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       └── lib/                # Utility functions
├── packages/
│   ├── db/                     # Prisma schema and database utilities
│   ├── ui/                     # Shared UI components (shadcn/ui)
│   └── worker/                 # BullMQ background jobs
├── docker-compose.yml          # Development services
└── README.md
```

## 🏗 Architecture

### Domain Models

- **Item**: Products, raw materials, and WIP items
- **ItemLot**: Inventory lots with quantities and tracking info
- **InventoryLocation**: Storage locations (freezer, cooler, warehouse)
- **InventoryMove**: All inventory transactions with audit trail
- **User**: Authentication with role-based permissions

### Data Flow

1. **Items** are created with unique codes and types (FIN/RAW/WIPNG)
2. **ItemLots** represent physical inventory with quantities and locations
3. **InventoryMoves** record all transactions (+/- quantities) with reasons
4. **Background jobs** process nightly cost rollups and reports

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koriflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development services**
   ```bash
   pnpm docker:up
   ```

4. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 🔑 Default Accounts

After seeding, you can log in with these accounts:

- **Warehouse User**: `warehouse@koriflow.com` / `password123`
- **Production User**: `production@koriflow.com` / `password123`
- **Manager**: `manager@koriflow.com` / `password123`

## 🐳 Docker Services

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Queue and caching (port 6379)
- **Mailhog**: Email testing (port 8025 for UI)

## 📊 API Endpoints

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Inventory Moves
- `POST /api/inventory/move` - Record inventory movement

## 🔄 Background Jobs

The system includes automated background processing:

- **Nightly Cost Rollup**: Runs at 2 AM daily
- **Inventory Valuation**: Calculates current stock values
- **Production Reporting**: Generates manufacturing reports

Start the worker:
```bash
pnpm --filter worker dev
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter web test
pnpm --filter db test
```

## 🔧 Development Commands

```bash
# Start all services
pnpm docker:up

# Generate Prisma client
pnpm db:generate

# Push database changes
pnpm db:push

# Seed database
pnpm db:seed

# Build all packages
pnpm build

# Lint code
pnpm lint

# Type check
pnpm type-check
```

## 📈 Monitoring

- **Application**: Next.js built-in monitoring
- **Database**: PostgreSQL logs via Docker
- **Queue**: BullMQ dashboard (can be added)
- **Email**: Mailhog UI at http://localhost:8025

## 🚀 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Create `.env.production` with:

```env
DATABASE_URL="postgresql://user:pass@host:5432/koriflow"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
REDIS_URL="redis://your-redis-host:6379"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `pnpm lint` and `pnpm test`
6. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ for modern ice cream manufacturing operations.