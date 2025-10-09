import RouteDashboard from "@/components/routes/RouteDashboard";

export default function RouteDashboardPage() {
  return (
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          <div className="rounded-md border bg-white px-3 py-3">
            <div className="text-xl font-semibold">Dashboard das Rotas</div>
          </div>
          <RouteDashboard />
        </div>
      </div>
  );
}
