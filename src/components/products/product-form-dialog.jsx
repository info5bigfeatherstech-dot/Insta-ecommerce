"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/data/db";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  compareAtPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  productUrl: z.string().url("Must be a valid URL"),
  status: z.enum(["active", "inactive"]),
});

function generateRandomSku() {
  return `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product = null,
  onSubmit,
  isLoading = false,
}) {
  const isEditing = Boolean(product);
  const categories = db.state.categories;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: categories[0]?.id || "cat_1",
      price: 999,
      compareAtPrice: 1299,
      stock: 50,
      description: "",
      productUrl: "https://urbanstyle.in/products/new-item",
      status: "active",
    },
  });

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        categoryId: product.categoryId || categories[0]?.id || "cat_1",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || product.price || 0,
        stock: product.stock || 0,
        description: product.description || "",
        productUrl: product.productUrl || "https://urbanstyle.in/products/",
        status: product.status || "active",
      });
    } else {
      reset({
        name: "",
        sku: generateRandomSku(),
        categoryId: categories[0]?.id || "cat_1",
        price: 999,
        compareAtPrice: 1299,
        stock: 50,
        description: "",
        productUrl: "https://urbanstyle.in/products/item",
        status: "active",
      });
    }
  }, [product, reset, categories]);

  const onFormSubmit = async (formData) => {
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update product details, pricing, stock, and automation attributes."
              : "Create a new catalog item eligible for automated Instagram DM links."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Product Name *</label>
            <Input {...register("name")} placeholder="e.g. Nike Pegasus 40 Running Shoes" />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          {/* SKU & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">SKU Code *</label>
              <Input {...register("sku")} placeholder="NK-RUN-PEG40" />
              {errors.sku && <p className="text-[11px] text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Category *</label>
              <Select
                value={watch("categoryId")}
                onValueChange={(val) => setValue("categoryId", val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-[11px] text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          {/* Price, Compare Price, Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Price (₹) *</label>
              <Input type="number" {...register("price")} placeholder="1499" />
              {errors.price && <p className="text-[11px] text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Compare At (₹)</label>
              <Input type="number" {...register("compareAtPrice")} placeholder="1999" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Stock Qty *</label>
              <Input type="number" {...register("stock")} placeholder="45" />
              {errors.stock && <p className="text-[11px] text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description *</label>
            <Textarea
              {...register("description")}
              placeholder="Highlight product features, materials, and sizing..."
              rows={3}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Product URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Store URL *</label>
            <Input {...register("productUrl")} placeholder="https://urbanstyle.in/products/..." />
            {errors.productUrl && (
              <p className="text-[11px] text-destructive">{errors.productUrl.message}</p>
            )}
          </div>

          {/* Status */}
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
                <SelectItem value="active">Active (Available for DM automation)</SelectItem>
                <SelectItem value="inactive">Inactive / Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
