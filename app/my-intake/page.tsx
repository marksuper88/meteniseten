'use client'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

import {
  Pencil,
  Save,
  Trash2,
} from 'lucide-react'

export default function MyIntakePage() {

  const today = new Date().toLocaleDateString(
    'en-CA',
    {
      timeZone: 'Europe/Amsterdam',
    }
  )

  const [user, setUser] = useState<any>(null)

  const [ingredients, setIngredients] =
    useState<any[]>([])

  const [intakeRows, setIntakeRows] =
    useState<any[]>([])

  const [todayRows, setTodayRows] =
    useState<any[]>([])

  const [
    dailyNutritionRows,
    setDailyNutritionRows,
  ] = useState<any[]>([])

  const [date, setDate] = useState(today)

  const [ingredientId, setIngredientId] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [kcalOverig, setKcalOverig] =
    useState('')

  const [selectedSeries, setSelectedSeries] =
    useState<string[]>(['', ''])

  const [
    editingRowId,
    setEditingRowId,
  ] = useState<string | null>(null)

  const [
    editingQuantity,
    setEditingQuantity,
  ] = useState('')

  const lineColors = [
    '#f97316',
    '#3b82f6',
    '#22c55e',
    '#e11d48',
    '#8b5cf6',
    '#14b8a6',
    '#f59e0b',
    '#6366f1',
  ]

  const selectableFields = useMemo(() => {

    if (
      !dailyNutritionRows ||
      dailyNutritionRows.length === 0
    ) {
      return []
    }

    return Object.keys(
      dailyNutritionRows[0]
    ).filter(
      (key) =>
        ![
          'id',
          'ingredient',
          'category',
          'user_id',
          'date',
          'created_at',
        ].includes(key)
    )

  }, [dailyNutritionRows])

  const selectedIngredient =
    ingredients.find(
      (ingredient) =>
        ingredient.id === ingredientId
    )

  const isOverig =
    selectedIngredient &&
    selectedIngredient.kcal === null

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)

    if (!user) return

    // LOAD INGREDIENTS

    const {
      data: ingredientData,
    } = await supabase
      .from('ingredients')
      .select('*')
      .order('ingredient')

    const loadedIngredients =
      ingredientData || []

    setIngredients(loadedIngredients)

    // LAST 30 DAYS

    const startDate = new Date()

    startDate.setDate(
      startDate.getDate() - 30
    )

    const startDateString =
      startDate.toLocaleDateString(
        'en-CA',
        {
          timeZone: 'Europe/Amsterdam',
        }
      )

    // LOAD INTAKE

    const {
      data: intakeData,
    } = await supabase
      .from('intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateString)
      .order('created_at', {
        ascending: false,
      })

    const enrichedIntake =
      (intakeData || []).map((row) => {

        const ingredientData =
          loadedIngredients.find(
            (ingredient) =>
              ingredient.id ===
              row.ingredient
          )

        return {
          ...row,
          ingredient_data:
            ingredientData || null,
        }
      })

    setIntakeRows(enrichedIntake)

    // TODAY TABLE

    const todayOnly =
      enrichedIntake.filter(
        (row) => row.date === today
      )

    setTodayRows(todayOnly)

    // LOAD DAILY NUTRITION VIEW

    const {
      data: nutritionData,
    } = await supabase
      .from('daily_nutrition')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateString)
      .order('date', {
        ascending: true,
      })

    setDailyNutritionRows(
      nutritionData || []
    )
  }

  async function handleSubmit(e: any) {

    e.preventDefault()

    if (!user) return

    const { error } =
      await supabase
        .from('intake')
        .insert([
          {
            date,
            ingredient: ingredientId,
            quantity:
              Number(quantity),
            kcal_overig:
              isOverig
                ? Number(
                    kcalOverig
                  )
                : null,
            user_id: user.id,
            created_at:
              new Date().toISOString(),
          },
        ])

    if (error) {
      alert('Opslaan mislukt')
      return
    }

    alert('Intake opgeslagen')

    setIngredientId('')
    setQuantity('')
    setKcalOverig('')

    loadPage()
  }

  async function handleDelete(
    id: string
  ) {

    const confirmed =
      confirm(
        'Weet je zeker dat je deze intake wilt verwijderen?'
      )

    if (!confirmed) return

    const { error } =
      await supabase
        .from('intake')
        .delete()
        .eq('id', id)

    if (error) {
      alert('Verwijderen mislukt')
      return
    }

    loadPage()
  }

  async function handleEditSave(
    id: string
  ) {

    const { error } =
      await supabase
        .from('intake')
        .update({
          quantity:
            Number(
              editingQuantity
            ),
        })
        .eq('id', id)

    if (error) {
      alert('Opslaan mislukt')
      return
    }

    setEditingRowId(null)
    setEditingQuantity('')

    loadPage()
  }

  function addSeries() {

    setSelectedSeries([
      ...selectedSeries,
      '',
    ])
  }

  function removeSeries(
    index: number
  ) {

    if (
      selectedSeries.length <= 2
    ) {
      return
    }

    const updated =
      selectedSeries.filter(
        (_, i) => i !== index
      )

    setSelectedSeries(updated)
  }

  function updateSeries(
    index: number,
    value: string
  ) {

    const updated =
      [...selectedSeries]

    updated[index] = value

    setSelectedSeries(updated)
  }

  const chartData = useMemo(() => {

    return dailyNutritionRows.map(
      (row) => {

        const dataPoint: any = {
          date: row.date,
        }

        selectedSeries.forEach(
          (series) => {

            if (!series) return

            dataPoint[series] =
              Number(
                row[series] || 0
              )
          }
        )

        return dataPoint
      }
    )

  }, [
    dailyNutritionRows,
    selectedSeries,
  ])

  const groupedTodayRows = useMemo(() => {

    const grouped: any[] = []

    todayRows.forEach((row) => {

      const isOverigRow =
        row.kcal_overig !== null

      // OVERIG NIET GROEPEREN

      if (isOverigRow) {

        grouped.push({
          ...row,
          displayQuantity:
            Number(row.quantity),
          displayKcalPerUnit:
            Number(row.kcal_overig),
          displayKcalTotal:
            Number(row.quantity) *
            Number(row.kcal_overig),
        })

        return
      }

      const ingredientId =
        row.ingredient

      const existing =
        grouped.find(
          (item) =>
            item.ingredient ===
            ingredientId
        )

      const kcalPerUnit =
        Number(
          row.ingredient_data
            ?.kcal || 0
        )

      if (existing) {

        existing.displayQuantity +=
          Number(row.quantity)

        existing.displayKcalTotal +=
          Number(row.quantity) *
          kcalPerUnit

      } else {

        grouped.push({
          ...row,
          displayQuantity:
            Number(row.quantity),
          displayKcalPerUnit:
            kcalPerUnit,
          displayKcalTotal:
            Number(row.quantity) *
            kcalPerUnit,
        })

      }

    })

    return grouped

  }, [todayRows])

  const totalTodayKcal =
    todayRows.reduce(
      (sum, row) => {

        const kcal =
          row.kcal_overig !==
          null
            ? Number(
                row.kcal_overig
              )
            : Number(
                row
                  .ingredient_data
                  ?.kcal || 0
              )

        return (
          sum +
          Number(row.quantity) *
            kcal
        )

      },
      0
    )

  return (
    <div className="min-h-screen bg-blue-100 p-6">

      <div className="max-w-6xl mx-auto grid gap-6">

        {/* INPUT CONTAINER */}

        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Nieuwe intake
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-3 gap-4"
          >

            <div>

              <label className="block mb-2 font-semibold">
                Datum
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-semibold">
                Ingredient
              </label>

              <select
                value={ingredientId}
                onChange={(e) =>
                  setIngredientId(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                required
              >

                <option value="">
                  Selecteer ingredient
                </option>

                {ingredients.map(
                  (ingredient) => (
                    <option
                      key={ingredient.id}
                      value={ingredient.id}
                    >
                      {
                        ingredient.ingredient
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block mb-2 font-semibold">
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                required
              />

            </div>

            {isOverig && (

              <div>

                <label className="block mb-2 font-semibold">
                  Kcal
                </label>

                <input
                  type="number"
                  value={kcalOverig}
                  onChange={(e) =>
                    setKcalOverig(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                  required
                />

              </div>

            )}

            <div className="md:col-span-3">

              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-blue-400 transition"
              >
                Opslaan
              </button>

            </div>

          </form>

        </div>

        {/* TODAY TABLE */}

        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 overflow-x-auto">

          <h2 className="text-2xl font-bold mb-6">

            Intake vandaag:
            {' '}
            {Math.round(
              totalTodayKcal
            )}
            {' '}
            kcal

          </h2>

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">
                  Ingredient
                </th>

                <th className="text-left p-3">
                  Quantity
                </th>

                <th className="text-left p-3">
                  Kcal / unit
                </th>

                <th className="text-left p-3">
                  Kcal totaal
                </th>

                <th className="text-left p-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {groupedTodayRows.map(
                (row) => {

                  const kcalPerUnit =
                    row.displayKcalPerUnit

                  const kcalTotal =
                    row.displayKcalTotal

                  return (

                    <tr
                      key={row.id}
                      className="border-b"
                    >

                      <td className="p-3">

                        {
                          row
                            .ingredient_data
                            ?.ingredient
                        }

                      </td>

                      <td className="p-3">

                        {editingRowId ===
                        row.id ? (

                          <input
                            type="number"
                            value={
                              editingQuantity
                            }
                            onChange={(e) =>
                              setEditingQuantity(
                                e.target.value
                              )
                            }
                            className="border rounded-lg p-2 w-24"
                          />

                        ) : (
                          row.displayQuantity
                        )}

                      </td>

                      <td className="p-3">
                        {kcalPerUnit}
                      </td>

                      <td className="p-3">
                        {kcalTotal}
                      </td>

                      <td className="p-3">

                        <div className="flex gap-2">

                          {editingRowId ===
                          row.id ? (

                            <button
                              onClick={() =>
                                handleEditSave(
                                  row.id
                                )
                              }
                              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition"
                            >
                              <Save size={18} />
                            </button>

                          ) : (

                            <button
                              onClick={() => {

                                setEditingRowId(
                                  row.id
                                )

                                setEditingQuantity(
                                  row.displayQuantity.toString()
                                )

                              }}
                              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition"
                            >
                              <Pencil size={18} />
                            </button>

                          )}

                          <button
                            onClick={() =>
                              handleDelete(
                                row.id
                              )
                            }
                            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                }
              )}

            </tbody>

          </table>

        </div>

        {/* CHART CONTROLS */}

        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              Chart controls
            </h2>

            <button
              type="button"
              onClick={addSeries}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-blue-400 transition"
            >
              + Series
            </button>

          </div>

          <div className="grid md:grid-cols-4 gap-4">

            {selectedSeries.map(
              (
                selected,
                index
              ) => (

                <div
                  key={index}
                  className="border rounded-xl p-3"
                >

                  <div className="flex items-center justify-between mb-2">

                    <label className="font-semibold">

                      Series {index + 1}

                    </label>

                    {selectedSeries.length >
                      2 && (

                      <button
                        type="button"
                        onClick={() =>
                          removeSeries(
                            index
                          )
                        }
                        className="text-red-500 font-bold"
                      >
                        ×
                      </button>

                    )}

                  </div>

                  <select
                    value={selected}
                    onChange={(e) =>
                      updateSeries(
                        index,
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3"
                  >

                    <option value="">
                      Geen
                    </option>

                    {selectableFields.map(
                      (field) => (
                        <option
                          key={field}
                          value={field}
                        >
                          {field}
                        </option>
                      )
                    )}

                  </select>

                </div>

              )
            )}

          </div>

        </div>

        {/* CHART */}

        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Grafiek
          </h2>

          <div className="w-full h-[500px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis />

                <Tooltip />

                {selectedSeries.map(
                  (
                    series,
                    index
                  ) => {

                    if (!series)
                      return null

                    return (
                      <Line
                        key={
                          series +
                          index
                        }
                        type="monotone"
                        dataKey={series}
                        name={series}
                        stroke={
                          lineColors[
                            index %
                              lineColors.length
                          ]
                        }
                        strokeWidth={3}
                      />
                    )
                  }
                )}

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}