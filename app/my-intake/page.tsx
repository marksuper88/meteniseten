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

export default function MyIntakePage() {

  const today = new Date().toLocaleDateString(
    'en-CA',
    {
      timeZone: 'Europe/Amsterdam',
    }
  )

  const [user, setUser] = useState<any>(null)

  const [ingredients, setIngredients] = useState<any[]>([])

  const [intakeRows, setIntakeRows] = useState<any[]>([])
  const [todayRows, setTodayRows] = useState<any[]>([])

  const [date, setDate] = useState(today)
  const [ingredientId, setIngredientId] = useState('')
  const [quantity, setQuantity] = useState('')

  const [series1, setSeries1] = useState('')
  const [series2, setSeries2] = useState('')

  const [yMin, setYMin] = useState('0')
  const [yMax, setYMax] = useState('500')

  const selectableFields = [
    'quantity',
    'kcal',
    'fats',
    'proteins',
    'carbs',
    'fibers',
    'salt',
    'sugars',
  ]

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
      error: ingredientError,
    } = await supabase
      .from('ingredients')
      .select('*')
      .order('ingredient')

    console.log('INGREDIENTS')
    console.log(ingredientData)
    console.log(ingredientError)

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
      error: intakeError,
    } = await supabase
      .from('intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateString)
      .order('date', {
        ascending: true,
      })

    console.log('INTAKE')
    console.log(intakeData)
    console.log(intakeError)

    // MANUAL JOIN

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
            quantity: Number(quantity),
            user_id: user.id,
            created_at:
              new Date().toISOString(),
          },
        ])

    console.log('INSERT')
    console.log(error)

    if (error) {
      alert('Opslaan mislukt')
      return
    }

    alert('Intake opgeslagen')

    setIngredientId('')
    setQuantity('')

    loadPage()
  }

  const chartData = useMemo(() => {

    return intakeRows.map((row) => {

      const ingredient =
        row.ingredient_data

      const factor =
        Number(row.quantity) / 100

      function getValue(field: string) {

        if (!field) return null

        if (field === 'quantity') {
          return Number(row.quantity)
        }

        return (
          Number(
            ingredient?.[field] || 0
          ) * factor
        )
      }

      return {
        date: row.date,
        series1: getValue(series1),
        series2: getValue(series2),
      }
    })

  }, [
    intakeRows,
    series1,
    series2,
  ])

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
            Intake vandaag
          </h2>

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">
                  Tijd
                </th>

                <th className="text-left p-3">
                  Ingredient
                </th>

                <th className="text-left p-3">
                  Quantity
                </th>

              </tr>

            </thead>

            <tbody>

              {todayRows.map((row) => (

                <tr
                  key={row.id}
                  className="border-b"
                >

                  <td className="p-3">

                    {new Date(
                      row.created_at
                    ).toLocaleTimeString(
                      'nl-NL',
                      {
                        hour: '2-digit',
                        minute:
                          '2-digit',
                        timeZone:
                          'Europe/Amsterdam',
                      }
                    )}

                  </td>

                  <td className="p-3">

                    {
                      row
                        .ingredient_data
                        ?.ingredient
                    }

                  </td>

                  <td className="p-3">
                    {row.quantity}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* CHART CONTROLS */}

        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Chart controls
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <div>

              <label className="block mb-2 font-semibold">
                Series 1
              </label>

              <select
                value={series1}
                onChange={(e) =>
                  setSeries1(
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

            <div>

              <label className="block mb-2 font-semibold">
                Series 2
              </label>

              <select
                value={series2}
                onChange={(e) =>
                  setSeries2(
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

            <div>

              <label className="block mb-2 font-semibold">
                Y-axis min
              </label>

              <input
                type="number"
                value={yMin}
                onChange={(e) =>
                  setYMin(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-semibold">
                Y-axis max
              </label>

              <input
                type="number"
                value={yMax}
                onChange={(e) =>
                  setYMax(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
              />

            </div>

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

                <YAxis
                  domain={[
                    Number(yMin),
                    Number(yMax),
                  ]}
                />

                <Tooltip />

                {series1 && (
                  <Line
                    type="monotone"
                    dataKey="series1"
                    stroke="#f97316"
                    strokeWidth={3}
                  />
                )}

                {series2 && (
                  <Line
                    type="monotone"
                    dataKey="series2"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                )}

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}