import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "../backend.d";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORIES = ["Women", "Men", "Accessories", "Sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_PRICE = 50000; // cents

function FilterPanel({
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  priceRange,
  setPriceRange,
}: {
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
}) {
  const toggleCategory = (cat: string) =>
    setSelectedCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat],
    );

  const toggleSize = (size: string) =>
    setSelectedSizes(
      selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size],
    );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
          Category
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                data-ocid="shop.checkbox"
              />
              <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1 text-xs border transition-colors ${
                selectedSizes.includes(size)
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              }`}
              data-ocid="shop.toggle"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
          Price: ${(priceRange[0] / 100).toFixed(0)} – $
          {(priceRange[1] / 100).toFixed(0)}
        </h3>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={500}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export function ShopPage() {
  const searchParams = useSearch({ from: "/shop" }) as { category?: string };
  const initCategory = searchParams.category
    ? [
        searchParams.category.charAt(0).toUpperCase() +
          searchParams.category.slice(1),
      ]
    : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initCategory);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    MAX_PRICE,
  ]);
  const [sortBy, setSortBy] = useState("newest");

  const { data: products, isLoading } = useProducts();

  const filtered = useMemo<Product[]>(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (c) => p.category.toLowerCase() === c.toLowerCase(),
        ),
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        selectedSizes.some((s) => p.sizes.includes(s)),
      );
    }

    result = result.filter(
      (p) =>
        Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1],
    );

    if (sortBy === "price-asc")
      result.sort((a, b) => Number(a.price - b.price));
    else if (sortBy === "price-desc")
      result.sort((a, b) => Number(b.price - a.price));

    return result;
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedSizes,
    priceRange,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedSizes.length > 0;

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          Discover
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          All Products
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
            data-ocid="shop.search_input"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 text-xs" data-ocid="shop.select">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden text-xs gap-1"
                data-ocid="shop.open_modal_button"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-foreground text-background rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                    {selectedCategories.length + selectedSizes.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display text-lg">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedSizes={selectedSizes}
                  setSelectedSizes={setSelectedSizes}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() =>
                setSelectedCategories(
                  selectedCategories.filter((c) => c !== cat),
                )
              }
              className="flex items-center gap-1 px-3 py-1 bg-foreground text-background text-xs tracking-wide"
            >
              {cat} <X className="w-3 h-3" />
            </button>
          ))}
          {selectedSizes.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() =>
                setSelectedSizes(selectedSizes.filter((s) => s !== size))
              }
              className="flex items-center gap-1 px-3 py-1 bg-foreground text-background text-xs tracking-wide"
            >
              {size} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <FilterPanel
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-6"
              data-ocid="shop.loading_state"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20" data-ocid="shop.empty_state">
              <p className="font-display text-2xl text-muted-foreground mb-3">
                No products found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-6 tracking-wide">
                {filtered.length} products
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id.toString()}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
