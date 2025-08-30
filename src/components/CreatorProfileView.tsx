import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ExternalLink, Edit, Users, TrendingUp, DollarSign, Video } from "lucide-react";

interface CreatorProfileViewProps {
  creator: {
    id: string;
    display_name: string;
    headline?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    headshot_url?: string;
    storefront_url?: string;
    featured_video_url?: string;
    price_min?: number;
    price_max?: number;
    creator_socials?: Array<{
      platform: string;
      url: string;
      followers?: number;
      avg_views?: number;
    }>;
    creator_niches?: Array<{
      niches: { name: string };
    }>;
  };
  isEditable?: boolean;
  onEdit?: () => void;
}

const CreatorProfileView = ({ creator, isEditable = false, onEdit }: CreatorProfileViewProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return "Price upon request";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Price upon request";
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Video className="h-4 w-4" />;
      case 'instagram':
        return <Users className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24 mx-auto sm:mx-0">
              <AvatarImage src={creator.headshot_url || creator.avatar_url} alt={creator.display_name} />
              <AvatarFallback className="text-lg">
                {getInitials(creator.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{creator.display_name}</h1>
                  {creator.headline && (
                    <p className="text-muted-foreground mt-1">{creator.headline}</p>
                  )}
                  {creator.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {creator.location}
                    </div>
                  )}
                </div>
                
                {isEditable && (
                  <Button onClick={onEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* About */}
        {creator.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {creator.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        {(creator.price_min || creator.price_max) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatPrice(creator.price_min, creator.price_max)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Niches */}
        {creator.creator_niches && creator.creator_niches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Niches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {creator.creator_niches?.map((niche, index) => (
                  <Badge key={index} variant="secondary">
                    {niche.niches.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        {creator.creator_socials && creator.creator_socials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {creator.creator_socials.map((social, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(social.platform)}
                      <div>
                        <p className="font-medium capitalize">{social.platform}</p>
                        {social.followers && (
                          <p className="text-sm text-muted-foreground">
                            {social.followers.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Links */}
      {(creator.storefront_url || creator.featured_video_url) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creator.storefront_url && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={creator.storefront_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Amazon Storefront
                  </a>
                </Button>
              )}
              {creator.featured_video_url && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={creator.featured_video_url} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-2" />
                    Featured Content
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorProfileView;