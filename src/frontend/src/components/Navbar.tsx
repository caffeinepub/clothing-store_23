import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { identity, login, clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-50 bg-background border-b border-border"
      data-ocid="nav.panel"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-widest text-foreground"
          data-ocid="nav.link"
        >
          LUXE
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm tracking-wide transition-colors hover:text-foreground ${
                isActive(link.to)
                  ? "text-foreground font-semibold border-b border-foreground pb-0.5"
                  : "text-muted-foreground"
              }`}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/wishlist"
            className="relative p-2 hover:opacity-70 transition-opacity"
            data-ocid="nav.link"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.size > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-foreground text-background">
                {wishlistIds.size}
              </Badge>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative p-2 hover:opacity-70 transition-opacity"
            data-ocid="nav.link"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-foreground text-background">
                {itemCount}
              </Badge>
            )}
          </Link>

          {identity ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="hidden md:block"
                data-ocid="nav.link"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs tracking-wide"
                >
                  Admin
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="hidden md:flex items-center gap-1 text-xs tracking-wide"
                data-ocid="nav.button"
              >
                <User className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={login}
              className="hidden md:flex items-center gap-1 text-xs tracking-wide"
              data-ocid="nav.button"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 hover:opacity-70 transition-opacity"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm tracking-wide text-foreground py-1"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </Link>
              ))}
              {identity ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm tracking-wide"
                    data-ocid="nav.link"
                  >
                    Admin Panel
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    className="text-sm tracking-wide text-left"
                    data-ocid="nav.button"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  className="text-sm tracking-wide text-left"
                  data-ocid="nav.button"
                >
                  Sign In
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
