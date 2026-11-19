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
import { Instagram } from "@/components/shared/icons";
import { User, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";

const customerEditSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(2, "Instagram username must be at least 2 characters"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export function EditCustomerDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  isLoading = false,
  title = "Edit Customer & Address",
  description = "Update customer contact profile and physical delivery address.",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  React.useEffect(() => {
    if (open && initialData) {
      const address = initialData.address || initialData.shippingAddress || {};
      reset({
        name: initialData.name || initialData.customerName || "",
        username: initialData.username || initialData.instagramUsername || "",
        email: initialData.email || initialData.customerEmail || "",
        phone: initialData.phone || initialData.customerPhone || "",
        street: address.street || initialData.street || "",
        city: address.city || initialData.city || "",
        state: address.state || initialData.state || "",
        postalCode: address.postalCode || initialData.postalCode || "",
        country: address.country || initialData.country || "India",
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values) => {
    await onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-4 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
          <DialogTitle className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <User className="h-4 w-4 text-[#635BDB]" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Section 1: Personal & Instagram Identity */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <User className="h-3 w-3 text-[#635BDB]" />
              <span>Personal & Social Identity</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E293B]">Full Name *</label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Siddharth Verma"
                  className="h-9 text-xs"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E293B]">Instagram Username *</label>
                <div className="relative">
                  <Input
                    {...register("username")}
                    placeholder="@siddharth_v_fits"
                    className="h-9 text-xs pl-7"
                  />
                  <Instagram className="h-3.5 w-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                </div>
                {errors.username && (
                  <p className="text-[11px] text-red-500">{errors.username.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-[#635BDB]" />
              <span>Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E293B]">Email Address</label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="customer@example.com"
                  className="h-9 text-xs"
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E293B]">Phone Number</label>
                <Input
                  {...register("phone")}
                  placeholder="+91 98201 44521"
                  className="h-9 text-xs"
                />
                {errors.phone && (
                  <p className="text-[11px] text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Address */}
          <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-[#635BDB]" />
              <span>Physical Address & Location</span>
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E293B]">Street Address</label>
                <Input
                  {...register("street")}
                  placeholder="Flat / House No., Building Name, Street / Locality"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">City</label>
                  <Input
                    {...register("city")}
                    placeholder="e.g. Mumbai"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">State / Province</label>
                  <Input
                    {...register("state")}
                    placeholder="e.g. Maharashtra"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">Postal / PIN Code</label>
                  <Input
                    {...register("postalCode")}
                    placeholder="e.g. 400050"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E293B]">Country</label>
                  <Input
                    {...register("country")}
                    placeholder="India"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#E2E8F0] gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
