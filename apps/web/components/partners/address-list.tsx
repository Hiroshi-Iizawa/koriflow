'use client'

import { useState } from "react"
import { Card, CardContent, Badge, Button, useToast } from "@koriflow/ui"
import { MapPin, MoreHorizontal, Plus, Phone } from "lucide-react"
import { cn } from "@lib/utils"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"
import { AddressDialog } from "./address-dialog"

interface Address {
  id: string
  label: string
  zip: string
  prefecture: string
  city: string
  line1: string
  line2?: string | null
  phone?: string | null
  isDefault: boolean
}

interface AddressListProps {
  partnerId: string
  addresses: Address[]
  className?: string
}

export function AddressList({ partnerId, addresses, className }: AddressListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const setDefaultMutation = trpc.address.setDefault.useMutation({
    onSuccess: () => {
      toast({
        title: "デフォルト住所を変更しました",
        variant: "success",
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const deleteAddressMutation = trpc.address.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "住所を削除しました",
        variant: "success",
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSetDefault = async (addressId: string) => {
    await setDefaultMutation.mutateAsync({ id: addressId })
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowAddressDialog(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("この住所を削除してもよろしいですか？")) return
    await deleteAddressMutation.mutateAsync({ id: addressId })
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowAddressDialog(true)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {addresses.map((address) => (
        <Card 
          key={address.id} 
          className={cn(
            "border-kori-200 hover:shadow-sm transition-shadow",
            address.isDefault && "border-kori-400 bg-kori-50/30"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-kori-600 flex-shrink-0" />
                  <span className="font-medium text-kori-800 truncate">{address.label}</span>
                  {address.isDefault && (
                    <Badge 
                      className="bg-kori-100 text-kori-700 border-kori-300 text-xs ml-2"
                    >
                      Default
                    </Badge>
                  )}
                </div>
                
                <div className="ml-6 text-sm text-kori-700 space-y-1">
                  <p>〒{address.zip}</p>
                  <p>{address.prefecture}{address.city}{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  {address.phone && (
                    <p className="flex items-center gap-1 mt-2">
                      <Phone className="h-3 w-3 text-kori-600" />
                      {address.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 flex-shrink-0">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs hover:bg-kori-50 text-kori-600"
                  >
                    デフォルト設定
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  className="hover:bg-kori-50"
                >
                  編集
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-kori-300 hover:bg-kori-50 text-kori-700"
        onClick={handleAddAddress}
      >
        <Plus className="h-4 w-4 mr-2" />
        住所追加
      </Button>

      {/* 住所ダイアログ */}
      {showAddressDialog && (
        <AddressDialog
          partnerId={partnerId}
          address={editingAddress}
          onClose={() => {
            setShowAddressDialog(false)
            setEditingAddress(null)
          }}
        />
      )}
    </div>
  )
}