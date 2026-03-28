import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { useActor } from "./hooks/useActor";
import { AdminPage } from "./pages/Admin";
import { CartPage } from "./pages/Cart";
import { CheckoutPage } from "./pages/Checkout";
import { HomePage } from "./pages/Home";
import { ProductDetailPage } from "./pages/ProductDetail";
import { ShopPage } from "./pages/Shop";
import { WishlistPage } from "./pages/Wishlist";

// Seed initializer component
function SeedInitializer() {
  const { actor, isFetching } = useActor();
  useEffect(() => {
    if (!actor || isFetching) return;
    const done = localStorage.getItem("seed_done");
    if (done) return;
    actor
      .seedProducts()
      .then(() => {
        localStorage.setItem("seed_done", "true");
      })
      .catch(() => {});
  }, [actor, isFetching]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SeedInitializer />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wishlist",
  component: WishlistPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  productRoute,
  cartRoute,
  wishlistRoute,
  checkoutRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </WishlistProvider>
    </CartProvider>
  );
}
