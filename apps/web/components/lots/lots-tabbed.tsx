'use client'

import { useState, useEffect } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@koriflow/ui"

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-kori-100 p-1 text-kori-600",
      className
    )}
    {...props}
  />
)

const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-kori-800 data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
)

const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
)
import { FinishedGoodsTable } from "./finished-goods-table"
import { RawMaterialsTable } from "./raw-materials-table"

interface LotsProps {
  lots: any[]
}

export function LotsTabbed({ lots }: LotsProps) {
  const [activeTab, setActiveTab] = useState("FIN")

  // Load saved tab preference from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('lots-active-tab')
    if (savedTab && (savedTab === 'FIN' || savedTab === 'RAW')) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save tab preference and handle keyboard shortcuts
  useEffect(() => {
    localStorage.setItem('lots-active-tab', activeTab)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return // Don't trigger if typing in input
      
      if (e.key === '1') {
        setActiveTab('FIN')
      } else if (e.key === '2') {
        setActiveTab('RAW')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [activeTab])

  // Count lots by type
  const finCount = lots.filter(lot => lot.item.type === "FIN").length
  const rawCount = lots.filter(lot => lot.item.type === "RAW").length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kori-800">ロット管理</h1>
          <p className="text-sm text-kori-600 mt-1">
            キーボードショートカット: <kbd className="px-1.5 py-0.5 text-xs bg-kori-100 rounded">1</kbd> 製品、
            <kbd className="px-1.5 py-0.5 text-xs bg-kori-100 rounded">2</kbd> 原材料
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="FIN" className="flex items-center gap-2">
            製品
            <span className="px-1.5 py-0.5 text-xs bg-kori-100 text-kori-600 rounded">
              {finCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="RAW" className="flex items-center gap-2">
            原材料
            <span className="px-1.5 py-0.5 text-xs bg-kori-100 text-kori-600 rounded">
              {rawCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="FIN" className="mt-6">
          <FinishedGoodsTable lots={lots} />
        </TabsContent>

        <TabsContent value="RAW" className="mt-6">
          <RawMaterialsTable lots={lots} />
        </TabsContent>
      </Tabs>
    </div>
  )
}