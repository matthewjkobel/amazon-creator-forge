import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import CreatorCard from "@/components/CreatorCard";

// Demo data
const mockCreators = [
  {
    id: "1",
    name: "Sarah Chen",
    headline: "Home & Kitchen specialist with 500K+ engaged followers across Amazon Storefront and YouTube",
    location: "Los Angeles, CA",
    avatar_url: "",
    niche_tags: ["Home & Garden", "Kitchen", "Organization"],
    platforms: [
      { name: "Amazon Storefront", followers: 520000, avg_views: 45000 },
      { name: "YouTube", followers: 280000, avg_views: 32000 },
      { name: "Instagram", followers: 150000, avg_views: 18000 }
    ],
    engagement_rate: 4.2,
    price_range: { min: 500, max: 2500 },
    is_featured: true
  },
  {
    id: "2", 
    name: "Mike Rodriguez",
    headline: "Tech reviewer focused on smart home and gadgets with proven Amazon affiliate success",
    location: "Austin, TX",
    avatar_url: "",
    niche_tags: ["Technology", "Smart Home", "Gadgets"],
    platforms: [
      { name: "YouTube", followers: 1200000, avg_views: 85000 },
      { name: "Amazon Storefront", followers: 850000, avg_views: 62000 },
      { name: "TikTok", followers: 340000, avg_views: 28000 }
    ],
    engagement_rate: 3.8,
    price_range: { min: 1000, max: 5000 },
    is_featured: true
  },
  {
    id: "3",
    name: "Emma Watson",
    headline: "Beauty and skincare creator with authentic product reviews and tutorials",
    location: "New York, NY", 
    avatar_url: "",
    niche_tags: ["Beauty", "Skincare", "Self-Care"],
    platforms: [
      { name: "Instagram", followers: 680000, avg_views: 42000 },
      { name: "TikTok", followers: 920000, avg_views: 75000 },
      { name: "Amazon Storefront", followers: 450000, avg_views: 35000 }
    ],
    engagement_rate: 5.1,
    price_range: { min: 750, max: 3500 },
    is_featured: false
  },
  {
    id: "4",
    name: "James Park",
    headline: "Fitness and outdoor gear expert with strong male demographic following",
    location: "Denver, CO",
    avatar_url: "",
    niche_tags: ["Fitness", "Outdoors", "Sports"],
    platforms: [
      { name: "YouTube", followers: 890000, avg_views: 65000 },
      { name: "Amazon Storefront", followers: 720000, avg_views: 58000 },
      { name: "Instagram", followers: 420000, avg_views: 32000 }
    ],
    engagement_rate: 4.5,
    price_range: { min: 800, max: 4000 },
    is_featured: false
  }
];

const Directory = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoggedIn] = useState(false); // Demo - not logged in

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Directory</h1>
            <p className="text-muted-foreground">
              Discover vetted Amazon-focused creators for your brand partnerships
            </p>
          </div>

          {!isLoggedIn && (
            <Card className="lg:max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Unlock Full Access</p>
                    <p className="text-xs text-muted-foreground">Join to contact creators</p>
                  </div>
                   <Button 
                    size="sm" 
                    variant="premium"
                    onClick={() => window.open('/auth', '_self')}
                  >
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Select defaultValue="relevance">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="followers">Followers (High to Low)</SelectItem>
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {mockCreators.length} creators found
            </span>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterPanel />
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed left-0 top-0 h-full w-80 bg-background border-r overflow-y-auto">
                <FilterPanel 
                  onClose={() => setShowFilters(false)}
                  className="border-none shadow-none"
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {!isLoggedIn && (
              <Card className="mb-6 bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Preview Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You're viewing a limited preview. Join as a brand member to unlock full creator contact details, 
                    advanced filters, and collaboration tools.
                  </p>
                  <Button 
                    variant="hero"
                    onClick={() => window.open('/auth', '_self')}
                  >
                    Join as Brand Member - $299/year
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 xl:grid-cols-2" 
                : "grid-cols-1"
            }`}>
              {mockCreators.map((creator) => (
                <CreatorCard 
                  key={creator.id} 
                  creator={creator}
                  isBlurred={!isLoggedIn}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => console.log('Loading more creators...')}
              >
                Load More Creators
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;