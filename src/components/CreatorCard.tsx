import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Eye, Heart, Users, ExternalLink } from "lucide-react";

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    headline: string;
    location: string;
    avatar_url?: string;
    niche_tags: string[];
    platforms: {
      name: string;
      followers: number;
      avg_views?: number;
    }[];
    engagement_rate: number;
    price_range: {
      min: number;
      max: number;
    };
    is_featured: boolean;
  };
  isBlurred?: boolean;
}

const CreatorCard = ({ creator, isBlurred = false }: CreatorCardProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const topPlatform = creator.platforms.reduce((prev, current) => 
    prev.followers > current.followers ? prev : current
  );

  return (
    <Card className={`group hover:shadow-medium transition-smooth ${isBlurred ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
            <AvatarImage src={creator.avatar_url} alt={creator.name} />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-smooth">
                  {creator.name}
                  {creator.is_featured && (
                    <Badge variant="outline" className="ml-2 text-xs bg-coral/10 text-coral border-coral/20">
                      Featured
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {creator.headline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{creator.location}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{formatNumber(topPlatform.followers)}</span>
              </div>
              {topPlatform.avg_views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatNumber(topPlatform.avg_views)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{creator.engagement_rate}% ER</span>
              </div>
            </div>

            {/* Platforms */}
            <div className="flex flex-wrap gap-1 mt-3">
              {creator.platforms.slice(0, 3).map((platform) => (
                <Badge key={platform.name} variant="secondary" className="text-xs">
                  {platform.name}
                </Badge>
              ))}
              {creator.platforms.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{creator.platforms.length - 3}
                </Badge>
              )}
            </div>

            {/* Niches */}
            <div className="flex flex-wrap gap-1 mt-2">
              {creator.niche_tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {tag}
                </Badge>
              ))}
              {creator.niche_tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{creator.niche_tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Price Range */}
            <div className="mt-3">
              <span className="text-sm font-medium text-foreground">
                ${creator.price_range.min} - ${creator.price_range.max}
              </span>
              <span className="text-xs text-muted-foreground ml-1">per project</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
          <Button 
            variant={isBlurred ? "premium" : "default"} 
            size="sm" 
            className="flex-1"
            disabled={isBlurred}
          >
            {isBlurred ? "Upgrade to Contact" : "Contact"}
            {isBlurred && <ExternalLink className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CreatorCard;