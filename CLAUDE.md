# KoriFlow - Development Guidelines & Project Rules

## 🎨 Koriflow Blue UI - フォーム・デザイン基準 📐

### カラーパレット
| 用途 | ルール | Tailwind Class |
|------|--------|----------------|
| 文字 | kori-800 | `text-kori-800` |
| ラベル | kori-700 | `text-kori-700` |
| 入力枠線 | kori-300 | `border-kori-300` |
| Hover | kori-400 | `hover:border-kori-400` |
| 必須 * | kori-600 | `text-kori-600` |
| Error | red-500 | `text-red-500` |

### 余白
- **行間**: `gap-y-4` (16px)
- **カード内**: `p-6` (24px)
- **フォーム外枠**: `rounded-lg border-kori-200`
- **基準**: 8pxグリッド

### フォント
- **見出し**: `font-semibold text-2xl`
- **ラベル**: `text-sm tracking-tight`
- **フォントファミリー**: Inter

### 入力フィールド
- **高さ**: `h-10` (40px)
- **横幅**: グリッド% (12カラムグリッド)
- **フォーカス**: `focus:ring-kori-400 focus:ring-2`
- **共通クラス**: `form-input`

### アイコン
- **サイズ**: 16px (`h-4 w-4`)
- **色**: `text-kori-600`
- **配置**: 入力内左寄せ
- **ライブラリ**: lucide-react

### エラー表示
- **テキスト**: `text-xs text-red-500 mt-1`
- **枠線**: `border-red-500`
- **実装**: React Hook Formの `formState.errors`

### ダークモード
- **背景**: `dark:bg-kori-900/20`
- **ラベル**: `dark:text-kori-200`
- **入力**: `dark:bg-kori-900/40 dark:border-kori-700`
- **プレフィックス**: `.dark`

### アクセシビリティ
- **label**: `htmlFor` 必須
- **ARIA**: `aria-required` / `aria-invalid` 反映
- **Tab順序**: 左→右→下

### 実装例
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="email" className="text-sm text-kori-700 tracking-tight">
      メールアドレス <span className="text-kori-600">*</span>
    </Label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kori-600" />
      <Input
        id="email"
        type="email"
        className={cn(
          "h-10 pl-10 border-kori-300 focus:ring-2 focus:ring-kori-400",
          "dark:bg-kori-900/40 dark:border-kori-700",
          errors.email && "border-red-500"
        )}
        aria-required="true"
        aria-invalid={!!errors.email}
      />
    </div>
    {errors.email && (
      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
    )}
  </div>
</div>
```

## 🏗 Project Rules

### Core Principles
1. **Contract First** - Always define APIs and interfaces before implementation
2. **TDD (Test-Driven Development)** - Write tests first, then implement features
3. **Type Safe** - Leverage TypeScript strict mode and comprehensive typing
4. **Build Clean** - Ensure builds are clean with zero warnings/errors

## 📋 Development Workflow

### Contract First
- Define API schemas with Zod validation
- Create TypeScript interfaces before implementation
- Document API endpoints with clear request/response types
- Use Prisma schema as the single source of truth for data models

### Test-Driven Development
- Write failing tests first (`*.test.ts` files)
- Implement minimum code to pass tests
- Refactor while keeping tests green
- Maintain high test coverage for critical business logic

### Type Safety
- Use TypeScript strict mode (`strict: true`)
- Avoid `any` types - use proper typing
- Leverage Prisma generated types
- Use Zod for runtime validation and type inference

### Build Clean
- Zero TypeScript errors (`pnpm type-check`)
- Zero ESLint warnings (`pnpm lint`)
- All tests passing (`pnpm test`)
- Clean build output (`pnpm build`)

## 🛠 Commands for Quality Assurance

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test

# Build verification
pnpm build

# Database operations
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed development data
```

## 📁 Code Organization

### File Structure Standards
```
apps/web/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
└── types/              # TypeScript type definitions

packages/
├── db/                 # Prisma schema and database utilities
├── ui/                 # Shared UI components (shadcn/ui)
└── worker/            # Background job processors
```

### Testing Strategy
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user workflows (future)

### API Design Standards
- RESTful endpoints with proper HTTP methods
- Consistent error responses
- Zod schema validation for all inputs
- TypeScript types derived from Zod schemas

## 🔧 Development Environment

### Required Tools
- Node.js 22+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Environment Setup
```bash
# Start services
pnpm docker:up

# Install dependencies
pnpm install

# Build packages
pnpm --filter ui build
pnpm --filter db build

# Start development
pnpm dev
```

## ✅ Definition of Done

Before merging any feature:
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes with zero warnings (`pnpm lint`)
- [ ] Build completes successfully (`pnpm build`)
- [ ] API contracts are documented
- [ ] Tests cover new functionality
- [ ] No breaking changes without migration path

## 🎯 Quality Metrics

- **Test Coverage**: Aim for >80% on business logic
- **Type Safety**: 100% TypeScript strict mode compliance
- **Build Performance**: Clean builds under 30 seconds
- **Code Quality**: Zero ESLint warnings

---

*Last updated: 2025-06-23*
*Maintainer: Development Team*