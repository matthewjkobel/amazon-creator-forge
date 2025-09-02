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
    featured_content_url_2?: string;
    featured_content_url_3?: string;
    featured_content_desc_1?: string;
    featured_content_desc_2?: string;
    featured_content_desc_3?: string;
    price_min?: number;
    price_max?: number;
    creator_socials?: Array<{
      platform: string;
      url: string;
      handle?: string;
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
        return <Video className="h-4 w-4 text-red-500" />;
      case 'instagram':
        return <Users className="h-4 w-4 text-pink-500" />;
      case 'tiktok':
        return <Video className="h-4 w-4 text-black" />;
      case 'facebook':
        return <ExternalLink className="h-4 w-4 text-blue-600" />;
      case 'pinterest':
        return <ExternalLink className="h-4 w-4 text-red-600" />;
      case 'x':
        return <ExternalLink className="h-4 w-4 text-black" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'tiktok':
        return 'TikTok';
      case 'facebook':
        return 'Facebook';
      case 'pinterest':
        return 'Pinterest';
      case 'x':
        return 'X (Twitter)';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const getSocialMediaUrl = (platform: string, handle: string, url?: string) => {
    // If full URL exists, use it
    if (url && url.startsWith('http')) {
      return url;
    }
    
    // Otherwise, construct URL from handle
    const cleanHandle = handle?.replace(/^@/, '') || '';
    
    switch (platform.toLowerCase()) {
      case 'youtube':
        return `https://youtube.com/@${cleanHandle}`;
      case 'instagram':
        return `https://instagram.com/${cleanHandle}`;
      case 'tiktok':
        return `https://tiktok.com/@${cleanHandle}`;
      case 'facebook':
        return `https://facebook.com/${cleanHandle}`;
      case 'pinterest':
        return `https://pinterest.com/${cleanHandle}`;
      case 'x':
        return `https://x.com/${cleanHandle}`;
      default:
        return url || `https://${cleanHandle}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-48 w-48 mx-auto sm:mx-0">
              <AvatarImage src={creator.headshot_url || creator.avatar_url} alt={creator.display_name} />
              <AvatarFallback className="text-2xl">
                {getInitials(creator.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{creator.display_name}</h1>
                  {creator.headline && (
                    <p className="text-lg text-muted-foreground mt-2">{creator.headline}</p>
                  )}
                  {creator.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-3 text-sm text-muted-foreground">
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
              
              {/* About Me section moved to top */}
              {creator.bio && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">About Me</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {creator.bio}
                  </p>
                </div>
              )}
              
              {/* Amazon Storefront Link */}
              {creator.storefront_url && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a 
                      href={creator.storefront_url.startsWith('http') ? creator.storefront_url : `https://${creator.storefront_url}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Amazon Storefront
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Niches & Pricing Combined */}
        {(creator.creator_niches && creator.creator_niches.length > 0) || (creator.price_min || creator.price_max) ? (
          <Card>
            <CardHeader>
              <CardTitle>Niches & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Niches */}
              {creator.creator_niches && creator.creator_niches.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Content Niches</h4>
                  <div className="flex flex-wrap gap-2">
                    {creator.creator_niches?.map((niche, index) => (
                      <Badge key={index} variant="secondary">
                        {niche.niches.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pricing */}
              {(creator.price_min || creator.price_max) && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Collaboration Pricing
                  </h4>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(creator.price_min, creator.price_max)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Social Media */}
        {creator.creator_socials && creator.creator_socials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {creator.creator_socials.map((social, index) => {
                  const socialUrl = getSocialMediaUrl(social.platform, social.handle || '', social.url);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(social.platform)}
                        <div>
                          <p className="text-sm font-medium">{getPlatformName(social.platform)}</p>
                          <p className="text-xs text-muted-foreground">
                            @{social.handle || social.url?.split('/').pop() || 'profile'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={socialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:scale-105 transition-transform"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>


      {/* Featured Content */}
      {(creator.featured_video_url || creator.featured_content_url_2 || creator.featured_content_url_3) && (
        <Card>
          <CardHeader>
            <CardTitle>Featured Content Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creator.featured_video_url && (
                <div className="space-y-1">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={creator.featured_video_url.startsWith('http') ? creator.featured_video_url : `https://${creator.featured_video_url}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Content Example 1
                    </a>
                  </Button>
                  {creator.featured_content_desc_1 && (
                    <p className="text-sm text-muted-foreground pl-6">{creator.featured_content_desc_1}</p>
                  )}
                </div>
              )}
              
              {creator.featured_content_url_2 && (
                <div className="space-y-1">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={creator.featured_content_url_2.startsWith('http') ? creator.featured_content_url_2 : `https://${creator.featured_content_url_2}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Content Example 2
                    </a>
                  </Button>
                  {creator.featured_content_desc_2 && (
                    <p className="text-sm text-muted-foreground pl-6">{creator.featured_content_desc_2}</p>
                  )}
                </div>
              )}
              
              {creator.featured_content_url_3 && (
                <div className="space-y-1">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={creator.featured_content_url_3.startsWith('http') ? creator.featured_content_url_3 : `https://${creator.featured_content_url_3}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Content Example 3
                    </a>
                  </Button>
                  {creator.featured_content_desc_3 && (
                    <p className="text-sm text-muted-foreground pl-6">{creator.featured_content_desc_3}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorProfileView;