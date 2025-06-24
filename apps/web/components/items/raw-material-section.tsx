'use client'

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Beaker, Thermometer, Clock, Award, FileText } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@koriflow/ui"
import { InputField, SelectField, TextareaField } from "../ui/form-fields"
import { ItemFormData } from "../../lib/validators/item"

interface RawMaterialSectionProps {
  register: UseFormRegister<ItemFormData>
  errors: FieldErrors<ItemFormData>
  formValues: Partial<ItemFormData>
  onChange: (field: string, value: string) => void
}

const gradeOptions = [
  { value: "A", label: "A級 (最上級品質)" },
  { value: "B", label: "B級 (一般品質)" },
  { value: "INDUSTRIAL", label: "工業用" }
]

export function RawMaterialSection({ register, errors, formValues, onChange }: RawMaterialSectionProps) {
  return (
    <Accordion type="multiple" defaultValue={['quality']} className="space-y-4 focus:outline-none focus-within:outline-none mt-6">
      
      {/* 品質・等級 */}
      <AccordionItem value="quality" className="border border-teal-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-teal-700 font-semibold">
            <Award className="h-5 w-5 text-teal-600" />
            品質・等級情報
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-12 gap-4">
            <SelectField
              id="grade"
              label="等級・規格"
              className="col-span-4"
              options={gradeOptions}
              value={formValues.grade as string}
              onChange={(value) => onChange("grade", value)}
              error={errors.grade?.message}
              placeholder="等級を選択"
            />
            
            <InputField
              id="qualityStandard"
              label="品質基準"
              className="col-span-8"
              placeholder="JAS規格準拠、水分含有率15%以下"
              {...register("qualityStandard")}
              error={errors.qualityStandard?.message}
            />
            
            <InputField
              id="countryOfOrigin"
              label="原産国"
              className="col-span-6"
              placeholder="オーストラリア"
              {...register("countryOfOrigin")}
              error={errors.countryOfOrigin?.message}
            />
            
            <InputField
              id="leadTimeDays"
              label="発注リードタイム"
              className="col-span-6"
              type="number"
              unit="日"
              placeholder="14"
              {...register("leadTimeDays", { valueAsNumber: true })}
              error={errors.leadTimeDays?.message}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 保存・取扱条件 */}
      <AccordionItem value="storage" className="border border-teal-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-teal-700 font-semibold">
            <Thermometer className="h-5 w-5 text-teal-600" />
            保存・取扱条件
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-12 gap-4">
            <InputField
              id="storageCondition"
              label="保存条件"
              className="col-span-12"
              placeholder="冷凍保存（-18℃以下）、湿度60%以下の環境で保管"
              {...register("storageCondition")}
              error={errors.storageCondition?.message}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* その他情報 */}
      <AccordionItem value="others" className="border border-teal-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-teal-700 font-semibold">
            <FileText className="h-5 w-5 text-teal-600" />
            その他
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <TextareaField
            id="usageNotes"
            label="取扱上の注意・備考"
            rows={4}
            placeholder="開封後は密閉容器で保管し、30日以内に使用してください。"
            {...register("usageNotes")}
            error={errors.usageNotes?.message}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}