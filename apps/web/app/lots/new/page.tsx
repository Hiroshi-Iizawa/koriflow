import { LotForm } from "@app/lots/lot-form"

export default function NewLotPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Lot</h1>
        <p className="text-muted-foreground">
          Add a new inventory lot to the system
        </p>
      </div>
      
      <LotForm />
    </div>
  )
}