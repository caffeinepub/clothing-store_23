import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../contexts/CartContext";

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="cart.empty_state"
      >
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-display text-3xl font-bold mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link to="/shop" search={{ category: undefined }}>
          <Button
            className="text-xs tracking-widest uppercase px-8"
            data-ocid="cart.primary_button"
          >
            Start Shopping
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10" data-ocid="cart.panel">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          Review
        </p>
        <h1 className="font-display text-4xl font-bold">Your Cart</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                data-ocid={`cart.item.${i + 1}`}
              >
                <div className="flex gap-4 py-6">
                  <Link
                    to="/product/$id"
                    params={{ id: item.product.id.toString() }}
                  >
                    <img
                      src={
                        item.product.imageUrl ||
                        `https://picsum.photos/seed/${item.product.id}/200/250`
                      }
                      alt={item.product.name}
                      className="w-24 h-32 object-cover bg-muted flex-shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.size} · {item.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.color)
                        }
                        className="p-1 hover:text-destructive transition-colors flex-shrink-0"
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="p-2 hover:bg-muted transition-colors"
                          data-ocid={`cart.button.${i + 1}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="p-2 hover:bg-muted transition-colors"
                          data-ocid={`cart.button.${i + 1}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(
                          item.product.price * BigInt(item.quantity),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <Separator />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border p-6 space-y-4 sticky top-24">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <Separator />
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
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
            <Link to="/checkout">
              <Button
                className="w-full text-xs tracking-widest uppercase py-6 mt-2"
                data-ocid="cart.primary_button"
              >
                Proceed to Checkout
              </Button>
            </Link>
            <Link
              to="/shop"
              search={{ category: undefined }}
              className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
              data-ocid="cart.link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
