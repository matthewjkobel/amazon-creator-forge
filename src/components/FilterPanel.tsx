import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";

const NICHES = [
  "Home & Garden", "Beauty & Personal Care", "Technology", "Fashion & Style",
  "Outdoors & Sports", "Health & Fitness", "Parenting", "Pets",
  "Food & Cooking", "Travel", "Arts & Crafts", "Books & Education"
];

const PLATFORMS = [
  "Amazon Storefront", "YouTube", "TikTok", "Instagram", "Pinterest", "Blog"
];

const LOCATIONS = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France"
];

interface FilterPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const FilterPanel = ({ isOpen = true, onClose, className }: FilterPanelProps) => {
  return (
    <Card className={`${className} ${isOpen ? 'block' : 'hidden'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <Input placeholder="Search creators..." />
        </div>

        <Separator />

        {/* Niches */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Niches</Label>
          <div className="grid grid-cols-1 gap-2">
            {NICHES.slice(0, 6).map((niche) => (
              <div key={niche} className="flex items-center space-x-2">
                <Checkbox id={niche} />
                <Label 
                  htmlFor={niche} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {niche}
                </Label>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
            Show more niches
          </Button>
        </div>

        <Separator />

        {/* Platforms */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Platforms</Label>
          <div className="grid grid-cols-1 gap-2">
            {PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox id={platform} />
                <Label 
                  htmlFor={platform} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Followers Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Followers</Label>
          <div className="px-2">
            <Slider 
              defaultValue={[10000, 1000000]} 
              max={5000000} 
              min={1000} 
              step={1000}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1K</span>
            <span>5M+</span>
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="price-min" className="text-xs text-muted-foreground">
                Min ($)
              </Label>
              <Input id="price-min" placeholder="100" />
            </div>
            <div>
              <Label htmlFor="price-max" className="text-xs text-muted-foreground">
                Max ($)
              </Label>
              <Input id="price-max" placeholder="5000" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Location</Label>
          <div className="grid grid-cols-1 gap-2">
            {LOCATIONS.slice(0, 4).map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox id={location} />
                <Label 
                  htmlFor={location} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Special Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Special</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="featured" />
              <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                Featured creators only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="case-studies" />
              <Label htmlFor="case-studies" className="text-sm font-normal cursor-pointer">
                Has case studies
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="available" />
              <Label htmlFor="available" className="text-sm font-normal cursor-pointer">
                Available now
              </Label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-2">
          <Button className="w-full" variant="default">
            Apply Filters
          </Button>
          <Button className="w-full" variant="outline">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;