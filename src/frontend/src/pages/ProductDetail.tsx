import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useProduct } from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const productId = BigInt(id);
  const { data: product, isLoading } = useProduct(productId);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="product.error_state"
      >
        <p className="font-display text-3xl text-muted-foreground">
          Product not found
        </p>
        <Link
          to="/shop"
          search={{ category: undefined }}
          className="text-sm underline mt-4 block"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  const imageUrl =
    product.imageUrl || `https://picsum.photos/seed/${product.id}/600/750`;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const size = selectedSize ?? product.sizes[0] ?? "One Size";
    const color = selectedColor ?? product.colors[0] ?? "Default";
    addItem(product, size, color);
    setAdded(true);
    toast.success("Added to cart");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="container mx-auto px-4 py-10" data-ocid="product.panel">
      <Link
        to="/shop"
        search={{ category: undefined }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        data-ocid="product.link"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.featured && (
            <Badge className="absolute top-4 left-4 bg-foreground text-background text-xs tracking-widest uppercase">
              Featured
            </Badge>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 capitalize">
              {product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold mt-3">
              {formatPrice(product.price)}
            </p>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Color selector */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3">
                Color:{" "}
                <span className="font-normal normal-case tracking-normal">
                  {selectedColor ?? product.colors[0]}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 text-xs border transition-colors ${
                      (selectedColor ?? product.colors[0]) === color
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                    data-ocid="product.toggle"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 text-xs border transition-colors ${
                      (selectedSize ?? product.sizes[0]) === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                    data-ocid="product.toggle"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 text-xs tracking-widest uppercase py-6"
              data-ocid="product.primary_button"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleWishlist(product.id)}
              className="py-6 px-4"
              data-ocid="product.secondary_button"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  inWishlist ? "fill-destructive text-destructive" : ""
                }`}
              />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>✦ Free shipping on orders over $200</p>
            <p>✦ Easy 30-day returns</p>
            <p>✦ Stock remaining: {product.stock.toString()}</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
