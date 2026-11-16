"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationsService } from "@/services/integrations.service";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Instagram, WhatsApp } from "@/components/shared/icons";
import {
  ShoppingBag,
  Webhook,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  Power,
  RotateCw,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

const ICONS = {
  Instagram,
  ShoppingBag,
  Webhook,
  MessageCircle,
};

export function IntegrationConfigDialog({ open, onOpenChange, integration, onSave }) {
  const [config, setConfig] = React.useState({});

  React.useEffect(() => {
    if (integration) {
      setConfig(integration.config || {});
    }
  }, [integration]);

  const handleSave = () => {
    onSave(integration.id, config);
    onOpenChange(false);
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {integration.name}</DialogTitle>
          <DialogDescription>
            Manage webhook endpoints, sync intervals, and API settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {Object.entries(config).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold capitalize text-[#1E293B]">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <Input
                value={val}
                onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>
          ))}

          <div className="p-2.5 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center gap-2 text-[11px] text-[#635BDB]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Simulated integration configuration. Changes persist in local mock database.</span>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-[#E2E8F0]">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [configuringItem, setConfiguringItem] = React.useState(null);

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationsService.getIntegrations().then((res) => res.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => integrationsService.toggleIntegration(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, config }) => integrationsService.updateIntegrationConfig(id, config),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <LoadingState text="Loading platform integrations..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations & API Channels"
        description="Connect your Meta Instagram Business account, ecommerce store backend, and external webhooks."
        badge={
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>Simulated Backend Sandbox</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item) => {
          const Icon = ICONS[item.icon] || Webhook;
          const isConnected = item.status === "connected";

          return (
            <Card
              key={item.id}
              className="border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <CardHeader className="pb-3 border-b border-[#E2E8F0] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                        isConnected ? "bg-[#EEF2FF] text-[#635BDB]" : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={item.status} />
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="p-3 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Linked Identity</span>
                      <span className="font-semibold text-[#1E293B] font-mono">{item.connectedAccount}</span>
                    </div>
                    {item.lastSynced && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Last Handshake</span>
                        <span className="text-[#64748B]">{formatDate(item.lastSynced)}</span>
                      </div>
                    )}
                  </div>

                  {/* Feature chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">
                      Active Event Capabilities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.features?.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-white border border-[#E2E8F0] text-[#1E293B] font-medium px-2 py-0.5 rounded-[4px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfiguringItem(item)}
                  className="h-8 text-xs gap-1.5 bg-white"
                >
                  <Sliders className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Configure</span>
                </Button>

                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleMutation.mutate(item.id)}
                  disabled={toggleMutation.isPending}
                  className={`h-8 text-xs gap-1.5 ${
                    isConnected ? "text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" : ""
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{isConnected ? "Disconnect" : "Connect Platform"}</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <IntegrationConfigDialog
        open={Boolean(configuringItem)}
        onOpenChange={(open) => !open && setConfiguringItem(null)}
        integration={configuringItem}
        onSave={(id, config) => updateConfigMutation.mutate({ id, config })}
      />
    </div>
  );
}
