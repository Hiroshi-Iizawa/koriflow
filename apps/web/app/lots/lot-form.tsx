"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Label } from "@koriflow/ui"
import { ItemLot, Item, InventoryLocation } from "@koriflow/db"

interface LotFormProps {
  initialData?: ItemLot & {
    item: Item
    location: InventoryLocation | null
  }
}

export function LotForm({ initialData }: LotFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<InventoryLocation[]>([])
  const [formData, setFormData] = useState({
    lotCode: initialData?.lotCode || "",
    itemId: initialData?.itemId || "",
    qty: initialData?.qty.toString() || "0",
    expiryDate: initialData?.expiryDate 
      ? new Date(initialData.expiryDate).toISOString().split('T')[0] 
      : "",
    prodDate: initialData?.prodDate 
      ? new Date(initialData.prodDate).toISOString().split('T')[0] 
      : "",
    batchNo: initialData?.batchNo || "",
    locationId: initialData?.locationId || "",
  })

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, locationsRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/locations"),
      ])
      
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData)
      }
      
      if (locationsRes.ok) {
        const locationsData = await locationsRes.json()
        setLocations(locationsData)
      }
    }
    
    fetchData()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData ? `/api/lots/${initialData.id}` : "/api/lots"
      const method = initialData ? "PATCH" : "POST"

      const submitData = {
        ...formData,
        qty: parseFloat(formData.qty),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        prodDate: formData.prodDate ? new Date(formData.prodDate) : null,
        locationId: formData.locationId || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to save lot")
      }

      router.push("/lots")
      router.refresh()
    } catch (error) {
      console.error("Error saving lot:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="lotCode">Lot Code</Label>
        <Input
          id="lotCode"
          value={formData.lotCode}
          onChange={(e) => setFormData({ ...formData, lotCode: e.target.value })}
          placeholder="e.g., MILK-20241201-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemId">Item</Label>
        <select
          id="itemId"
          value={formData.itemId}
          onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select an item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.code})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qty">Quantity</Label>
        <Input
          id="qty"
          type="number"
          step="0.001"
          value={formData.qty}
          onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
          placeholder="0.000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationId">Location</Label>
        <select
          id="locationId"
          value={formData.locationId}
          onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">No location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} ({location.code})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prodDate">Production Date</Label>
        <Input
          id="prodDate"
          type="date"
          value={formData.prodDate}
          onChange={(e) => setFormData({ ...formData, prodDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          id="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="batchNo">Batch Number</Label>
        <Input
          id="batchNo"
          value={formData.batchNo}
          onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
          placeholder="e.g., BATCH-001"
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (initialData ? "Update" : "Create")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}