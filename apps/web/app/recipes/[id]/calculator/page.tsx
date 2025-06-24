'use client'

import { Button, Input, Label } from "@koriflow/ui"
import Link from "next/link"
import { useState } from "react"
import { trpc } from "@lib/trpc/client"
import { useParams } from "next/navigation"

export default function RecipeCalculatorPage() {
  const params = useParams()
  const recipeId = params.id as string
  const [plannedQty, setPlannedQty] = useState<number>(0)

  const { data: recipe } = trpc.recipe.byId.useQuery(recipeId)
  const { data: consumption, isLoading: isCalculating } = trpc.recipe.getConsumption.useQuery(
    {
      productId: recipe?.productId || "",
      plannedQty,
    },
    {
      enabled: !!recipe?.productId && plannedQty > 0,
    }
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Production Calculator</h1>
        <div className="flex gap-2">
          <Link href={`/recipes/${recipeId}`}>
            <Button variant="outline">Back to Recipe</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">All Recipes</Button>
          </Link>
        </div>
      </div>

      {recipe && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Production Planning</h2>
            <div className="mb-4">
              <p><span className="font-medium">Product:</span> {recipe.product.name}</p>
              <p><span className="font-medium">Recipe Version:</span> {recipe.version}</p>
              {recipe.yieldPct && (
                <p><span className="font-medium">Yield:</span> {recipe.yieldPct}%</p>
              )}
            </div>
            
            <div className="max-w-md">
              <Label htmlFor="plannedQty">Planned Production Quantity</Label>
              <Input
                id="plannedQty"
                type="number"
                min="0"
                step="0.001"
                placeholder="Enter quantity to produce"
                value={plannedQty || ""}
                onChange={(e) => setPlannedQty(Number(e.target.value))}
              />
            </div>
          </div>

          {plannedQty > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Material Requirements</h2>
              
              {isCalculating ? (
                <p className="text-muted-foreground">Calculating requirements...</p>
              ) : consumption && consumption.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {consumption.map((req) => (
                      <div key={req.materialId} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <div className="font-medium">{req.material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {req.material.code}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Base qty per unit: {req.baseQty}
                            {req.scrapPct && ` | Scrap allowance: ${req.scrapPct}%`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {req.requiredQty.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Required
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                    <p className="text-blue-800">
                      To produce <span className="font-bold">{plannedQty}</span> units of{" "}
                      <span className="font-bold">{recipe.product.name}</span>, you need the materials listed above.
                    </p>
                    {recipe.yieldPct && recipe.yieldPct < 100 && (
                      <p className="text-blue-700 text-sm mt-1">
                        * Yield adjustment ({recipe.yieldPct}%) has been applied to account for production losses.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No material requirements calculated. Please check the recipe configuration.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}