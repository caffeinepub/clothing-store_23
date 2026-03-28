import { type ReactNode, createContext, useContext, useState } from "react";

interface WishlistContextType {
  wishlistIds: Set<string>;
  addToWishlist: (id: bigint) => void;
  removeFromWishlist: (id: bigint) => void;
  isInWishlist: (id: bigint) => boolean;
  toggleWishlist: (id: bigint) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const addToWishlist = (id: bigint) =>
    setWishlistIds((prev) => new Set([...prev, id.toString()]));

  const removeFromWishlist = (id: bigint) =>
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(id.toString());
      return next;
    });

  const isInWishlist = (id: bigint) => wishlistIds.has(id.toString());

  const toggleWishlist = (id: bigint) => {
    if (isInWishlist(id)) removeFromWishlist(id);
    else addToWishlist(id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
