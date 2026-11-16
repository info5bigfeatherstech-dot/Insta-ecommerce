import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";
import { toast } from "sonner";

export const messageKeys = {
  conversations: ["conversations"],
  conversationList: (params) => [...messageKeys.conversations, "list", params],
  conversationDetail: (id) => [...messageKeys.conversations, "detail", id],
  dmActivity: ["dmActivity"],
  dmActivityList: (params) => [...messageKeys.dmActivity, "list", params],
};

export function useConversations(params = {}) {
  return useQuery({
    queryKey: messageKeys.conversationList(params),
    queryFn: () => messagesService.getConversations(params).then((res) => res.data),
  });
}

export function useConversation(id) {
  return useQuery({
    queryKey: messageKeys.conversationDetail(id),
    queryFn: () => messagesService.getConversationById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }) => messagesService.sendMessage(conversationId, text),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversationDetail(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
    onError: (err) => toast.error(err.message || "Failed to send message"),
  });
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, status }) => messagesService.updateConversationStatus(conversationId, status),
    onSuccess: (res, variables) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: messageKeys.conversationDetail(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
}

export function useDmActivity(params = {}) {
  return useQuery({
    queryKey: messageKeys.dmActivityList(params),
    queryFn: () => messagesService.getDmActivity(params).then((res) => res.data),
  });
}
