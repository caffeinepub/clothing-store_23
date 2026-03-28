import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useProducts } from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { data: allProducts, isLoading } = useProducts();

  const wishlistProducts = (allProducts ?? []).filter((p) =>
    wishlistIds.has(p.id.toString()),
  );

  const handleMoveToCart = (productId: bigint) => {
    const product = wishlistProducts.find((p) => p.id === productId);
    if (!product) return;
    addItem(
      product,
      product.sizes[0] ?? "One Size",
      product.colors[0] ?? "Default",
    );
    removeFromWishlist(productId);
    toast.success("Moved to cart");
  };

  return (
    <main className="container mx-auto px-4 py-10" data-ocid="wishlist.panel">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          Saved
        </p>
        <h1 className="font-display text-4xl font-bold">Your Wishlist</h1>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          data-ocid="wishlist.loading_state"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-20" data-ocid="wishlist.empty_state">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="font-display text-3xl font-bold mb-3">
            Nothing Saved Yet
          </h2>
          <p className="text-muted-foreground mb-8">
            Save items you love to your wishlist.
          </p>
          <Link to="/shop" search={{ category: undefined }}>
            <Button
              className="text-xs tracking-widest uppercase px-8"
              data-ocid="wishlist.primary_button"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlistProducts.map((product, i) => (
              <motion.div
                key={product.id.toString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group relative"
                data-ocid={`wishlist.item.${i + 1}`}
              >
                <div className="relative overflow-hidden bg-muted aspect-[3/4]">
                  <Link
                    to="/product/$id"
                    params={{ id: product.id.toString() }}
                  >
                    <img
                      src={
                        product.imageUrl ||
                        `https://picsum.photos/seed/${product.id}/400/500`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                    data-ocid={`wishlist.delete_button.${i + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium line-clamp-1">
                      {product.name}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs tracking-wide gap-1"
                    onClick={() => handleMoveToCart(product.id)}
                    data-ocid={`wishlist.button.${i + 1}`}
                  >
                    <ShoppingBag className="w-3 h-3" /> Move to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
