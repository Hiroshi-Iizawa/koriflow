'use client'

import { ArrowUpRight, TrendingUp, Package, MapPin, Activity, Building2, ShoppingCart } from 'lucide-react'

const StatCard = ({
  title,
  value,
  diff,
  icon: Icon,
  color = "kori"
}: {
  title: string
  value: React.ReactNode
  diff?: string
  icon: any
  color?: string
}) => (
  <div className="group relative overflow-hidden rounded-xl bg-white border border-kori-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-kori-50 to-kori-100 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-kori-100 rounded-lg">
          <Icon className="w-5 h-5 text-kori-600" />
        </div>
        {diff && (
          <div className="flex items-center text-emerald-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {diff}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-kori-700 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-kori-900">{value}</p>
    </div>
  </div>
)

const QuickActionCard = ({
  title,
  href,
  icon: Icon,
  description
}: {
  title: string
  href: string
  icon: any
  description: string
}) => (
  <a href={href} className="group block p-4 rounded-lg border border-kori-200 hover:border-kori-300 bg-white hover:bg-kori-50 transition-all duration-200">
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-kori-100 rounded-lg group-hover:bg-kori-200 transition-colors">
        <Icon className="w-5 h-5 text-kori-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-kori-800 group-hover:text-kori-900">{title}</h4>
        <p className="text-sm text-kori-600 mt-1">{description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-kori-400 group-hover:text-kori-600 transition-colors" />
    </div>
  </a>
)

export default function Home() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-kori-500 via-kori-600 to-kori-700 p-8 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">KoriFlow ダッシュボード</h1>
          <p className="text-kori-100 text-lg">
            アイスクリーム製造・在庫管理システム ❄️
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="登録商品数"
          value="9"
          diff="+3 新規"
          icon={Package}
        />
        
        <StatCard
          title="取引先数"
          value="3"
          diff="2 得意先"
          icon={Building2}
        />
        
        <StatCard
          title="受注件数"
          value="2"
          diff="1 確定済"
          icon={ShoppingCart}
        />
        
        <StatCard
          title="有効ロット数"
          value="6"
          diff="+1 今日"
          icon={Activity}
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-kori-200 p-6">
            <h3 className="text-lg font-semibold text-kori-800 mb-6">クイックアクション</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickActionCard
                title="受注管理"
                href="/sales-orders"
                icon={ShoppingCart}
                description="受注の作成・ステータス管理"
              />
              <QuickActionCard
                title="取引先管理"
                href="/partners"
                icon={Building2}
                description="得意先・仕入先の管理"
              />
              <QuickActionCard
                title="在庫ロット"
                href="/lots"
                icon={Activity}
                description="ロット別在庫の追跡"
              />
              <QuickActionCard
                title="商品マスター"
                href="/items"
                icon={Package}
                description="商品情報の表示・編集"
              />
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-white rounded-xl border border-kori-200 p-6">
          <h3 className="text-lg font-semibold text-kori-800 mb-6">システム状態</h3>
          <div className="space-y-4">
            {[
              { name: "データベース", status: "稼働中" },
              { name: "在庫引当", status: "稼働中" },
              { name: "PDF生成", status: "稼働中" },
              { name: "CSV出力", status: "稼働中" }
            ].map(service => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-kori-700 font-medium">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-emerald-600 font-medium">稼働中</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-kori-100">
            <p className="text-sm text-kori-600">
              全システム正常稼働中 | v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}