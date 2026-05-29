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

export default function NutritionDashboard() {

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Europe/Amsterdam',
  })

  const [user, setUser] = useState<any>(null)
  const [date, setDate] = useState(today)
  const [group, setGroup] = useState('Algemeen')

  const [fields, setFields] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])

  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  const lineColors = ['#f97316', '#3b82f6', '#22c55e', '#e11d48', '#8b5cf6']

  useEffect(() => {
    load()
  }, [])

  async function load() {

    const { data: auth } = await supabase.auth.getUser()
    setUser(auth.user)
    if (!auth.user) return

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const start = startDate.toLocaleDateString('en-CA', {
      timeZone: 'Europe/Amsterdam',
    })

    const { data: nutrition } = await supabase
      .from('daily_nutrition')
      .select('*')
      .eq('user_id', auth.user.id)
      .gte('date', start)
      .order('date', { ascending: true })

    setRows(nutrition || [])

    const { data: meta } = await supabase
      .from('nutrition_fields')
      .select('*')
      .order('sort_order')

    setFields(meta || [])
  }

  // =========================
  // ACTIVE FIELDS
  // =========================
  const activeFields = useMemo(() => {
    return fields.filter(f =>
      (f.group_name_nl || '').toLowerCase() === group.toLowerCase()
    )
  }, [fields, group])

  // =========================
  // ROW
  // =========================
  const selectedRow = useMemo(() => {
    return rows.find(r => r.date === date)
  }, [rows, date])

  // =========================
  // 🔥 CORRECT FIXED FORMATTER
  // =========================
  function formatValue(value: any) {
    if (value === null || value === undefined) return '0'

    const num = Number(value)
    if (Number.isNaN(num)) return '0'

    const decimals =
      group === 'Algemeen' ? 2 : 3

    // round first, then trim cleanly
    return Number(num.toFixed(decimals))
      .toString()
  }

  // =========================
  // TABLE
  // =========================
  const tableRows = useMemo(() => {

    if (!selectedRow) return []

    return activeFields.map(field => {

      const key = field.field_name

      return {
        label: field.display_name_nl,
        value: formatValue(selectedRow?.[key]),
        total_7d: formatValue(selectedRow?.[`seven_day_total_${key}`]),
        avg_7d: formatValue(selectedRow?.[`seven_day_avg_${key}`]),
        percent: 'X',
      }
    })

  }, [activeFields, selectedRow, group])

  // =========================
  // CHART OPTIONS
  // =========================
  const chartOptions = useMemo(() => {
    return activeFields.map(f => f.field_name)
  }, [activeFields])

  useEffect(() => {
    if (chartOptions.length > 0 && selectedSeries.length === 0) {
      setSelectedSeries([chartOptions[0]])
    }
  }, [chartOptions])

  function addSeries() {
    setSelectedSeries(prev => [...prev, ''])
  }

  function updateSeries(i: number, value: string) {
    const copy = [...selectedSeries]
    copy[i] = value
    setSelectedSeries(copy)
  }

  function removeSeries(i: number) {
    if (i === 0 && selectedSeries.length === 1) return

    const copy = [...selectedSeries]
    copy.splice(i, 1)

    setSelectedSeries(copy.length ? copy : [''])
  }

  // =========================
  // CHART DATA
  // =========================
  const chartData = useMemo(() => {

    return rows.map(r => {

      const obj: any = { date: r.date }

      selectedSeries.forEach(s => {
        obj[s] = r?.[s] ?? 0
      })

      return obj
    })

  }, [rows, selectedSeries])

  return (
    <div className="min-h-screen bg-blue-100 p-6">

      <div className="max-w-6xl mx-auto grid gap-6">

        {/* CONTAINER 1 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 grid md:grid-cols-2 gap-4">

          <div>
            <label className="font-semibold">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold">Groep</label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full border p-3 rounded-xl"
            >
              <option value="Algemeen">Algemeen</option>
              <option value="Vitaminen">Vitaminen</option>
              <option value="Mineralen">Mineralen</option>
            </select>
          </div>

        </div>

        {/* CONTAINER 2 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Voeding</th>
                <th className="text-left p-3">Waarde</th>
                <th className="text-left p-3">7d totaal</th>
                <th className="text-left p-3">7d avg</th>
                <th className="text-left p-3">% ADH</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b">

                  <td className="p-3 font-medium">
                    {row.label}
                  </td>

                  <td className="p-3">{row.value}</td>
                  <td className="p-3">{row.total_7d}</td>
                  <td className="p-3">{row.avg_7d}</td>
                  <td className="p-3">{row.percent}</td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* CONTAINER 3 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500">

          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Chart controls</h2>

            <button
              onClick={addSeries}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              + Series
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-3">

            {selectedSeries.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">

                <select
                  value={s}
                  onChange={(e) => updateSeries(i, e.target.value)}
                  className="border p-2 rounded-xl w-full"
                >
                  <option value="">None</option>
                  {chartOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {i !== 0 && (
                  <button
                    onClick={() => removeSeries(i)}
                    className="text-red-500 font-bold px-2"
                  >
                    ×
                  </button>
                )}

              </div>
            ))}

          </div>

        </div>

        {/* CONTAINER 4 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 h-[500px]">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              {selectedSeries.map((s, i) => (
                s && (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={lineColors[i % lineColors.length]}
                    strokeWidth={3}
                  />
                )
              ))}

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>
    </div>
  )
}