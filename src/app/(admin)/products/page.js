"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { formatINR, formatNumber, generateSVGPlaceholder } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { db } from "@/data/db";

export default function ProductsPage() {
  const router = useRouter();

  // Persistent list filter state
  const { products: filterState, setProductsFilter } = useListFilterStore();
  const { search, category, status, page, viewMode } = filterState;

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [deletingProduct, setDeletingProduct] = React.useState(null);

  const { data, isLoading } = useProducts({
    search,
    category,
    status,
    page,
    limit: 12,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod, e) => {
    if (e) e.stopPropagation();
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (prod, e) => {
    if (e) e.stopPropagation();
    setDeletingProduct(prod);
  };

  const handleRowClick = (prod) => {
    router.push(`/products/${prod.id}`);
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProduct) {
      await deleteMutation.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...db.state.categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns = [
    {
      key: "image",
      label: "Product",
      render: (_, row) => {
        const placeholder = generateSVGPlaceholder({
          text: row.name,
          type: "product",
          identifier: row.id,
        });
        return (
          <div className="flex items-center gap-3">
            <img
              src={placeholder}
              alt={row.name}
              className="h-10 w-10 rounded-[8px] object-cover shrink-0 border border-[#E2E8F0]"
            />
            <div>
              <Link
                href={`/products/${row.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-xs text-[#1E293B] block hover:text-[#635BDB] hover:underline"
              >
                {row.name}
              </Link>
              <span className="text-[10px] text-[#64748B]">SKU: {row.sku}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "categoryName",
      label: "Category",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (val) => <span className="font-semibold text-xs text-[#1E293B]">{formatINR(val)}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (val) => (
        <span className={`text-xs font-medium ${val < 20 ? "text-red-600" : "text-[#1E293B]"}`}>
          {val} in stock
        </span>
      ),
    },
    {
      key: "messagesSent",
      label: "DMs Sent",
      sortable: true,
      render: (val) => <span className="text-xs text-[#1E293B]">{formatNumber(val)}</span>,
    },
    {
      key: "linkClicks",
      label: "Clicks",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#635BDB]">{formatNumber(val)}</span>,
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-7 w-7 text-[#64748B] hover:text-[#635BDB]"
            title="View Details"
          >
            <Link href={`/products/${row.id}`} onClick={(e) => e.stopPropagation()}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleOpenEdit(row, e)}
            className="h-7 w-7 text-[#64748B]"
            title="Edit Product"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleOpenDelete(row, e)}
            className="h-7 w-7 text-red-600 hover:bg-red-50"
            title="Delete Product"
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
        title="Products"
        description="Catalog items linked to automated Reel keyword triggers and direct Instagram sales."
      >
        <div className="flex items-center gap-2">
          {/* Grid/Table Toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-[8px] border border-[#E2E8F0]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProductsFilter({ viewMode: "table" })}
              className={`h-7 w-7 rounded-[6px] ${
                viewMode === "table" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B]"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProductsFilter({ viewMode: "grid" })}
              className={`h-7 w-7 rounded-[6px] ${
                viewMode === "grid" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </PageHeader>

      {/* Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={data?.products || []}
          isLoading={isLoading}
          searchPlaceholder="Search product name, SKU..."
          searchValue={search}
          onSearchChange={(val) => setProductsFilter({ search: val, page: 1 })}
          onRowClick={handleRowClick}
          exportFilename="products_catalog"
          filters={
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Category"
                value={category}
                onChange={(val) => setProductsFilter({ category: val, page: 1 })}
                options={categoryOptions}
              />
              <FilterDropdown
                label="Status"
                value={status}
                onChange={(val) => setProductsFilter({ status: val, page: 1 })}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          }
          pagination={{
            page: data?.pagination?.page || 1,
            limit: data?.pagination?.limit || 12,
            totalRecords: data?.pagination?.totalRecords || 0,
            totalPages: data?.pagination?.totalPages || 1,
            onPageChange: (newPage) => setProductsFilter({ page: newPage }),
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Grid Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Category"
                value={category}
                onChange={(val) => setProductsFilter({ category: val, page: 1 })}
                options={categoryOptions}
              />
              <FilterDropdown
                label="Status"
                value={status}
                onChange={(val) => setProductsFilter({ status: val, page: 1 })}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
            <p className="text-xs text-[#64748B]">
              Showing {data?.products?.length || 0} products
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.products?.map((prod) => {
              const placeholder = generateSVGPlaceholder({
                text: prod.name,
                type: "product",
                identifier: prod.id,
              });

              return (
                <Card
                  key={prod.id}
                  onClick={() => handleRowClick(prod)}
                  className="cursor-pointer hover:shadow-md transition-all group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-hidden flex items-center justify-center">
                      <img
                        src={placeholder}
                        alt={prod.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <StatusBadge status={prod.status} />
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        {prod.categoryName}
                      </p>
                      <h4 className="text-sm font-bold text-[#1E293B] group-hover:text-[#635BDB] transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#E2E8F0] mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#1E293B]">
                        {formatINR(prod.price)}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] block">
                        Stock: {prod.stock}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-7 w-7 text-[#64748B] hover:text-[#635BDB]"
                        title="View Details"
                      >
                        <Link href={`/products/${prod.id}`} onClick={(e) => e.stopPropagation()}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleOpenEdit(prod, e)}
                        className="h-7 w-7 text-[#64748B]"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleOpenDelete(prod, e)}
                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Delete Product?"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? Any automations referencing this product will need to be reconfigured.`}
        confirmText="Delete Product"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
