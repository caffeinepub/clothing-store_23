import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold tracking-widest mb-3">
              LUXE
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Premium fashion for the discerning individual. Crafted with care,
              worn with confidence.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-muted-foreground">
              Shop
            </h4>
            <ul className="space-y-2">
              {["Women", "Men", "Accessories", "Sale"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/shop"
                    search={{ category: cat.toLowerCase() }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-muted-foreground">
              Help
            </h4>
            <ul className="space-y-2">
              {["Size Guide", "Returns", "Shipping", "Contact"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year}. Built with{" "}
            <Heart
              className="inline w-3 h-3 text-destructive"
              fill="currentColor"
            />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © {year} LUXE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
