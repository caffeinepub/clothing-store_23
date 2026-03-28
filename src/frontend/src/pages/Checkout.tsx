import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, OrderItem } from "../backend.d";
import { useCart } from "../contexts/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePlaceOrder } from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { identity } = useInternetIdentity();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [errors, setErrors] = useState({ name: "", email: "", address: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<bigint | null>(null);

  if (items.length === 0 && !confirmed) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="checkout.empty_state"
      >
        <h1 className="font-display text-3xl font-bold mb-3">
          Your cart is empty
        </h1>
        <Link to="/shop" search={{ category: undefined }}>
          <Button
            className="text-xs tracking-widest uppercase px-8 mt-4"
            data-ocid="checkout.primary_button"
          >
            Continue Shopping
          </Button>
        </Link>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="checkout.success_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-6"
        >
          <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
          <h1 className="font-display text-4xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you, <strong>{form.name}</strong>. Your order #
            {orderId?.toString()} has been placed.
          </p>
          <p className="text-sm text-muted-foreground">
            We'll send confirmation to {form.email}
          </p>
          <Link to="/shop" search={{ category: undefined }}>
            <Button
              className="text-xs tracking-widest uppercase px-8"
              data-ocid="checkout.primary_button"
            >
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  const validate = () => {
    const errs = { name: "", email: "", address: "" };
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@"))
      errs.email = "Valid email is required";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orderItems: OrderItem[] = items.map((item) => ({
      name: item.product.name,
      color: item.color,
      size: item.size,
      productId: item.product.id,
      quantity: BigInt(item.quantity),
      price: item.product.price,
    }));

    const order: Order = {
      id: 0n,
      customerName: form.name,
      customerEmail: form.email,
      address: form.address,
      items: orderItems,
      total,
      status: "pending",
      owner: identity?.getPrincipal() ?? ("" as any),
      createdAt: BigInt(Date.now()),
    };

    try {
      const id = await placeOrder(order);
      setOrderId(id);
      clearCart();
      setConfirmed(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <main className="container mx-auto px-4 py-10" data-ocid="checkout.panel">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          Almost There
        </p>
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-1">
            <Label
              htmlFor="checkout-name"
              className="text-xs tracking-widest uppercase"
            >
              Full Name
            </Label>
            <Input
              id="checkout-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Doe"
              autoComplete="name"
              data-ocid="checkout.input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="checkout.error_state"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="checkout-email"
              className="text-xs tracking-widest uppercase"
            >
              Email
            </Label>
            <Input
              id="checkout-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="jane@example.com"
              autoComplete="email"
              data-ocid="checkout.input"
            />
            {errors.email && (
              <p
                className="text-xs text-destructive"
                data-ocid="checkout.error_state"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="checkout-address"
              className="text-xs tracking-widest uppercase"
            >
              Shipping Address
            </Label>
            <Input
              id="checkout-address"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="123 Main St, New York, NY 10001"
              autoComplete="street-address"
              data-ocid="checkout.input"
            />
            {errors.address && (
              <p
                className="text-xs text-destructive"
                data-ocid="checkout.error_state"
              >
                {errors.address}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-xs tracking-widest uppercase py-6"
            disabled={isPending}
            data-ocid="checkout.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing
                Order...
              </>
            ) : (
              `Place Order · ${formatPrice(total)}`
            )}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="border border-border p-6 space-y-4 h-fit">
          <h2 className="font-display text-lg font-bold">Order Summary</h2>
          <Separator />
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="flex gap-3 items-center"
              >
                <img
                  src={
                    item.product.imageUrl ||
                    `https://picsum.photos/seed/${item.product.id}/100/120`
                  }
                  alt={item.product.name}
                  className="w-14 h-18 object-cover bg-muted flex-shrink-0"
                  style={{ height: "72px" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {formatPrice(item.product.price * BigInt(item.quantity))}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
