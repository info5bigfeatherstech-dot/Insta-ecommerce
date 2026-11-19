"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { generateSVGPlaceholder } from "@/lib/utils";
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
import { Plus, Edit2, Trash2, FolderTree, Package } from "lucide-react";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(1, "Order must be at least 1"),
  status: z.enum(["active", "inactive"]),
});

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("displayOrder");
  const [sortOrder, setSortOrder] = React.useState("asc");

  // Form & Delete Dialog states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [deletingCategory, setDeletingCategory] = React.useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", { search, sortBy, sortOrder }],
    queryFn: () => categoriesService.getCategories({ search, sortBy, sortOrder }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (catData) => categoriesService.createCategory(catData),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesService.updateCategory(id, data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoriesService.deleteCategory(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Failed to delete category"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      displayOrder: 1,
      status: "active",
    },
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    reset({
      name: "",
      description: "",
      displayOrder: categories.length + 1,
      status: "active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description || "",
      displayOrder: cat.displayOrder,
      status: cat.status,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCategory) {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Category",
      sortable: true,
      render: (val, row) => {
        const placeholder = generateSVGPlaceholder({
          text: row.name,
          type: "category",
          identifier: row.id,
        });
        return (
          <div className="flex items-center gap-3">
            <Image
              src={placeholder}
              alt={row.name}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-[8px] object-cover shrink-0 border border-border"
            />
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.name}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs">{row.description}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "displayOrder",
      label: "Display Order",
      sortable: true,
      render: (val) => <span className="text-xs text-muted-foreground font-medium">#{val}</span>,
    },
    {
      key: "productCount",
      label: "Active Products",
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-[6px]">
          <Package className="h-3 w-3 text-muted-foreground" />
          {val} products
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
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
            onClick={() => handleOpenEdit(row)}
            className="h-7 w-7 text-muted-foreground"
            title="Edit Category"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingCategory(row)}
            className="h-7 w-7 text-destructive hover:bg-destructive-soft hover:text-destructive"
            title="Delete Category"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your store inventory into shop collections for automated DM recommendations."
      >
        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchPlaceholder="Search category..."
        searchValue={search}
        onSearchChange={setSearch}
        sortColumn={sortBy}
        sortDirection={sortOrder}
        onSort={(key, dir) => {
          setSortBy(key);
          setSortOrder(dir);
        }}
        exportFilename="categories_list"
      />

      {/* Add / Edit Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              Collection grouping shown in product filters and catalog navigation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Category Name *</label>
              <Input {...register("name")} placeholder="e.g. Footwear & Sneakers" />
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                {...register("description")}
                placeholder="Brief summary of items in this category..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Display Order</label>
                <Input type="number" {...register("displayOrder")} />
                {errors.displayOrder && (
                  <p className="text-[11px] text-destructive">{errors.displayOrder.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <Select
                  value={watch("status")}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Products in this category will become uncategorized.`}
        confirmText="Delete Category"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
