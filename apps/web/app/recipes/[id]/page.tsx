'use client'

import { Button } from "@koriflow/ui"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { useParams } from "next/navigation"

export default function RecipeDetailPage() {
  const params = useParams()
  const recipeId = params.id as string

  const { data: recipe, isLoading } = trpc.recipe.byId.useQuery(recipeId)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border p-8 text-center">
          <p>Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Recipe Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The recipe you're looking for doesn't exist.
          </p>
          <Link href="/recipes">
            <Button>Back to Recipes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Recipe Details</h1>
        <div className="flex gap-2">
          <Link href={`/recipes/${recipeId}/edit`}>
            <Button variant="outline">Edit Recipe</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">Back to Recipes</Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Recipe Information</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">Product:</span>
              <span className="ml-2">{recipe.product.name} ({recipe.product.code})</span>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <span className="ml-2">{recipe.version}</span>
            </div>
            <div>
              <span className="font-medium">Yield Percentage:</span>
              <span className="ml-2">{recipe.yieldPct ? `${recipe.yieldPct}%` : 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 ${recipe.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {recipe.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{new Date(recipe.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Recipe Ingredients</h2>
          {recipe.items.length > 0 ? (
            <div className="space-y-3">
              {recipe.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">{item.material.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {item.material.code} | Type: {item.material.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Qty: {Number(item.qty)}</div>
                    {item.scrapPct && (
                      <div className="text-sm text-muted-foreground">
                        Scrap: {Number(item.scrapPct)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No ingredients defined.</p>
          )}
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Production Calculator</h2>
          <p className="text-muted-foreground mb-4">
            Calculate material requirements for production planning.
          </p>
          <Link href={`/recipes/${recipeId}/calculator`}>
            <Button>Open Calculator</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}