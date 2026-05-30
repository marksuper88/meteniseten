'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Pencil, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function MyIntakePage() {
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Europe/Amsterdam',
  })

  const [user, setUser] = useState<any>(null)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [nutritionFields, setNutritionFields] = useState<any[]>([])
  const [intakeRows, setIntakeRows] = useState<any[]>([])

  const [date, setDate] = useState(today)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [ingredientId, setIngredientId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [kcalOverig, setKcalOverig] = useState('')

  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editingQuantity, setEditingQuantity] = useState('')

  // MODALS
  const [showIngredientModal, setShowIngredientModal] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)

  // NEW INGREDIENT FORM STATE
  const [newIngredient, setNewIngredient] = useState<any>({})

  // MEAL BUILDER STATE
  const [mealName, setMealName] = useState('')
  const [mealRows, setMealRows] = useState([
  { category: '', ingredient: '', quantity: 1 as number },
])

  const selectedIngredient = ingredients.find((i) => i.id === ingredientId)
  const isOverig = selectedIngredient && selectedIngredient.kcal === null

  useEffect(() => {
  if (selectedCategory === 'Overig') {
    const overigIngredient = ingredients.find(i => i.kcal === null)

    if (overigIngredient) {
      setIngredientId(overigIngredient.id)
    }

    setQuantity('1')
  }
}, [selectedCategory, ingredients])

  // ---------------- ESC CLOSE MODALS ----------------
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIngredientModal(false)
        setShowMealModal(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
    if (!user) return

    const { data: ingredientData } = await supabase
      .from('ingredients')
      .select('*')
      .order('ingredient')

    const loadedIngredients = ingredientData || []
    const filtered = loadedIngredients.filter(
      (i) => i.user_id === null || i.user_id === user.id
    )
    setIngredients(filtered)

    const { data: nf } = await supabase.from('nutrition_fields').select('*')
    setNutritionFields(nf || [])

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const startDateString = startDate.toLocaleDateString('en-CA', {
      timeZone: 'Europe/Amsterdam',
    })

    const { data: intakeData } = await supabase
      .from('intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateString)
      .order('created_at', { ascending: false })

    const enrichedIntake = (intakeData || []).map((row) => {
      const ingredientData = filtered.find((i) => i.id === row.ingredient)
      return { ...row, ingredient_data: ingredientData || null }
    })

    setIntakeRows(enrichedIntake)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase.from('intake').insert([
      {
        date,
        ingredient: ingredientId,
        quantity: Number(quantity),
        kcal_overig: isOverig ? Number(kcalOverig) : null,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) return alert('Opslaan mislukt')

    setSelectedCategory('')
    setIngredientId('')
    setQuantity('')
    setKcalOverig('')
    loadPage()
  }

  // ---------------- DELETE ----------------
  async function handleDelete(id: string) {
    const confirmed = confirm('Weet je zeker dat je deze intake wilt verwijderen?')
    if (!confirmed) return

    await supabase.from('intake').delete().eq('id', id)
    loadPage()
  }

  // ---------------- EDIT SAVE ----------------
  async function handleEditSave(id: string) {
    await supabase
      .from('intake')
      .update({ quantity: Number(editingQuantity) })
      .eq('id', id)

    setEditingRowId(null)
    setEditingQuantity('')
    loadPage()
  }

  // ---------------- INGREDIENT SAVE ----------------
async function handleSaveIngredient() {
  if (!user) return

  const payload: any = {
    user_id: user.id,
    ingredient: newIngredient.ingredient, // FIXED FIELD
    category_1: newIngredient.category_1, // ✅ ADDED (was missing validation-safe inclusion)
    kcal: Number(newIngredient.kcal),     // FIXED FIELD
  }

  nutritionFields.forEach((f) => {
    if (f.field_name !== 'kcal') {
      payload[f.field_name] = newIngredient[f.field_name] ?? null
    }
  })

  // ---------------- VALIDATION ----------------
  if (!payload.ingredient || payload.ingredient.trim() === '') {
    alert('ingredient naam is verplicht')
    return
  }

  if (!payload.category_1) {
    alert('categorie is verplicht')
    return
  }

  if (
    payload.kcal === undefined ||
    payload.kcal === null ||
    payload.kcal === '' ||
    Number.isNaN(payload.kcal)
  ) {
    alert('kcal is verplicht')
    return
  }

  const { error } = await supabase.from('ingredients').insert([payload])

if (error) {
  console.error('INGREDIENT INSERT ERROR:', error)
  alert(error.message)
  return
}

  setShowIngredientModal(false)
  setNewIngredient({})
  loadPage()
}

const intakeCategories = useMemo(() => {
  const dbCats = Array.from(
    new Set(
      ingredients
        .map(i => i.category_1)
        .filter(Boolean)
    )
  )

  return [
    ...dbCats,
    'Overig',
  ]
}, [ingredients])

const mealCategories = useMemo(() => {
  return Array.from(
    new Set(
      ingredients
        .map(i => i.category_1)
        .filter((c) => c === 'Eten' || c === 'Drinken')
    )
  )
}, [ingredients])

const filteredIngredients = useMemo(() => {
  if (!selectedCategory) return []
  if (selectedCategory === 'Overig') {
    return ingredients.filter((i) => i.kcal === null)
  }
  return ingredients.filter((i) => i.category_1 === selectedCategory)
}, [ingredients, selectedCategory])

const selectedDateRows = useMemo(() => {
  return intakeRows.filter((row) => row.date === date)
}, [intakeRows, date])

const groupedTodayRows = useMemo(() => {
  const grouped: any[] = []

  selectedDateRows.forEach((row) => {
    const isOverigRow = row.kcal_overig !== null

    if (isOverigRow) {
      grouped.push({
        ...row,
        displayQuantity: Number(row.quantity),
        displayKcalPerUnit: Number(row.kcal_overig),
        displayKcalTotal: Number(row.quantity) * Number(row.kcal_overig),
      })
      return
    }

    const ingredientId = row.ingredient
    const existing = grouped.find((i) => i.ingredient === ingredientId)

    const kcalPerUnit = Number(row.ingredient_data?.kcal || 0)

    if (existing) {
      existing.displayQuantity += Number(row.quantity)
      existing.displayKcalTotal += Number(row.quantity) * kcalPerUnit
    } else {
      grouped.push({
        ...row,
        displayQuantity: Number(row.quantity),
        displayKcalPerUnit: kcalPerUnit,
        displayKcalTotal: Number(row.quantity) * kcalPerUnit,
      })
    }
  })

  return grouped
}, [selectedDateRows])

const totalKcal = selectedDateRows.reduce((sum, row) => {
  const kcal =
    row.kcal_overig !== null
      ? Number(row.kcal_overig)
      : Number(row.ingredient_data?.kcal || 0)

  return sum + Number(row.quantity) * kcal
}, 0)

async function handleSaveMeal() {
  if (!user) return

  if (!mealName || mealName.trim() === '') {
    alert('Naam maaltijd is verplicht')
    return
  }

  const validRows = mealRows.filter(
    (r) => r.ingredient && Number(r.quantity) > 0
  )

  if (!validRows.length) {
    alert('Geen geldige regels in maaltijd')
    return
  }

  // 🔥 STEP 1: enrich met ingredient data
  const enriched = validRows
    .map((r) => {
      const ing = ingredients.find((i) => i.id === r.ingredient)
      if (!ing) return null
      return {
        ...ing,
        quantity: Number(r.quantity),
      }
    })
    .filter(Boolean)

  // 🔥 STEP 2: helper voor null-safe multiplication
  const sumField = (field: string) => {
    let hasValue = false

    const total = enriched.reduce((sum, i) => {
      const val = i[field]

      if (val === null || val === undefined) return sum

      hasValue = true
      return sum + Number(val) * i.quantity
    }, 0)

    return hasValue ? total : null
  }

  // 🔥 STEP 3: build payload (ONLY allowed columns)
  const payload: any = {
    ingredient: mealName,
    category_1: 'Samengestelde maaltijd',
    user_id: user.id,
    created_at: new Date().toISOString(),
  }

  // jouw expliciete kolommenlijst (exact wat jij zei)
  const fields = [
    'category_2',
    'kcal',
    'fats',
    'saturated_fats',
    'proteins',
    'carbs',
    'sugars',
    'cholesterol',
    'fibers',
    'salt',
    'vitamin_a',
    'vitamin_b1',
    'vitamin_b2',
    'vitamin_b3',
    'vitamin_b6',
    'vitamin_b11',
    'vitamin_b12',
    'vitamin_c',
    'vitamin_d',
    'vitamin_e',
    'vitamin_k',
    'sodium',
    'potassium',
    'calcium',
    'phosphorus',
    'iron',
    'magnesium',
    'copper',
    'zinc',
    'selenium',
    'iodine',
    'manganese',
    'fluorine',
  ]

  fields.forEach((f) => {
    payload[f] = sumField(f)
  })

  // 🔥 STEP 4: INSERT 1 ROW
  const { error } = await supabase
    .from('ingredients')
    .insert([payload])

  if (error) {
    console.error('MEAL INSERT ERROR:', error)
    alert(error.message)
    return
  }

  alert('Maaltijd succesvol opgeslagen!')

  setMealName('')
  setMealRows([{ category: '', ingredient: '', quantity: 1 }])
  setShowMealModal(false)

  loadPage()
}

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <div className="max-w-6xl mx-auto grid gap-6">

        {/* TOP */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* INPUT */}
          <div className="bg-white border-2 border-blue-500 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Nieuwe intake</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-0 w-full">
              <input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  className="w-full block min-w-0 max-w-full border rounded-xl p-3 box-border appearance-none"
  required
/>

              <select value={selectedCategory}
                onChange={(e) => {
  const value = e.target.value
  setSelectedCategory(value)
  setIngredientId('')

  if (value === 'Overig') {
    setQuantity('1')
  }
}}
                className="w-full border rounded-xl p-3"
                required
              >
                <option value="">Selecteer categorie</option>
                {intakeCategories.map(cat => (
  <option key={cat} value={cat}>{cat}</option>
))}
              </select>

              {selectedCategory !== 'Overig' && (
  <select
    value={ingredientId}
    onChange={(e) => setIngredientId(e.target.value)}
    className="w-full border rounded-xl p-3"
    required
  >
    <option value="">Selecteer ingredient</option>
    {filteredIngredients.map((i) => (
      <option key={i.id} value={i.id}>
        {i.ingredient}
      </option>
    ))}
  </select>
)}

              {selectedCategory === 'Overig' ? (
  <input
    type="number"
    value={1}
    disabled
    className="w-full border rounded-xl p-3 bg-gray-100"
  />
) : (
  <input
    type="number"
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
    className="w-full border rounded-xl p-3"
    required
  />
)}

              {isOverig && (
                <input
  type="number"
  value={kcalOverig}
  onChange={(e) => setKcalOverig(e.target.value)}
  className="w-full border rounded-xl p-3"
  placeholder="Kcal"
  required
/>
              )}

              <button className="px-6 py-3 bg-orange-500 text-white rounded-xl">
                Opslaan
              </button>
            </form>
          </div>

{/* Mijn ingredienten */}
<div className="bg-white border-2 border-blue-500 rounded-2xl p-6">
  <h2 className="text-2xl font-bold mb-6">Mijn ingredienten</h2>

  <div className="flex flex-col gap-4">
    
    <Link
      href="/my-ingredients"
      className="px-4 py-3 bg-orange-500 text-white rounded-xl text-center"
    >
      Bekijk mijn ingredienten
    </Link>

    <button
      onClick={() => setShowIngredientModal(true)}
      className="px-4 py-3 bg-orange-500 text-white rounded-xl"
    >
      Voeg nieuw ingredient toe
    </button>

    <button
      onClick={() => setShowMealModal(true)}
      className="px-4 py-3 bg-orange-500 text-white rounded-xl"
    >
      Stel je maaltijd samen
    </button>
  </div>
</div>
</div>

        {/* TABLE */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
  <span>{date}:</span>
  <span>{Math.round(totalKcal)} Kcal</span>
</h2>

          <table className="w-full border-collapse">
            <thead>
  <tr className="border-b">
    <th className="text-left p-3">Ingredient</th>

    <th className="text-left p-3">
  <span className="portrait:hidden">Quantity</span>
  <span className="hidden portrait:inline">#</span>
</th>
    <th className="text-left p-3 portrait:hidden">Kcal / unit</th>

    <th className="text-left p-3">Kcal totaal</th>

    <th className="text-left p-3 portrait:hidden">Actions</th>
  </tr>
</thead>

            <tbody>
  {groupedTodayRows.map((row) => (
    <tr key={row.id} className="border-b">

      {/* INGREDIENT */}
      <td className="p-3">
        {row.ingredient_data?.ingredient}
      </td>

      {/* QUANTITY */}
      <td className="p-3">
  {editingRowId === row.id ? (
    <input
      value={editingQuantity}
      onChange={(e) => setEditingQuantity(e.target.value)}
      className="border p-2 rounded-lg w-20"
    />
  ) : (
    row.displayQuantity
  )}
</td>

      {/* kcal / unit */}
      <td className="p-3 portrait:hidden">
        {row.displayKcalPerUnit}
      </td>

      {/* kcal totaal */}
      <td className="p-3">
        {row.displayKcalTotal}
      </td>

      {/* ACTIONS (hidden on portrait) */}
      <td className="p-3 portrait:hidden">
        <div className="flex gap-2">
          {editingRowId === row.id ? (
            <button
              onClick={() => handleEditSave(row.id)}
              className="p-2 bg-orange-500 text-white rounded-lg"
            >
              <Save size={18} />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingRowId(row.id)
                setEditingQuantity(row.displayQuantity)
              }}
              className="p-2 bg-orange-500 text-white rounded-lg"
            >
              <Pencil size={18} />
            </button>
          )}

          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 bg-orange-500 text-white rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
          <div className="mt-4 flex justify-center">
  <a
    href="/my-nutrition"
    className="bg-orange-500 text-white px-6 py-3 rounded-xl w-full md:w-auto text-center"
  >
    Bekijk je voedingswaarden dashboard
  </a>
</div>
        </div>
      </div>

{/* ---------------- MODAL 1 ---------------- */}
{showIngredientModal && (
  <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-2xl w-[600px] max-w-[95vw] min-w-0 max-h-[80vh] overflow-y-auto relative">

      {/* CLOSE */}
      <button
        onClick={() => setShowIngredientModal(false)}
        className="absolute top-3 right-3 text-xl"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4">Nieuw ingredient</h2>

      <div className="flex flex-col gap-3">

        {/* ---------------- INGREDIENT NAAM ---------------- */}
        <div className="flex items-center gap-3">
          <label className="w-1/2">Ingredient naam</label>
          <input
            className="border p-2 rounded-lg w-full"
            placeholder="Verplicht veld"
            value={newIngredient.ingredient || ''}
            onChange={(e) =>
              setNewIngredient({
                ...newIngredient,
                ingredient: e.target.value,
              })
            }
          />
        </div>

        {/* ---------------- CATEGORIE ---------------- */}
        <div className="flex items-center gap-3">
          <label className="w-1/2">Categorie</label>
          <select
            className="border p-2 rounded-lg w-full"
            value={newIngredient.category_1 || ''}
            onChange={(e) =>
              setNewIngredient({
                ...newIngredient,
                category_1: e.target.value,
              })
            }
          >
            <option value="">Verplicht veld</option>
            <option value="Eten">Eten</option>
            <option value="Drinken">Drinken</option>
          </select>
        </div>

        {/* ---------------- REST VAN DE VELDEN ---------------- */}
        {nutritionFields
          .filter(f => f.field_name !== 'user_id')
          .map((f) => {
            const isRequired = f.field_name === 'kcal'

            return (
              <div key={f.field_name} className="flex items-center gap-3">

                <label className="w-1/2">
                  {f.display_name_nl}
                </label>

                <input
                  className="border p-2 rounded-lg w-full"
                  placeholder={isRequired ? 'Verplicht veld' : 'Optioneel veld'}
                  value={newIngredient[f.field_name] || ''}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      [f.field_name]: e.target.value,
                    })
                  }
                />
              </div>
            )
          })}

        <button
          onClick={handleSaveIngredient}
          className="mt-4 bg-orange-500 text-white p-3 rounded-xl"
        >
          Opslaan
        </button>
      </div>
    </div>
  </div>
)}

      {/* ---------------- MODAL 2 ---------------- */}
      {showMealModal && (
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[700px] max-h-[80vh] overflow-y-auto relative">

            {/* CLOSE */}
            <button
              onClick={() => setShowMealModal(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Maaltijd samenstellen</h2>

            <input
              className="w-full border p-2 rounded-lg mb-4"
              placeholder="Naam maaltijd"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />

            {mealRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={row.category}
                  onChange={(e) => {
                    const copy = [...mealRows]
                    copy[idx].category = e.target.value
                    copy[idx].ingredient = ''
                    setMealRows(copy)
                  }}
                  className="border p-2 rounded-lg"
                >
                  <option value="">Categorie</option>
                  {mealCategories.map(cat => (
  <option key={cat} value={cat}>{cat}</option>
))}
                </select>

                <select
                  value={row.ingredient}
                  onChange={(e) => {
                    const copy = [...mealRows]
                    copy[idx].ingredient = e.target.value
                    setMealRows(copy)
                  }}
                  className="border p-2 rounded-lg"
                >
                  <option value="">Ingredient</option>
                  {ingredients
                    .filter((i) =>
                      row.category ? i.category_1 === row.category : true
                    )
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.ingredient}
                      </option>
                    ))}
                </select>

                <input
  type="number"
  value={row.quantity}
  onChange={(e) => {
    const copy = [...mealRows]
    copy[idx].quantity = Number(e.target.value)
    setMealRows(copy)
  }}
  className="border p-2 rounded-lg"
/>
              </div>
            ))}

            <button
              onClick={() =>
                setMealRows([
                  ...mealRows,
                  { category: '', ingredient: '', quantity: 1 },
                ])
              }
              className="mt-2 text-sm text-blue-600"
            >
              + regel toevoegen
            </button>

            <button
              onClick={handleSaveMeal}
              className="mt-4 bg-orange-500 text-white p-3 rounded-xl w-full"
            >
              Opslaan maaltijd
            </button>
          </div>
        </div>
      )}
    </div>
  )
}