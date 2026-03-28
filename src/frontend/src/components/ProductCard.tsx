import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function ProductCard({
  product,
  index = 0,
}: { product: Product; index?: number }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);
  const imageUrl =
    product.imageUrl || `https://picsum.photos/seed/${product.id}/400/500`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
      data-ocid={`products.item.${index + 1}`}
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        <Link to="/product/$id" params={{ id: product.id.toString() }}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {product.featured && (
          <Badge className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-foreground text-background">
            Featured
          </Badge>
        )}
        {product.category.toLowerCase() === "sale" && (
          <Badge className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-destructive text-destructive-foreground">
            Sale
          </Badge>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          data-ocid={`products.toggle.${index + 1}`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist
                ? "fill-destructive text-destructive"
                : "text-foreground"
            }`}
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={() =>
              addItem(
                product,
                product.sizes[0] ?? "One Size",
                product.colors[0] ?? "Default",
              )
            }
            className="w-full bg-foreground text-background text-xs tracking-widest uppercase py-3 hover:bg-foreground/90 transition-colors"
            data-ocid={`products.button.${index + 1}`}
          >
            Quick Add
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/product/$id"
            params={{ id: product.id.toString() }}
            className="text-sm font-medium leading-tight hover:underline line-clamp-2"
          >
            {product.name}
          </Link>
          <span className="text-sm font-semibold whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          {product.category}
        </p>
      </div>
    </motion.div>
  );
}
