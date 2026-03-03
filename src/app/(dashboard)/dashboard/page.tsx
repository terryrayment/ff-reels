export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-white/50 mt-2">
        Overview of reel activity, recent views, and director engagement.
      </p>

      {/* Stat cards placeholder */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {[
          { label: "Total Reels Sent", value: "—" },
          { label: "Views This Week", value: "—" },
          { label: "Avg. Completion", value: "—" },
          { label: "Active Directors", value: "13" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <p className="text-sm text-white/40">{stat.label}</p>
            <p className="text-3xl font-light mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/30">
          Activity feed will appear here once reels are sent and viewed.
        </div>
      </div>
    </div>
  );
}
