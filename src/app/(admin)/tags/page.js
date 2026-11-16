"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsService } from "@/services/tags.service";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Tag as TagIcon,
  Plus,
  Edit2,
  Trash2,
  Users,
  Layers,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const tagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().min(4, "Please choose a color"),
});

const segmentSchema = z.object({
  name: z.string().min(3, "Segment name must be at least 3 characters"),
  description: z.string().optional(),
  field: z.string().min(1, "Select a field"),
  operator: z.string().min(1, "Select an operator"),
  value: z.string().min(1, "Enter a filter value"),
});

const COLOR_PRESETS = [
  { name: "Indigo", color: "#635BDB", bgColor: "#EEF2FF" },
  { name: "Emerald", color: "#10B981", bgColor: "#ECFDF5" },
  { name: "Blue", color: "#3B82F6", bgColor: "#EFF6FF" },
  { name: "Amber", color: "#F59E0B", bgColor: "#FFFBEB" },
  { name: "Rose", color: "#EF4444", bgColor: "#FEF2F2" },
  { name: "Purple", color: "#8B5CF6", bgColor: "#F5F3FF" },
  { name: "Cyan", color: "#06B6D4", bgColor: "#ECFEFF" },
];

export default function TagsAndSegmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  // Modals state
  const [tagModalOpen, setTagModalOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState(null);
  const [deletingTag, setDeletingTag] = React.useState(null);
  const [segmentModalOpen, setSegmentModalOpen] = React.useState(false);

  // Queries
  const { data: tags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsService.getTags().then((res) => res.data),
  });

  const { data: segments = [], isLoading: isSegmentsLoading } = useQuery({
    queryKey: ["segments"],
    queryFn: () => tagsService.getSegments().then((res) => res.data),
  });

  // Mutations
  const createTagMutation = useMutation({
    mutationFn: (data) => tagsService.createTag(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }) => tagsService.updateTag(id, data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id) => tagsService.deleteTag(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const createSegmentMutation = useMutation({
    mutationFn: (data) => tagsService.createSegment(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
    onError: (err) => toast.error(err.message),
  });

  // Tag Form
  const {
    register: registerTag,
    handleSubmit: handleSubmitTag,
    setValue: setTagValue,
    watch: watchTag,
    reset: resetTag,
    formState: { errors: tagErrors },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#635BDB",
    },
  });

  // Segment Form
  const {
    register: registerSeg,
    handleSubmit: handleSubmitSeg,
    setValue: setSegValue,
    watch: watchSeg,
    reset: resetSeg,
    formState: { errors: segErrors },
  } = useForm({
    resolver: zodResolver(segmentSchema),
    defaultValues: {
      name: "",
      description: "",
      field: "status",
      operator: "equals",
      value: "active",
    },
  });

  const handleOpenAddTag = () => {
    setEditingTag(null);
    resetTag({
      name: "",
      description: "",
      color: "#635BDB",
    });
    setTagModalOpen(true);
  };

  const handleOpenEditTag = (t) => {
    setEditingTag(t);
    resetTag({
      name: t.name,
      description: t.description || "",
      color: t.color || "#635BDB",
    });
    setTagModalOpen(true);
  };

  const onTagSubmit = async (formData) => {
    const selectedPreset = COLOR_PRESETS.find((c) => c.color === formData.color) || COLOR_PRESETS[0];
    const payload = {
      ...formData,
      bgColor: selectedPreset.bgColor,
    };

    if (editingTag) {
      await updateTagMutation.mutateAsync({ id: editingTag.id, data: payload });
    } else {
      await createTagMutation.mutateAsync(payload);
    }
    setTagModalOpen(false);
  };

  const onSegmentSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      color: "#635BDB",
      icon: "Users",
      conditions: [
        {
          field: formData.field,
          operator: formData.operator,
          value: formData.value,
        },
      ],
    };
    await createSegmentMutation.mutateAsync(payload);
    setSegmentModalOpen(false);
  };

  const columns = [
    {
      key: "name",
      label: "Tag Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <div>
            <span className="font-semibold text-xs text-[#1E293B] block">{val}</span>
            <span className="text-[10px] text-[#64748B] line-clamp-1">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contactCount",
      label: "Tagged Contacts (Derived)",
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-0.5 rounded-[6px]">
          <Users className="h-3 w-3 text-[#64748B]" />
          {val} contacts
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{formatDate(val, "dd MMM yyyy")}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditTag(row)}
            className="h-7 w-7 text-[#64748B]"
            title="Edit Tag"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingTag(row)}
            className="h-7 w-7 text-red-600 hover:bg-red-50"
            title="Delete Tag"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Segments Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#635BDB]" />
              <span>Smart Dynamic Segments</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Real-time audience slices evaluated continuously against live contact touchpoints.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              resetSeg();
              setSegmentModalOpen(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Segment</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {segments.map((seg) => (
            <Card
              key={seg.id}
              className="p-4 border-[#E2E8F0] hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: seg.color || "#635BDB" }}
                  />
                  <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">
                    Live
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1E293B]">{seg.name}</h4>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                  {seg.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] mt-3 flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Matching audience</span>
                <span className="text-sm font-bold text-[#1E293B]">
                  {seg.count} contacts
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tags Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-[#635BDB]" />
              <span>Audience Tags</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Manage CRM labels attached to customers across automation triggers and orders.
            </p>
          </div>
          <Button size="sm" onClick={handleOpenAddTag} className="gap-1.5 text-xs shadow-sm">
            <Plus className="h-4 w-4" />
            <span>New Tag</span>
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={tags}
          isLoading={isTagsLoading}
          searchPlaceholder="Search tags..."
          searchValue={search}
          onSearchChange={setSearch}
          exportFilename="tags_catalog"
        />
      </div>

      {/* Add / Edit Tag Dialog */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
            <DialogDescription>
              Tags are used to group customers and target customized DM automation sequences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTag(onTagSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Tag Name *</label>
              <Input {...registerTag("name")} placeholder="e.g. High Intent Shopper" />
              {tagErrors.name && (
                <p className="text-[11px] text-red-500">{tagErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Description</label>
              <Textarea
                {...registerTag("description")}
                placeholder="What this tag indicates..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1E293B]">Color Preset</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setTagValue("color", p.color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      watchTag("color") === p.color ? "border-[#1E293B] scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTagModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingTag ? "Save Tag" : "Create Tag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Segment Builder Dialog */}
      <Dialog open={segmentModalOpen} onOpenChange={setSegmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Dynamic Segment</DialogTitle>
            <DialogDescription>
              Define filter conditions to automatically group matching Instagram contacts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSeg(onSegmentSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Segment Name *</label>
              <Input {...registerSeg("name")} placeholder="e.g. VIP Repeat Shoppers" />
              {segErrors.name && (
                <p className="text-[11px] text-red-500">{segErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Description</label>
              <Textarea
                {...registerSeg("description")}
                placeholder="Criteria summary..."
                rows={2}
              />
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-[10px] border border-[#E2E8F0] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Rule Condition
              </span>

              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={watchSeg("field")}
                  onValueChange={(val) => setSegValue("field", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="ordersCount">Orders Count</SelectItem>
                    <SelectItem value="linksSent">Links Sent</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={watchSeg("operator")}
                  onValueChange={(val) => setSegValue("operator", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Does not equal</SelectItem>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  {...registerSeg("value")}
                  placeholder="Value..."
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSegmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Build Segment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deletingTag)}
        onOpenChange={(open) => !open && setDeletingTag(null)}
        title="Delete Tag?"
        description={`Are you sure you want to delete tag "${deletingTag?.name}"? It will be removed from all tagged contacts.`}
        confirmText="Delete Tag"
        onConfirm={async () => {
          if (deletingTag) {
            await deleteTagMutation.mutateAsync(deletingTag.id);
            setDeletingTag(null);
          }
        }}
        isLoading={deleteTagMutation.isPending}
      />
    </div>
  );
}
