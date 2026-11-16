import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"],
  overview: (timeRange) => [...dashboardKeys.all, "overview", timeRange],
};

export function useDashboard(timeRange = "30d") {
  return useQuery({
    queryKey: dashboardKeys.overview(timeRange),
    queryFn: () => dashboardService.getDashboardData(timeRange).then((res) => res.data),
  });
}
