/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ─── Animated KPI counter ───
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let rafId = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}

function StatCard({
  label,
  value,
  suffix,
  delay,
}: {
  label: string;
  value: number;
  suffix: string;
  delay: number;
}) {
  const count = useCountUp(value);
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="glass-card rounded-2xl px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-white/60">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white tabular-nums">
          {suffix === "$" ? "$" : ""}
          {count.toLocaleString()}
          {suffix !== "$" ? suffix : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Live Dashboard-style animated graph ───
function LiveGraph() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: [12, 18, 14, 24, 20, 30, 26],
        borderColor: "#1FA2A6",
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(31,162,166,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(31,162,166,0.45)");
          gradient.addColorStop(1, "rgba(31,162,166,0)");
          return gradient;
        },
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: "#E8A33D",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
      {
        label: "Customers",
        data: [8, 12, 10, 15, 13, 18, 16],
        borderColor: "#E8A33D",
        backgroundColor: "rgba(232,163,61,0.05)",
        fill: true,
        tension: 0.45,
        pointRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1800, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "rgba(255,255,255,0.7)",
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(22,50,79,0.9)",
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.8)",
        borderColor: "rgba(31,162,166,0.4)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

// ─── SVG decorative chart line ───
function DecorativeChart() {
  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full h-24 opacity-40"
      fill="none"
      preserveAspectRatio="none"
    >
      <polygon
        points="0,120 0,90 40,70 80,85 120,50 160,65 200,40 240,55 280,30 320,45 360,20 400,30 400,120"
        fill="url(#decoGrad)"
      />
      <path
        d="M0 90 L40 70 L80 85 L120 50 L160 65 L200 40 L240 55 L280 30 L320 45 L360 20 L400 30"
        stroke="#1FA2A6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1000"
        style={{ animation: "dashDraw 2.5s ease forwards" }}
      />
      <defs>
        <linearGradient id="decoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1FA2A6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1FA2A6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Login form ───
function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Invalid email or password.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0d1b2a] flex items-center justify-center px-4 py-10">
      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[#0d1b2a] via-[#16324f] to-[#0d1b2a]" />

        {/* Floating gradient blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#E8A33D]/15 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[#E15554]/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        {/* Moving grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] animate-grid"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* ── LEFT: Brand & Visual Panel ── */}
        <div className="hidden lg:flex flex-col justify-center gap-8 animate-blur-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1FA2A6] to-[#16324F] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/30">
                📊
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-teal-400/30 blur-md animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl leading-tight">
                Branch Performance
              </h1>
              <p className="text-teal-300/80 text-sm tracking-wide">Analytics Dashboard</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Powerful insights,{" "}
              <span className="bg-gradient-to-r from-teal-300 via-[#E8A33D] to-teal-300 bg-clip-text text-transparent animate-gradient">
                one dashboard.
              </span>
            </h2>
            <p className="mt-4 text-white/60 max-w-md text-sm leading-relaxed">
              Track revenue, customers, and procedures across all branches in
              real time. Beautiful charts. Clear decisions.
            </p>
          </div>

          {/* Live graph */}
          <LiveGraph />

          {/* Animated KPI stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Revenue" value={1284200} suffix="$" delay={200} />
            <StatCard label="Customers" value={4820} suffix="+" delay={400} />
            <StatCard label="Procedures" value={12650} suffix="+" delay={600} />
          </div>

          <DecorativeChart />
        </div>

        {/* ── RIGHT: Login Card ── */}
        <div className="animate-blur-in" style={{ animationDelay: "0.15s" }}>
          <div className={`glass-card rounded-3xl p-8 sm:p-10 ${shake ? "animate-shake" : ""}`}>
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1FA2A6] to-[#16324F] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-teal-500/30">
                📊
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-tight">Branch Performance</h1>
                <p className="text-teal-300/80 text-xs tracking-wide">Analytics Dashboard</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white">Welcome back 👋</h2>
            <p className="mt-2 text-white/50 text-sm">
              Sign in with your credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                    @
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glow w-full rounded-2xl bg-white/5 border border-white/15 pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none"
                    placeholder="admin@gmail.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                    🔒
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-glow w-full rounded-2xl bg-white/5 border border-white/15 pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/30 outline-none"
                    placeholder="admin123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition text-lg"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 animate-fade-in">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-[#1FA2A6] w-4 h-4 rounded"
                  />
                  Remember me
                </label>
                {/* <button
                  type="button"
                  className="text-teal-300/80 hover:text-teal-200 transition"
                >
                  Forgot password?
                </button> */}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 btn-shimmer shadow-lg shadow-teal-500/20 group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/40">
              Demo credentials: <span className="text-white/60">test@gmail.com / test123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
