import { RealtimeChart } from "@/components/realtime-chart";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-slate-900 dark:text-white">
            AI Trading Station
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Real-time market analysis and execution
          </p>
        </div>

        <RealtimeChart />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Future Signals Component */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Active Strategies</h3>
            <p className="text-sm text-slate-500">Dummy Strategy v1: Running</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Risk Metrics</h3>
            <p className="text-sm text-slate-500">Daily PnL: $0.00</p>
          </div>
        </div>
      </div>
    </main>
  );
}
