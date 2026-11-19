"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  formatINR,
  formatNumber,
  formatDate,
  generateSVGPlaceholder,
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  Package,
  Edit2,
  Trash2,
  ExternalLink,
  Film,
  Zap,
  TrendingUp,
  MessageSquare,
  MousePointerClick,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data: product, isLoading } = useProduct(id);
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  if (isLoading) {
    return <LoadingState text="Loading product details..." />;
  }

  if (!product) {
    return (
      <EmptyState
        icon={Package}
        title="Product Not Found"
        description={`No product found matching identifier "${id}". It may have been removed.`}
        actionLabel="Back to Products"
        actionHref="/products"
      />
    );
  }

  const handleEditSubmit = async (formData) => {
    await updateProductMutation.mutateAsync({ id: product.id, data: formData });
    setEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteProductMutation.mutateAsync(product.id);
    router.push("/products");
  };

  const placeholder = generateSVGPlaceholder({
    text: product.name,
    type: "product",
    identifier: product.id,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/products"
        backLabel="Back to Products"
        title={product.name}
        subtitle={`SKU: ${product.sku} • Category: ${product.categoryName}`}
        badge={<StatusBadge status={product.status} />}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Product</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive-soft border-border"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </>
        }
      />

      {/* 2-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Overview Card */}
          <Card className="border-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="aspect-square w-full rounded-[10px] overflow-hidden border border-border bg-muted/40 flex items-center justify-center relative">
                <Image
                  src={placeholder}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2 py-0.5 rounded">
                      {product.categoryName}
                    </span>
                    <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {product.description || "Premium catalog item optimized for Instagram direct message conversion funnels."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatINR(product.price)}
                    </span>
                    {product.compareAtPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatINR(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Product on Storefront</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Connected Instagram Reels Card */}
          <Card className="border-border">
            <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <span>Featured Instagram Reels ({product.linkedReels?.length || 0})</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Reels actively driving DM comment traffic to this product
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {!product.linkedReels || product.linkedReels.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No Reels are currently linked to this product. Assign this product in Reels &amp; Posts.
                </div>
              ) : (
                product.linkedReels.map((reel) => {
                  const reelPlaceholder = generateSVGPlaceholder({
                    text: reel.caption,
                    type: "reel",
                    identifier: reel.id,
                  });

                  return (
                    <div key={reel.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Image
                          src={reelPlaceholder}
                          alt={reel.caption}
                          width={36}
                          height={48}
                          unoptimized
                          className="h-12 w-9 rounded-[6px] object-cover shrink-0 border border-border"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/reels/${reel.id}`}
                            className="font-bold text-xs text-foreground hover:text-primary truncate block"
                          >
                            {reel.caption}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              Post: {reel.instagramPostId}
                            </span>
                            {reel.triggerKeywords && reel.triggerKeywords.length > 0 && (
                              <span className="text-[10px] font-bold text-primary bg-primary-soft px-1.5 py-0.2 rounded">
                                Keyword: {reel.triggerKeywords.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Triggers</span>
                          <span className="font-bold text-xs text-foreground">
                            {formatNumber(reel.triggerCount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Clicks</span>
                          <span className="font-bold text-xs text-primary">
                            {formatNumber(reel.linkClicks)}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold text-primary">
                          <Link href={`/reels/${reel.id}`}>View Reel</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Connected Automations Card */}
          <Card className="border-border">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Automated DM Workflows ({product.linkedAutomations?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {!product.linkedAutomations || product.linkedAutomations.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No active automations attached to this product yet.
                </div>
              ) : (
                product.linkedAutomations.map((auto) => (
                  <div key={auto.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <Link
                        href={`/automations/${auto.id}`}
                        className="font-bold text-xs text-foreground hover:text-primary block"
                      >
                        {auto.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">
                        Trigger keyword: &quot;{auto.triggerKeyword || auto.triggerKeywords?.[0] || "BUY"}&quot;
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Executions</span>
                        <span className="font-bold text-xs text-foreground">
                          {formatNumber(auto.executions)}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold text-primary">
                        <Link href={`/automations/${auto.id}`}>Configure</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1 span) */}
        <div className="space-y-6">
          {/* Inventory & Pricing Card */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Inventory &amp; Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Unit Price</span>
                <span className="font-bold text-foreground text-sm">{formatINR(product.price)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Compare-at Price</span>
                <span>{formatINR(product.compareAtPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Stock On Hand</span>
                <span className="font-semibold text-foreground">{product.stock} units</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Stock Status</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    product.stock > 10
                      ? "bg-success-soft text-success"
                      : product.stock > 0
                      ? "bg-warning-soft text-warning"
                      : "bg-destructive-soft text-destructive"
                  }`}
                >
                  {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Attributed Performance Card */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Attributed Funnel Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-[8px] bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">DMs Dispatched</span>
                  <span className="text-base font-bold text-foreground">
                    {formatNumber(product.messagesSent)}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Store Clicks</span>
                  <span className="text-base font-bold text-primary">
                    {formatNumber(product.linkClicks)}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Completed Orders</span>
                  <span className="text-base font-bold text-success">
                    {product.ordersCount || 0}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Attributed Revenue</span>
                  <span className="text-base font-bold text-foreground">
                    {formatINR(product.revenue || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Catalog Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="w-full text-xs h-8 justify-start gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Product Attributes</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full text-xs h-8 justify-start gap-2"
              >
                <Link href={`/reels`}>
                  <Film className="h-3.5 w-3.5" />
                  <span>Attach to New Instagram Reel</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Product Modal Form */}
      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
        onSubmit={handleEditSubmit}
        isSubmitting={updateProductMutation.isPending}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isPending={deleteProductMutation.isPending}
      />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading product..." />}>
      <ProductDetailContent />
    </Suspense>
  );
}
