'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MyIngredientsPage() {
  const [user, setUser] = useState<any>(null)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [nutritionFields, setNutritionFields] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)

    if (!user) return

    const { data: ing } = await supabase.from('ingredients').select('*')
    const { data: nf } = await supabase.from('nutrition_fields').select('*')

    setIngredients(ing || [])
    setNutritionFields(nf || [])
  }

  const groups = useMemo(() => {
    return Array.from(
      new Set(nutritionFields.map((f) => f.group_name_nl).filter(Boolean))
    )
  }, [nutritionFields])

  const fieldsInGroup = useMemo(() => {
    if (!selectedGroup) return []
    return nutritionFields.filter(
      (f) => f.group_name_nl === selectedGroup
    )
  }, [nutritionFields, selectedGroup])

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((i) => {
      const belongsToUser = i.user_id === null || i.user_id === user?.id
      const matchesType = selectedType ? i.category_1 === selectedType : true
      return belongsToUser && matchesType
    })
  }, [ingredients, user, selectedType])

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* FILTER CONTAINER */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Mijn ingrediënten</h1>

          <p className="text-sm text-gray-600 mb-4">
            Selecteer voedingswaarden groep
          </p>

          <select
            className="w-full border p-3 rounded-xl mb-6"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Selecteer voedingswaardegroep</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <p className="text-sm text-gray-600 mb-4">
            Selecteer type voeding
          </p>

          <select
            className="w-full border p-3 rounded-xl"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Alle types</option>
            <option value="Eten">Eten</option>
            <option value="Drinken">Drinken</option>
            <option value="Samengestelde maaltijd">
              Samengestelde maaltijd
            </option>
          </select>
        </div>

        {/* TABLE CONTAINER (strak) */}
        {selectedGroup && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
  <tr className="bg-blue-500 text-white">
    <th className="text-left p-3">Ingredient</th>

    {fieldsInGroup.map((f, idx) => (
      <th
        key={f.field_name}
        className={`p-3 text-center ${
          idx > 0 ? 'border-l border-dotted border-white/40' : ''
        }`}
      >
        {f.display_name_nl}
      </th>
    ))}
  </tr>

  <tr className="bg-blue-300 text-white text-xs">
    <th className="text-left p-2">UOM</th>

    {fieldsInGroup.map((f, idx) => (
      <th
        key={f.field_name}
        className={`p-2 text-center ${
          idx > 0 ? 'border-l border-dotted border-white/40' : ''
        }`}
      >
        {f.uom}
      </th>
    ))}
  </tr>
</thead>

                <tbody>
                  {filteredIngredients.map((ing) => (
                    <tr key={ing.id} className="border-b">
                      <td className="p-3 font-medium text-left">
                        {ing.ingredient}
                      </td>

                      {fieldsInGroup.map((f, idx) => (
                        <td
                          key={f.field_name}
                          className={`p-3 text-center ${
                            idx > 0
                              ? 'border-l border-dotted border-gray-200'
                              : ''
                          }`}
                        >
                          {ing[f.field_name] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}