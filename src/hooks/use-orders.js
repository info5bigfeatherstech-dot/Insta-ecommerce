import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { toast } from "sonner";

export const orderKeys = {
  all: ["orders"],
  list: (params) => [...orderKeys.all, "list", params],
  detail: (id) => [...orderKeys.all, "detail", id],
};

export function useOrders(params = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.getOrders(params).then((res) => res.data),
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getOrderById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }) => ordersService.updateOrderStatus(id, status, notes),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update order status");
    },
  });
}
