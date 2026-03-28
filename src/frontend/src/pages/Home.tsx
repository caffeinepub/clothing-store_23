import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useFeaturedProducts } from "../hooks/useQueries";

const categories = [
  {
    name: "Women",
    slug: "women",
    image: "/assets/generated/category-women.dim_600x400.jpg",
  },
  {
    name: "Men",
    slug: "men",
    image: "/assets/generated/category-men.dim_600x400.jpg",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/assets/generated/category-accessories.dim_600x400.jpg",
  },
  {
    name: "Sale",
    slug: "sale",
    image: "https://picsum.photos/seed/sale/600/400",
  },
];

export function HomePage() {
  const { data: featured, isLoading } = useFeaturedProducts();

  return (
    <main>
      {/* Hero */}
      <section
        className="relative h-[85vh] min-h-[500px] overflow-hidden bg-muted"
        data-ocid="hero.section"
      >
        <img
          src="/assets/generated/hero-banner.dim_1400x700.jpg"
          alt="LUXE Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-xs tracking-[0.4em] uppercase text-white/80">
              New Season Arrivals
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none">
              The New
              <br />
              Collection
            </h1>
            <p className="text-sm md:text-base text-white/80 tracking-wide max-w-md mx-auto">
              Elevated essentials for the modern wardrobe
            </p>
            <Link to="/shop" search={{ category: undefined }}>
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 text-xs tracking-widest uppercase px-10 py-6 mt-4"
                data-ocid="hero.primary_button"
              >
                Shop Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section
        className="container mx-auto px-4 py-20"
        data-ocid="categories.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Explore
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Shop by Category
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              data-ocid={`categories.item.${i + 1}`}
            >
              <Link
                to="/shop"
                search={{ category: cat.slug }}
                className="group block relative overflow-hidden aspect-[4/5] bg-muted"
                data-ocid={`categories.link.${i + 1}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-display text-xl font-bold">
                    {cat.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="container mx-auto px-4 py-20 border-t border-border"
        data-ocid="featured.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Curated
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Featured Pieces
            </h2>
          </div>
          <Link
            to="/shop"
            search={{ category: undefined }}
            className="hidden md:flex items-center gap-2 text-sm tracking-wide hover:underline"
            data-ocid="featured.link"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            data-ocid="featured.loading_state"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(featured ?? []).slice(0, 8).map((product, i) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner Strip */}
      <section className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-background/60 mb-3">
            This Season
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Timeless Style,
            <br />
            Modern Sensibility
          </h2>
          <Link to="/shop" search={{ category: undefined }}>
            <Button
              variant="outline"
              className="border-background text-background bg-transparent hover:bg-background hover:text-foreground text-xs tracking-widest uppercase px-8"
              data-ocid="banner.primary_button"
            >
              Explore The Collection
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
