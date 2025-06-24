-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('WAREHOUSE', 'PRODUCTION', 'MANAGER');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('FIN', 'RAW', 'WIPNG');

-- CreateEnum
CREATE TYPE "MoveReason" AS ENUM ('RECEIVE', 'ISSUE', 'ADJUST', 'CONSUME', 'PRODUCE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'WAREHOUSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "janCode" TEXT,
    "makerCode" TEXT,
    "brandName" TEXT,
    "makerName" TEXT,
    "contentVolume" TEXT,
    "packageSize" TEXT,
    "storageMethod" TEXT,
    "originCountry" TEXT,
    "energyKcal" DECIMAL(10,2),
    "proteinG" DECIMAL(10,2),
    "fatG" DECIMAL(10,2),
    "carbohydrateG" DECIMAL(10,2),
    "sodiumMg" DECIMAL(10,2),
    "allergenShrimp" BOOLEAN NOT NULL DEFAULT false,
    "allergenCrab" BOOLEAN NOT NULL DEFAULT false,
    "allergenWheat" BOOLEAN NOT NULL DEFAULT false,
    "allergenBuckwheat" BOOLEAN NOT NULL DEFAULT false,
    "allergenEgg" BOOLEAN NOT NULL DEFAULT false,
    "allergenMilk" BOOLEAN NOT NULL DEFAULT false,
    "allergenPeanut" BOOLEAN NOT NULL DEFAULT false,
    "allergenWalnut" BOOLEAN NOT NULL DEFAULT false,
    "allergenAbalone" BOOLEAN NOT NULL DEFAULT false,
    "allergenSquid" BOOLEAN NOT NULL DEFAULT false,
    "allergenSalmonRoe" BOOLEAN NOT NULL DEFAULT false,
    "allergenOrange" BOOLEAN NOT NULL DEFAULT false,
    "allergenCashew" BOOLEAN NOT NULL DEFAULT false,
    "allergenKiwi" BOOLEAN NOT NULL DEFAULT false,
    "allergenBeef" BOOLEAN NOT NULL DEFAULT false,
    "allergenSesame" BOOLEAN NOT NULL DEFAULT false,
    "allergenSalmon" BOOLEAN NOT NULL DEFAULT false,
    "allergenMackerel" BOOLEAN NOT NULL DEFAULT false,
    "allergenSoybean" BOOLEAN NOT NULL DEFAULT false,
    "allergenChicken" BOOLEAN NOT NULL DEFAULT false,
    "allergenBanana" BOOLEAN NOT NULL DEFAULT false,
    "allergenPork" BOOLEAN NOT NULL DEFAULT false,
    "allergenMatsutake" BOOLEAN NOT NULL DEFAULT false,
    "allergenPeach" BOOLEAN NOT NULL DEFAULT false,
    "allergenYam" BOOLEAN NOT NULL DEFAULT false,
    "allergenApple" BOOLEAN NOT NULL DEFAULT false,
    "allergenGelatin" BOOLEAN NOT NULL DEFAULT false,
    "allergenSeafood" BOOLEAN NOT NULL DEFAULT false,
    "allergenAlmond" BOOLEAN NOT NULL DEFAULT false,
    "manufacturerName" TEXT,
    "manufacturerAddress" TEXT,
    "manufacturerPhone" TEXT,
    "sellerName" TEXT,
    "sellerAddress" TEXT,
    "sellerPhone" TEXT,
    "usageNotes" TEXT,
    "productFeature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_lots" (
    "id" TEXT NOT NULL,
    "lotCode" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(10,3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "prodDate" TIMESTAMP(3),
    "batchNo" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_moves" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "deltaQty" DECIMAL(10,3) NOT NULL,
    "reason" "MoveReason" NOT NULL,
    "ref" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_runs" (
    "id" TEXT NOT NULL,
    "runDate" TIMESTAMP(3) NOT NULL,
    "runNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "yieldPct" DECIMAL(5,2),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_items" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "qty" DECIMAL(10,3) NOT NULL,
    "scrapPct" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "items_code_key" ON "items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "items_janCode_key" ON "items"("janCode");

-- CreateIndex
CREATE UNIQUE INDEX "item_lots_lotCode_key" ON "item_lots"("lotCode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_locations_code_key" ON "inventory_locations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNo_key" ON "sales_orders"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNo_key" ON "purchase_orders"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "production_runs_runDate_runNo_key" ON "production_runs"("runDate", "runNo");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_productId_version_key" ON "recipes"("productId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_items_recipeId_materialId_key" ON "recipe_items"("recipeId", "materialId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_lots" ADD CONSTRAINT "item_lots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_lots" ADD CONSTRAINT "item_lots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_moves" ADD CONSTRAINT "inventory_moves_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "item_lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
