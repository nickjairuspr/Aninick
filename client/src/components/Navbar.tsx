"use client";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Play, Tv, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl" data-testid="navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Tv className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">
                AniStream
              </span>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-md items-center"
            data-testid="form-search"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background placeholder:text-muted-foreground"
                data-testid="input-search"
              />
            </div>
          </form>

          <div className="hidden sm:flex items-center gap-1">
            <Link href="/">
              <Button
                variant={location === "/" ? "secondary" : "ghost"}
                size="sm"
                data-testid="link-nav-home"
              >
                Home
              </Button>
            </Link>
            <Link href="/search?q=trending">
              <Button
                variant={location.startsWith("/search") ? "secondary" : "ghost"}
                size="sm"
                data-testid="link-nav-browse"
              >
                Browse
              </Button>
            </Link>
            <Link href="/watchlist">
              <Button
                variant={location === "/watchlist" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                data-testid="link-nav-watchlist"
              >
                <Heart className={`h-3.5 w-3.5 ${location === "/watchlist" ? "fill-purple-500 text-purple-500" : ""}`} />
                Watchlist
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
                data-testid="input-search-mobile"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/search?q=trending" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Browse
              </Button>
            </Link>
            <Link href="/watchlist" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Watchlist
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
