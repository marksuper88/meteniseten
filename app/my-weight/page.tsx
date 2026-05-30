"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type WeightRow = {
  date: string;
  morning: number | null;
  night: number | null;
};

export default function MyWeightPage() {
  // =========================
  // AUTH
  // =========================
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setReady(true);
    });
  }, []);

  // =========================
  // TARGET WEIGHT
  // =========================
  const [targetWeight, setTargetWeight] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("target_weight")
        .eq("user_id", userId)
        .single();

      setTargetWeight(data?.target_weight?.toString() ?? "");
    }

    loadProfile();
  }, [userId]);

  async function handleSaveTargetWeight() {
    if (!userId) return;

    setSavingTarget(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        target_weight: targetWeight === "" ? null : Number(targetWeight),
      })
      .eq("user_id", userId);

    setSavingTarget(false);

    if (error) {
      console.error(error);
    }
  }

  // =========================
  // DATE DEFAULT RANGE
  // =========================
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 31);
    return d.toISOString().split("T")[0];
  }, []);

  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate());
    return d.toISOString().split("T")[0];
  }, []);

  // =========================
  // FORM STATE
  // =========================
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  const [morning, setMorning] = useState("");
  const [night, setNight] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CHART STATE
  // =========================
  const [chartData, setChartData] = useState<WeightRow[]>([]);

  const [showMorning, setShowMorning] = useState(true);
  const [showNight, setShowNight] = useState(true);

  const [yMin, setYMin] = useState(85);
  const [yMax, setYMax] = useState(105);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  // =========================
  // LOAD SINGLE DAY
  // =========================
  useEffect(() => {
    if (!userId) return;

    async function loadDay() {
      const { data } = await supabase
        .from("weight")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();

      setMorning(data?.morning_weight_kg?.toString() ?? "");
      setNight(data?.night_weight_kg?.toString() ?? "");
    }

    loadDay();
  }, [userId, date]);

  // =========================
  // LOAD CHART
  // =========================
  useEffect(() => {
    if (!userId) return;

    async function loadChart() {
      const { data, error } = await supabase
        .from("weight")
        .select("date, morning_weight_kg, night_weight_kg")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setChartData(
        (data || []).map((d) => ({
          date: d.date,
          morning: d.morning_weight_kg,
          night: d.night_weight_kg,
        }))
      );
    }

    loadChart();
  }, [userId, startDate, endDate]);

  // =========================
  // SAVE WEIGHT
  // =========================
  async function handleSave() {
    if (!userId) return;

    setLoading(true);

    const payload = {
      user_id: userId,
      date,
      morning_weight_kg: morning === "" ? null : Number(morning),
      night_weight_kg: night === "" ? null : Number(night),
    };

    const { error } = await supabase
      .from("weight")
      .upsert(payload, {
        onConflict: "user_id,date",
      });

    setLoading(false);

    if (error) {
      setSuccessMessage("Opslaan mislukt ❌");
      return;
    }

    setSuccessMessage("Gewicht opgeslagen ✔️");

    setTimeout(() => setSuccessMessage(null), 2500);
  }

  // =========================
  // LOADING
  // =========================
  if (!ready) return <div className="p-6 text-slate-600">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-blue-100 p-6 space-y-6">

      {successMessage && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* =========================
          INPUT + TARGET WEIGHT
      ========================= */}
<div className="flex flex-col md:flex-row gap-4 w-full overflow-x-hidden">

  {/* WEIGHT INPUT */}
  <div className="bg-white p-4 rounded-xl shadow w-full max-w-md space-y-4 min-w-0">

    <h2 className="font-bold text-lg">Voer je gewicht in</h2>

    {/* DATE */}
    <div className="w-full min-w-0">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full block min-w-0 max-w-full border p-2 rounded box-border appearance-none"
      />
    </div>

    {/* MORNING */}
    <div className="w-full min-w-0">
      <input
        type="number"
        placeholder="Morning weight"
        value={morning}
        onChange={(e) => setMorning(e.target.value)}
        className="w-full block min-w-0 max-w-full border p-2 rounded box-border"
      />
    </div>

    {/* NIGHT */}
    <div className="w-full min-w-0">
      <input
        type="number"
        placeholder="Night weight"
        value={night}
        onChange={(e) => setNight(e.target.value)}
        className="w-full block min-w-0 max-w-full border p-2 rounded box-border"
      />
    </div>

    <button
      onClick={handleSave}
      disabled={loading}
      className="bg-orange-500 text-white px-4 py-2 rounded w-fit"
    >
      {loading ? "Saving..." : "Opslaan"}
    </button>

  </div>

        {/* TARGET WEIGHT */}
        <div className="bg-white p-4 rounded-xl shadow w-full max-w-md space-y-4">
          <h2 className="font-bold text-lg">Stel een doel in</h2>

          <input
            type="number"
            placeholder="Target weight"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleSaveTargetWeight}
            disabled={savingTarget}
            className="bg-orange-500 text-white px-4 py-2 rounded w-fit"
          >
            {savingTarget ? "Saving..." : "Opslaan"}
          </button>
        </div>

      </div>

      {/* =========================
          CHART CONTROLS
      ========================= */}
      <div className="bg-white p-4 rounded-xl shadow space-y-5">
        <h2 className="font-bold text-lg">Chart controls</h2>

        <div className="flex gap-4">
          <button onClick={() => setShowMorning(!showMorning)}>
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2" />
            Morning {showMorning ? "✓" : "✕"}
          </button>

          <button onClick={() => setShowNight(!showNight)}>
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block mr-2" />
            Night {showNight ? "✓" : "✕"}
          </button>
        </div>

        <div className="flex gap-2">
          <input value={yMin} onChange={(e) => setYMin(Number(e.target.value))} className="border p-2 rounded w-1/2" />
          <input value={yMax} onChange={(e) => setYMax(Number(e.target.value))} className="border p-2 rounded w-1/2" />
        </div>

        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded w-1/2" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded w-1/2" />
        </div>
      </div>

      {/* =========================
          CHART
      ========================= */}
      <div className="bg-white p-4 rounded-xl shadow h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis domain={[yMin, yMax]} />
            <Tooltip />

            {showMorning && (
              <Line type="monotone" dataKey="morning" stroke="#3b82f6" strokeWidth={2} dot={false} />
            )}

            {showNight && (
              <Line type="monotone" dataKey="night" stroke="#f97316" strokeWidth={2} dot={false} />
            )}

            {targetWeight && (
              <ReferenceLine
                y={Number(targetWeight)}
                stroke="#000000"
                strokeDasharray="6 6"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}