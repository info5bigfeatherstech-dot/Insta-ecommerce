"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsService } from "@/services/tags.service";
import { COLOR_PRESETS } from "@/data/tags.data";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import {
  cn,
  formatDate,
  formatINR,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
} from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

function formatCondition(cond, allTags = []) {
  if (!cond) return "";
  const fieldLabels = {
    status: "Status",
    linksSent: "Links Sent",
    linksClicked: "Links Clicked",
    ordersCount: "Orders",
    tags: "Tag",
    lifetimeSpend: "Lifetime Spend",
    interestedProductIds: "Interested Product",
  };
  const opLabels = {
    equals: "is",
    not_equals: "is not",
    greater_than: ">",
    less_than: "<",
    contains: "contains",
  };

  let valueLabel = String(cond.value);
  if (cond.field === "tags") {
    const foundTag = allTags.find((t) => t.id === cond.value);
    if (foundTag) valueLabel = `"${foundTag.name}"`;
  }

  return `${fieldLabels[cond.field] || cond.field} ${opLabels[cond.operator] || cond.operator} ${valueLabel}`;
}

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

  // Segment interactive state
  const [selectedSegment, setSelectedSegment] = React.useState(null);
  const [audienceDrawerOpen, setAudienceDrawerOpen] = React.useState(false);

  const handleSelectSegment = (seg) => {
    setSelectedSegment(seg);
    setAudienceDrawerOpen(true);
  };

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
      color: COLOR_PRESETS[0].color,
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
      color: COLOR_PRESETS[0].color,
    });
    setTagModalOpen(true);
  };

  const handleOpenEditTag = (t) => {
    setEditingTag(t);
    resetTag({
      name: t.name,
      description: t.description || "",
      color: t.color || COLOR_PRESETS[0].color,
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
      color: COLOR_PRESETS[0].color,
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
            <span className="font-semibold text-xs text-foreground block">{val}</span>
            <span className="text-[10px] text-muted-foreground line-clamp-1">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contactCount",
      label: "Tagged Contacts (Derived)",
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-[6px]">
          <Users className="h-3 w-3 text-muted-foreground" />
          {val} contacts
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      render: (val) => <span className="text-xs text-muted-foreground">{formatDate(val, "dd MMM yyyy")}</span>,
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
            className="h-7 w-7 text-muted-foreground"
            title="Edit Tag"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingTag(row)}
            className="h-7 w-7 text-destructive hover:bg-destructive-soft hover:text-destructive"
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
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>Smart Dynamic Segments</span>
            </h2>
            <p className="text-xs text-muted-foreground">
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
          {segments.map((seg) => {
            const isSelected = selectedSegment?.id === seg.id;
            return (
              <Card
                key={seg.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleSelectSegment(seg)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectSegment(seg);
                  }
                }}
                className={cn(
                  "p-4 border-border transition-all flex flex-col justify-between cursor-pointer group select-none text-left relative",
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary-soft/30 shadow-md -translate-y-0.5"
                    : "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color || "var(--primary)" }}
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                        Live
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between gap-1">
                    <span>{seg.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {seg.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Matching audience</span>
                    <span className="text-sm font-bold text-foreground">
                      {seg.count} contacts
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 group-hover:underline transition-all">
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Segment Quick Bar */}
        {selectedSegment && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-primary/30 bg-primary-soft/30 transition-all">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: selectedSegment.color || "var(--primary)" }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">
                    Selected Segment: {selectedSegment.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                    {selectedSegment.count} contacts
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {selectedSegment.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudienceDrawerOpen(true)}
                className="h-7 text-xs gap-1.5 bg-background shadow-xs font-semibold"
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Audience Drawer</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-7 text-xs gap-1.5 shadow-xs font-semibold"
              >
                <Link href={`/customers?segment=${selectedSegment.id}`}>
                  <span>Open in Directory</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSegment(null)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Deselect segment"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tags Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" />
              <span>Audience Tags</span>
            </h2>
            <p className="text-xs text-muted-foreground">
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
              <label className="text-xs font-semibold text-foreground">Tag Name *</label>
              <Input {...registerTag("name")} placeholder="e.g. High Intent Shopper" />
              {tagErrors.name && (
                <p className="text-[11px] text-destructive">{tagErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                {...registerTag("description")}
                placeholder="What this tag indicates..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Color Preset</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setTagValue("color", p.color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      watchTag("color") === p.color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border">
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
              <label className="text-xs font-semibold text-foreground">Segment Name *</label>
              <Input {...registerSeg("name")} placeholder="e.g. VIP Repeat Shoppers" />
              {segErrors.name && (
                <p className="text-[11px] text-destructive">{segErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                {...registerSeg("description")}
                placeholder="Criteria summary..."
                rows={2}
              />
            </div>

            <div className="p-3.5 bg-muted/40 rounded-[10px] border border-border space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Rule Condition
              </span>

              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={watchSeg("field")}
                  onValueChange={(val) => setSegValue("field", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
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
                  <SelectTrigger className="h-8 text-xs bg-background">
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
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border">
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

      {/* Segment Audience Slide-Over Drawer */}
      <SegmentAudienceDrawer
        open={audienceDrawerOpen}
        onOpenChange={setAudienceDrawerOpen}
        segment={selectedSegment}
        tags={tags}
      />
    </div>
  );
}

// Separate memoized Audience Drawer component for 60-120fps smooth performance
function SegmentAudienceDrawer({ open, onOpenChange, segment, tags }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {segment && (
        <SegmentAudienceDrawerContent
          key={segment.id}
          segment={segment}
          tags={tags}
        />
      )}
    </Sheet>
  );
}

function SegmentAudienceDrawerContent({ segment, tags }) {
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  // Segment audience query with caching for instant re-opening
  const { data: segmentAudience = [], isLoading: isAudienceLoading } = useQuery({
    queryKey: ["segment-customers", segment.id],
    queryFn: () => tagsService.getSegmentCustomers(segment.id).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredAudience = React.useMemo(() => {
    if (!deferredSearch.trim()) return segmentAudience;
    const q = deferredSearch.toLowerCase().trim();
    return segmentAudience.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q) ||
        c.instagramUserId?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [segmentAudience, deferredSearch]);

  return (
    <SheetContent
      side="right"
      className="w-full sm:max-w-lg lg:max-w-xl flex flex-col p-0 bg-card overflow-hidden"
    >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border space-y-3 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: segment?.color || "var(--primary)" }}
                />
                <SheetTitle className="text-base font-bold text-foreground">
                  {segment?.name}
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
                {segment?.description}
              </SheetDescription>
            </div>
          </div>

          {/* Criteria Badges */}
          {segment?.conditions && segment.conditions.length > 0 && (
            <div className="p-2.5 rounded-lg bg-muted/60 border border-border space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Filter className="h-3 w-3 text-primary" />
                <span>Evaluation Criteria:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {segment.conditions.map((cond, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-background border border-border px-2 py-0.5 rounded text-foreground font-medium"
                  >
                    {formatCondition(cond, tags)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search bar & Directory Action */}
        <div className="px-6 py-3 border-b border-border bg-muted/30 flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matching contacts..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 text-xs gap-1.5 bg-background shrink-0 font-semibold"
          >
            <Link href={`/customers?segment=${segment?.id}`}>
              <span>Directory</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Contact List with optimized momentum scrolling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 overscroll-contain">
          {isAudienceLoading ? (
            <div className="py-12">
              <LoadingState message="Evaluating segment criteria against live contacts..." />
            </div>
          ) : filteredAudience.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title={search ? "No contacts match search" : "No contacts in this segment"}
                description={
                  search
                    ? `No contacts found matching &ldquo;${search}&rdquo;. Try a different keyword.`
                    : "None of your current contacts meet the criteria defined for this segment."
                }
              />
            </div>
          ) : (
            filteredAudience.map((contact) => (
              <AudienceContactCard key={contact.id} contact={contact} />
            ))
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border bg-card flex flex-row items-center justify-between sm:justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{filteredAudience.length}</strong> of{" "}
            <strong className="text-foreground">{segmentAudience.length}</strong> contacts
          </span>
          <Button asChild size="sm" className="gap-1.5 text-xs font-semibold">
            <Link href={`/customers?segment=${segment?.id}`}>
              <span>View in Customer Directory</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    );
}

// Memoized contact card to avoid re-rendering entire list on search keystrokes
const AudienceContactCard = React.memo(function AudienceContactCard({ contact }) {
  const palette = getAvatarColor(contact.name || contact.username);
  const initials = getInitials(contact.name || contact.username);

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-colors space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-9 w-9 border border-border shrink-0">
            <AvatarFallback
              style={{
                backgroundColor: palette.bg,
                color: palette.text,
                border: `1px solid ${palette.border}`,
              }}
              className="font-bold text-xs"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-foreground block truncate">
              {contact.name}
            </span>
            <span className="text-[10px] text-primary font-medium block truncate">
              {contact.username}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={contact.status} />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 px-2 text-xs text-primary hover:bg-primary-soft gap-1"
          >
            <Link href={`/customers/${contact.id}`}>
              <span>Profile</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats pills */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-[11px]">
        <div>
          <span className="text-muted-foreground block text-[10px]">Orders</span>
          <span className="font-semibold text-foreground">
            {contact.ordersCount || 0}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px]">Spend</span>
          <span className="font-semibold text-foreground">
            {formatINR(contact.lifetimeSpend || 0)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px]">DMs</span>
          <span className="font-semibold text-foreground">
            {contact.totalMessages || 0}
          </span>
        </div>
      </div>

      {/* Tags & Source */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {contact.sourceReel && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
            Reel: {contact.sourceReel.instagramPostId}
          </span>
        )}
        {(contact.tagObjects || []).map((t) => (
          <span
            key={t.id}
            style={{ backgroundColor: t.bgColor, color: t.color, borderColor: t.color }}
            className="text-[10px] px-1.5 py-0.5 rounded font-medium border border-opacity-30 truncate"
          >
            {t.name}
          </span>
        ))}
      </div>
    </div>
  );
});
