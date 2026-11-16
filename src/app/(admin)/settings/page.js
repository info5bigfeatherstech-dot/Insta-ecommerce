"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { usePreferenceStore } from "@/store/preference-store";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Instagram } from "@/components/shared/icons";
import {
  Store,
  Bell,
  Users,
  Sliders,
  Plus,
  Trash2,
  Check,
  Save,
  Moon,
  Sun,
  Monitor,
  Table as TableIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const generalSchema = z.object({
  storeName: z.string().min(2, "Store name required"),
  storeUrl: z.string().url("Must be valid URL"),
  supportEmail: z.string().email("Must be valid email"),
  timezone: z.string().min(1, "Timezone required"),
  currency: z.string().min(1, "Currency required"),
  dateFormat: z.string().min(1, "Date format required"),
});

const inviteMemberSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.string().min(1, "Role required"),
});

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("general");
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  // Preference Store (Zustand)
  const currentTableDensity = usePreferenceStore((s) => s.tableDensity);
  const setTableDensity = usePreferenceStore((s) => s.setTableDensity);
  const currentTheme = usePreferenceStore((s) => s.theme);
  const currentLanguage = usePreferenceStore((s) => s.language);
  const updatePreferences = usePreferenceStore((s) => s.updatePreferences);

  // Settings query
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings().then((res) => res.data),
  });

  // General Form
  const {
    register: registerGeneral,
    handleSubmit: handleSubmitGeneral,
    reset: resetGeneral,
    formState: { errors: generalErrors },
  } = useForm({
    resolver: zodResolver(generalSchema),
  });

  React.useEffect(() => {
    if (settings?.general) {
      resetGeneral(settings.general);
    }
  }, [settings, resetGeneral]);

  // Invite Form
  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    reset: resetInvite,
    setValue: setInviteValue,
    watch: watchInvite,
    formState: { errors: inviteErrors },
  } = useForm({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Support Agent",
    },
  });

  // Mutations
  const updateGeneralMutation = useMutation({
    mutationFn: (data) => settingsService.updateGeneralSettings(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (data) => settingsService.inviteTeamMember(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setInviteModalOpen(false);
      resetInvite();
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id) => settingsService.removeTeamMember(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  if (isLoading || !settings) {
    return <LoadingState text="Loading store preferences and settings..." />;
  }

  const handleDensityChange = (density) => {
    setTableDensity(density);
    toast.success(`Table density set to "${density.toUpperCase()}". Applied app-wide.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Workspace Preferences"
        description="Manage store metadata, Instagram channel controls, notification rules, team roles, and UI density."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#E2E8F0] p-1 flex overflow-x-auto justify-start max-w-full">
          <TabsTrigger value="general" className="text-xs gap-1.5">
            <Store className="h-3.5 w-3.5" />
            <span>General Store</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="text-xs gap-1.5">
            <Instagram className="h-3.5 w-3.5" />
            <span>Instagram Channel</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Team Members</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs gap-1.5">
            <Sliders className="h-3.5 w-3.5" />
            <span>Display & Density</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General */}
        <TabsContent value="general">
          <Card className="max-w-2xl border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <CardTitle>General Store Details</CardTitle>
              <CardDescription>
                Store identity applied in automated Instagram DM messages and link previews
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitGeneral((data) => updateGeneralMutation.mutate(data))}>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E293B]">Store Name *</label>
                    <Input {...registerGeneral("storeName")} />
                    {generalErrors.storeName && (
                      <p className="text-[11px] text-red-500">{generalErrors.storeName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E293B]">Live Store URL *</label>
                    <Input {...registerGeneral("storeUrl")} />
                    {generalErrors.storeUrl && (
                      <p className="text-[11px] text-red-500">{generalErrors.storeUrl.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">Customer Support Email *</label>
                  <Input {...registerGeneral("supportEmail")} />
                  {generalErrors.supportEmail && (
                    <p className="text-[11px] text-red-500">{generalErrors.supportEmail.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E293B]">Timezone</label>
                    <Input {...registerGeneral("timezone")} disabled className="bg-[#F8FAFC]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E293B]">Currency</label>
                    <Input {...registerGeneral("currency")} disabled className="bg-[#F8FAFC]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E293B]">Date Format</label>
                    <Input {...registerGeneral("dateFormat")} disabled className="bg-[#F8FAFC]" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateGeneralMutation.isPending}
                  className="gap-1.5 shadow-sm text-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{updateGeneralMutation.isPending ? "Saving..." : "Save General Settings"}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Instagram */}
        <TabsContent value="instagram">
          <Card className="max-w-2xl border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Instagram Channel Settings</CardTitle>
                  <CardDescription>
                    Meta Graph API settings for comment triggers and direct messaging
                  </CardDescription>
                </div>
                <StatusBadge status="connected" />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">Connected Handle</label>
                  <Input value={settings.instagram?.username} disabled className="bg-[#F8FAFC]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">Meta Account ID</label>
                  <Input value={settings.instagram?.accountId} disabled className="bg-[#F8FAFC] font-mono text-[11px]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1E293B]">
                  Human Handoff Keywords
                </label>
                <Input defaultValue={settings.instagram?.humanHandoffTrigger} />
                <p className="text-[10px] text-[#64748B]">
                  When a customer types these keywords in DM, automated replies pause and assign to an agent.
                </p>
              </div>

              <div className="p-3 bg-[#EEF2FF] rounded-[8px] border border-[#C7D2FE] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#635BDB] block">Automated Messaging Engine</span>
                  <span className="text-[11px] text-[#64748B]">
                    Active • Daily message cap: {settings.instagram?.dailyMessageCap} DMs
                  </span>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <Button
                size="sm"
                onClick={() => toast.success("Instagram messaging parameters updated")}
                className="gap-1.5 shadow-sm text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Channel Settings</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notifications">
          <Card className="max-w-2xl border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <CardTitle>Notification Triggers</CardTitle>
              <CardDescription>
                Alert triggers sent to store operators via in-app banner and daily digest
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-[8px] border border-[#E2E8F0] bg-white">
                  <Checkbox id="n1" defaultChecked />
                  <div>
                    <label htmlFor="n1" className="font-bold text-[#1E293B] cursor-pointer block">
                      Failed Automations Alert
                    </label>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Send urgent alert when Instagram DM rate limit or user restriction drops a trigger.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-[8px] border border-[#E2E8F0] bg-white">
                  <Checkbox id="n2" defaultChecked />
                  <div>
                    <label htmlFor="n2" className="font-bold text-[#1E293B] cursor-pointer block">
                      New High-Intent Leads
                    </label>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Notify when a contact clicks a product link 2 or more times without purchasing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-[8px] border border-[#E2E8F0] bg-white">
                  <Checkbox id="n3" defaultChecked />
                  <div>
                    <label htmlFor="n3" className="font-bold text-[#1E293B] cursor-pointer block">
                      Orders Placed via Instagram DM
                    </label>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Real-time notification on each attributed order placement.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <Button
                size="sm"
                onClick={() => toast.success("Notification preferences saved")}
                className="gap-1.5 shadow-sm text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Notification Rules</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 4: Team */}
        <TabsContent value="team">
          <Card className="max-w-2xl border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#E2E8F0] flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Collaborators with access to the Instagram Commerce dashboard
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5 text-xs shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Invite Member</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E2E8F0]">
                {settings.team?.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-[#E2E8F0]">
                        <AvatarFallback
                          style={{ backgroundColor: member.avatarColor || "#635BDB" }}
                          className="text-white font-bold text-xs"
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-bold text-[#1E293B] block">{member.name}</span>
                        <span className="text-[11px] text-[#64748B]">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px]">
                        {member.role}
                      </span>
                      <StatusBadge status={member.status} />
                      {member.role !== "Owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          className="h-7 w-7 text-red-600 hover:bg-red-50"
                          title="Remove Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Preferences (Theme, Language, Table Density) */}
        <TabsContent value="preferences">
          <Card className="max-w-2xl border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <CardTitle>App Interface Preferences</CardTitle>
              <CardDescription>
                Customize layout density, theme token appearance, and localization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6 text-xs">
              {/* Theme Preference: Light only; others disabled coming soon */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1E293B] block">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Light theme: Active */}
                  <div className="p-3.5 rounded-[10px] border-2 border-[#635BDB] bg-[#EEF2FF]/40 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Sun className="h-5 w-5 text-[#635BDB]" />
                    <span className="font-bold text-xs text-[#635BDB]">Light (Active)</span>
                  </div>

                  {/* Dark theme: Disabled Coming Soon */}
                  <div className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] opacity-50 flex flex-col items-center justify-center gap-2 cursor-not-allowed relative">
                    <Moon className="h-5 w-5 text-[#94A3B8]" />
                    <span className="font-medium text-xs text-[#64748B]">Dark</span>
                    <span className="text-[9px] font-bold bg-[#CBD5E1] text-[#1E293B] px-1.5 py-0.2 rounded-full absolute top-2 right-2">
                      Coming Soon
                    </span>
                  </div>

                  {/* System theme: Disabled Coming Soon */}
                  <div className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] opacity-50 flex flex-col items-center justify-center gap-2 cursor-not-allowed relative">
                    <Monitor className="h-5 w-5 text-[#94A3B8]" />
                    <span className="font-medium text-xs text-[#64748B]">System</span>
                    <span className="text-[9px] font-bold bg-[#CBD5E1] text-[#1E293B] px-1.5 py-0.2 rounded-full absolute top-2 right-2">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Density: App-wide padding changer */}
              <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#1E293B] block">
                      Table Row Density
                    </label>
                    <p className="text-[11px] text-[#64748B]">
                      Modifies table cell padding across Orders, Products, Customers, Tags and DM Activity.
                    </p>
                  </div>
                  <TableIcon className="h-4 w-4 text-[#635BDB]" />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { id: "compact", label: "Compact", desc: "Dense padding (py-1.5 px-3)" },
                    { id: "normal", label: "Normal", desc: "Balanced spacing (py-3 px-4)" },
                    { id: "comfortable", label: "Comfortable", desc: "Generous whitespace (py-4 px-5)" },
                  ].map((item) => {
                    const isSelected = currentTableDensity === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleDensityChange(item.id)}
                        className={`p-3 rounded-[10px] border cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#635BDB] bg-[#EEF2FF] shadow-xs"
                            : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold text-xs ${
                              isSelected ? "text-[#635BDB]" : "text-[#1E293B]"
                            }`}
                          >
                            {item.label}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#635BDB]" />}
                        </div>
                        <span className="text-[10px] text-[#64748B] block leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Language Preference */}
              <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
                <label className="text-xs font-bold text-[#1E293B]">Dashboard Language</label>
                <Select value={currentLanguage} onValueChange={(val) => updatePreferences({ language: val })}>
                  <SelectTrigger className="h-9 text-xs max-w-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (India) — Primary</SelectItem>
                    <SelectItem value="hi" disabled>Hindi (हिन्दी) — Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Grant an operator access to your Instagram Commerce dashboard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInvite((data) => inviteMemberMutation.mutate(data))} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Full Name *</label>
              <Input {...registerInvite("name")} placeholder="e.g. Rahul Sharma" />
              {inviteErrors.name && (
                <p className="text-[11px] text-red-500">{inviteErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Email Address *</label>
              <Input {...registerInvite("email")} placeholder="rahul@urbanstyle.in" />
              {inviteErrors.email && (
                <p className="text-[11px] text-red-500">{inviteErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Role</label>
              <Select
                value={watchInvite("role")}
                onValueChange={(val) => setInviteValue("role", val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support Agent">Support Agent (Inbox & Orders)</SelectItem>
                  <SelectItem value="Marketing Manager">Marketing Manager (Automations & Reels)</SelectItem>
                  <SelectItem value="Store Admin">Store Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={inviteMemberMutation.isPending}>
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
