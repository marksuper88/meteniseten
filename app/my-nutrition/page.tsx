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

type MetricMode = 'today' | 'total7d' | 'avg7d' | 'percent7d'

type Series = {
  id: string
  field: string
}

export default function NutritionDashboard() {

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Europe/Amsterdam',
  })

  const [date, setDate] = useState(today)
  const [group, setGroup] = useState('Algemeen')

  const [fields, setFields] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [adh, setAdh] = useState<any>(null)

  const [metric, setMetric] = useState<MetricMode>('avg7d')
  const [selectedSeries, setSelectedSeries] = useState<Series[]>([])

  const seriesColorPairs = [
    { main: '#f97316', light: '#fdba74' },
    { main: '#3b82f6', light: '#93c5fd' },
    { main: '#22c55e', light: '#86efac' },
    { main: '#e11d48', light: '#fda4af' },
    { main: '#8b5cf6', light: '#c4b5fd' },
  ]

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: auth } = await supabase.auth.getUser()
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

    const { data: adhData } = await supabase
      .from('user_adh')
      .select('*')
      .eq('user_id', auth.user.id)
      .single()

    setAdh(adhData)
  }

  const activeFields = useMemo(() => {
    return fields.filter(f =>
      (f.group_name_nl || '').toLowerCase() === group.toLowerCase()
    )
  }, [fields, group])

  const chartOptions = useMemo(() => {
    return activeFields.map(f => ({
      key: f.field_name,
      label: f.display_name_nl,
    }))
  }, [activeFields])

  const selectedRow = useMemo(() => {
    return rows.find(r => r.date === date)
  }, [rows, date])

  function formatValue(value: any) {
  if (value === null || value === undefined) return '0'
  const num = Number(value)
  if (Number.isNaN(num)) return '0'
  return num
    .toFixed(group === 'Algemeen' ? 2 : 3)
    .replace(/\.?0+$/, '')
}

  function formatChartValue(value: any) {
    if (value === null || value === undefined) return '0'
    const num = Number(value)
    if (Number.isNaN(num)) return '0'
    return num.toFixed(2).replace(/\.?0+$/, '')
  }

  function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max)
  }

  useEffect(() => {
    if (chartOptions.length && selectedSeries.length === 0) {
      setSelectedSeries([
        { id: crypto.randomUUID(), field: chartOptions[0].key }
      ])
    }
  }, [chartOptions])

  function addSeries() {
    setSelectedSeries(prev => [
      ...prev,
      { id: crypto.randomUUID(), field: chartOptions[0]?.key || '' }
    ])
  }

  function updateSeries(id: string, field: string) {
    setSelectedSeries(prev =>
      prev.map(s => (s.id === id ? { ...s, field } : s))
    )
  }

  function removeSeries(id: string) {
    setSelectedSeries(prev => prev.filter(s => s.id !== id))
  }

  const isPercent = metric === 'percent7d'

  const statsRow = useMemo(() => {
  return [...rows]
    .filter(r => r.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
}, [rows, date])

  const tableRows = useMemo(() => {
  return activeFields.map(field => {
      const key = field.field_name

      const avg7d = statsRow?.[`seven_day_avg_${key}`]
      const target = adh?.[key]

      const percent = target && avg7d
        ? (avg7d / target) * 100
        : 0

      return {
        label: field.display_name_nl,
        value:
  selectedRow?.[key] === null ||
  selectedRow?.[key] === undefined
    ? ''
    : formatValue(selectedRow[key]),
        total_7d: formatValue(statsRow?.[`seven_day_total_${key}`]),
        avg_7d: formatValue(avg7d),
        adh_target: target ? formatValue(target) : '0',
        percent,
      }
    })
  }, [activeFields, selectedRow, adh])

  const chartData = useMemo(() => {
    return rows.map(r => {
      const obj: any = { date: r.date }

      selectedSeries.forEach(s => {
        const key = s.field
        const target = adh?.[key]

        let value = 0

        if (metric === 'today') value = r?.[key] ?? 0
        if (metric === 'total7d') value = r?.[`seven_day_total_${key}`] ?? 0
        if (metric === 'avg7d') value = r?.[`seven_day_avg_${key}`] ?? 0
        if (metric === 'percent7d') {
          const avg = r?.[`seven_day_avg_${key}`]
          value = target && avg ? (avg / target) * 100 : 0
        }

        obj[s.id] = value

        if (!isPercent) {
          obj[`${s.id}_target`] = target ?? 0
        }
      })

      return obj
    })
  }, [rows, selectedSeries, adh, metric])

  // ✅ FIXED TOOLTIP (correct mapping uuid → field → label)
  function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null

    return (
      <div className="bg-white border rounded-xl p-3 shadow-md text-sm">
        <div className="font-semibold mb-2">{label}</div>

        {payload.map((p: any, i: number) => {
          const isTarget = p.dataKey?.toString().includes('_target')

          const series = selectedSeries.find(s =>
            isTarget
              ? `${s.id}_target` === p.dataKey
              : s.id === p.dataKey
          )

          const labelText = isTarget
            ? 'Target'
            : chartOptions.find(c => c.key === series?.field)?.label

          return (
            <div key={i} className="flex justify-between gap-4 items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-gray-600">
                  {labelText ?? 'Unknown'}
                </span>
              </div>

              <span className="font-medium">
                {formatChartValue(p.value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-100 p-6">

      <div className="max-w-6xl mx-auto grid gap-6">

        {/* SELECT */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Selecteer</h2>

          <div className="grid md:grid-cols-2 gap-4">

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
              <label className="font-semibold">Voedingsgroep</label>
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
        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Overzicht {group}</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Voeding</th>
                <th className="text-left p-3">Daily</th>
                <th className="text-left p-3">7d totaal</th>
                <th className="text-left p-3">7d avg</th>
                <th className="text-left p-3">ADH</th>
                <th className="text-left p-3">% ADH</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 font-medium">{row.label}</td>
                  <td className="p-3">{row.value}</td>
                  <td className="p-3">{row.total_7d}</td>
                  <td className="p-3">{row.avg_7d}</td>
                  <td className="p-3">{row.adh_target}</td>

                  <td className="p-3 w-[260px]">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={
                            row.percent < 80
                              ? 'bg-orange-400'
                              : row.percent <= 120
                                ? 'bg-green-500'
                                : 'bg-red-500'
                          }
                          style={{
                            width: `${clamp(row.percent, 0, 200)}%`,
                            height: '100%',
                          }}
                        />
                      </div>

                      <span className="text-sm min-w-[60px] text-right">
                        {formatValue(row.percent)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CHART CONTROLS */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">

          <h2 className="text-lg font-bold mb-4">Chart Controls</h2>

          <div className="mb-6">
            <label className="font-semibold block mb-2">Metric</label>

            <div className="md:w-1/3">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as MetricMode)}
                className="border p-3 rounded-xl w-full"
              >
                <option value="today">Daily</option>
                <option value="total7d">7d totaal</option>
                <option value="avg7d">7d avg</option>
                <option value="percent7d">% ADH 7d</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <label className="font-semibold">Series</label>

            <button
              onClick={addSeries}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              + Series
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {selectedSeries.map((s) => (
              <div key={s.id} className="flex gap-2">
                <select
                  value={s.field}
                  onChange={(e) => updateSeries(s.id, e.target.value)}
                  className="border p-3 rounded-xl w-full"
                >
                  {chartOptions.map(o => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeSeries(s.id)}
                  className="text-red-500 font-bold px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
  domain={isPercent ? [0, 100] : undefined}
  width={40}
/>

              {/* FIXED TOOLTIP */}
              <Tooltip content={<CustomTooltip />} />

              {selectedSeries.flatMap((s, i) => {
  const color = seriesColorPairs[i % seriesColorPairs.length]

  return [
    <Line
      key={s.id}
      type="monotone"
      dataKey={s.id}
      stroke={color.main}
      strokeWidth={3}
    />,

    ...(!isPercent
      ? [
          <Line
            key={`${s.id}_target`}
            type="monotone"
            dataKey={`${s.id}_target`}
            stroke={color.light}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />,
        ]
      : []),
  ]
})}
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}