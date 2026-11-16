import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"],
  range: (range) => [...analyticsKeys.all, range],
};

export function useAnalytics(range = "30d") {
  return useQuery({
    queryKey: analyticsKeys.range(range),
    queryFn: () => analyticsService.getAnalyticsData(range).then((res) => res.data),
  });
}
