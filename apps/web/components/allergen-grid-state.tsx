'use client'

// 特定原材料8品目
const MAJOR_ALLERGENS = [
  { key: 'allergenShrimp', label: 'えび' },
  { key: 'allergenCrab', label: 'かに' },
  { key: 'allergenWheat', label: '小麦' },
  { key: 'allergenBuckwheat', label: 'そば' },
  { key: 'allergenEgg', label: '卵' },
  { key: 'allergenMilk', label: '乳' },
  { key: 'allergenPeanut', label: '落花生' },
  { key: 'allergenWalnut', label: 'くるみ' },
] as const

// 特定原材料に準ずるもの20品目
const OTHER_ALLERGENS = [
  { key: 'allergenAbalone', label: 'あわび' },
  { key: 'allergenSquid', label: 'いか' },
  { key: 'allergenSalmonRoe', label: 'いくら' },
  { key: 'allergenOrange', label: 'オレンジ' },
  { key: 'allergenCashew', label: 'ｶｼｭｰﾅｯﾂ' },
  { key: 'allergenKiwi', label: 'ｷｳｲﾌﾙｰﾂ' },
  { key: 'allergenBeef', label: '牛肉' },
  { key: 'allergenSesame', label: 'ごま' },
  { key: 'allergenSalmon', label: 'さけ' },
  { key: 'allergenMackerel', label: 'さば' },
  { key: 'allergenSoybean', label: '大豆' },
  { key: 'allergenChicken', label: '鶏肉' },
  { key: 'allergenBanana', label: 'バナナ' },
  { key: 'allergenPork', label: '豚肉' },
  { key: 'allergenMatsutake', label: 'まつたけ' },
  { key: 'allergenPeach', label: 'もも' },
  { key: 'allergenYam', label: 'やまいも' },
  { key: 'allergenApple', label: 'りんご' },
  { key: 'allergenGelatin', label: 'ゼラチン' },
  { key: 'allergenSeafood', label: '魚介類' },
  { key: 'allergenAlmond', label: 'アーモンド' },
] as const

interface AllergenGridStateProps {
  formData: Record<string, any>
  onChange: (key: string, value: boolean) => void
}

export function AllergenGridState({ formData, onChange }: AllergenGridStateProps) {
  return (
    <div className="space-y-6">
      {/* 特定原材料8品目 */}
      <div>
        <h3 className="text-sm font-semibold text-kori-700 mb-3">特定原材料（8品目）</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 p-4 bg-kori-50 rounded-lg border border-kori-200">
          {MAJOR_ALLERGENS.map(({ key, label }) => (
            <label key={key} htmlFor={key} className="form-check group">
              <input
                id={key}
                type="checkbox"
                checked={formData[key] || false}
                onChange={(e) => onChange(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 特定原材料に準ずるもの20品目 */}
      <div>
        <h3 className="text-sm font-semibold text-kori-700 mb-3">特定原材料に準ずるもの（20品目）</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {OTHER_ALLERGENS.map(({ key, label }) => (
            <label key={key} htmlFor={key} className="form-check group">
              <input
                id={key}
                type="checkbox"
                checked={formData[key] || false}
                onChange={(e) => onChange(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}