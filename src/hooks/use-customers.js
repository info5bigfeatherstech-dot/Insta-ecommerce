import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { toast } from "sonner";

export const customerKeys = {
  all: ["customers"],
  list: (params) => [...customerKeys.all, "list", params],
  detail: (id) => [...customerKeys.all, "detail", id],
};

export function useCustomers(params = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersService.getCustomers(params).then((res) => res.data),
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersService.getCustomerById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useAddTagToCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, tagId }) => customersService.addTagToCustomer(customerId, tagId),
    onSuccess: () => {
      toast.success("Tag assigned to customer");
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => toast.error(err.message || "Failed to assign tag"),
  });
}

export function useRemoveTagFromCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, tagId }) => customersService.removeTagFromCustomer(customerId, tagId),
    onSuccess: () => {
      toast.success("Tag removed from customer");
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => toast.error(err.message || "Failed to remove tag"),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customersService.updateCustomer(id, data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update customer details");
    },
  });
}
