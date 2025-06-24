import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@components/providers/trpc-provider"
import { Toaster } from "@koriflow/ui"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KoriFlow - Ice Cream Manufacturing & Inventory System",
  description: "Production-ready ice cream manufacturing and inventory management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-background flex flex-col">
          <nav className="border-b border-kori-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex h-16 items-center px-6">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-kori-400 to-kori-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <h1 className="text-xl font-bold text-kori-800 tracking-tight">KoriFlow</h1>
                </div>
                <div className="flex space-x-6">
                  <a href="/dashboard" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    ダッシュボード
                  </a>
                  <a href="/partners" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    取引先
                  </a>
                  <a href="/sales-orders" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    受注管理
                  </a>
                  <a href="/items" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    商品マスター
                  </a>
                  <a href="/lots" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    在庫ロット
                  </a>
                  <a href="/moves" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    在庫移動
                  </a>
                  <a href="/recipes" className="text-sm font-medium text-kori-700 transition-colors hover:text-kori-500 border-b-2 border-transparent hover:border-kori-300">
                    レシピ管理
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 flex flex-col">
            <TRPCProvider>
              {children}
            </TRPCProvider>
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}