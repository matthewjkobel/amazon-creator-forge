import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Mail, TrendingUp, Plus, Building2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import CreatorCard from "@/components/CreatorCard";

// Demo creators data for quick view
const featuredCreators = [
  {
    id: "1",
    name: "Sarah Chen",
    headline: "Home & Kitchen specialist with 500K+ engaged followers",
    location: "Los Angeles, CA",
    avatar_url: "",
    niche_tags: ["Home & Garden", "Kitchen"],
    platforms: [
      { name: "Amazon Storefront", followers: 520000, avg_views: 45000 },
      { name: "YouTube", followers: 280000, avg_views: 32000 }
    ],
    engagement_rate: 4.2,
    price_range: { min: 500, max: 2500 },
    is_featured: true
  },
  {
    id: "2", 
    name: "Mike Rodriguez",
    headline: "Tech reviewer with proven Amazon affiliate success",
    location: "Austin, TX",
    avatar_url: "",
    niche_tags: ["Technology", "Smart Home"],
    platforms: [
      { name: "YouTube", followers: 1200000, avg_views: 85000 },
      { name: "Amazon Storefront", followers: 850000, avg_views: 62000 }
    ],
    engagement_rate: 3.8,
    price_range: { min: 1000, max: 5000 },
    is_featured: true
  }
];

const BrandDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats] = useState({
    active_campaigns: 5,
    pending_inquiries: 8,
    total_creators: 23
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load brand profile
  useEffect(() => {
    const loadBrandProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data: brandData, error } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading brand profile:", error);
        } else {
          setBrand(brandData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBrandProfile();
  }, [user]);

  const handleViewDirectory = () => {
    navigate("/directory");
  };

  const handleCreateBrandProfile = () => {
    // For now, just show a toast - we can implement brand profile creation later
    toast({
      title: "Feature Coming Soon",
      description: "Brand profile creation will be available soon. For now, you can browse the creator directory.",
    });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const filteredCreators = featuredCreators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.niche_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brand Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your brand partnerships and discover new creators
          </p>
        </div>

        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_campaigns}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_inquiries}</div>
                <p className="text-xs text-muted-foreground">
                  3 responses this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Creator Network</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_creators}</div>
                <p className="text-xs text-muted-foreground">
                  Creators you've worked with
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Brand Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Brand Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brand ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{brand.company_name}</h3>
                      {brand.website_url && (
                        <a 
                          href={brand.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                          {brand.website_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                  {brand.notes && (
                    <p className="text-muted-foreground">{brand.notes}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Your Brand Profile</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up your brand profile to help creators understand your company and collaboration preferences.
                  </p>
                  <Button onClick={handleCreateBrandProfile}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Brand Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Creator Directory Access */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Discover Creators</CardTitle>
                <Button onClick={handleViewDirectory} variant="outline">
                  View Full Directory
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search creators by name or niche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredCreators.map((creator) => (
                    <CreatorCard 
                      key={creator.id} 
                      creator={creator}
                      isBlurred={false}
                    />
                  ))}
                </div>

                {filteredCreators.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No creators found matching "{searchTerm}"</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Sarah Chen accepted your collaboration proposal</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">New creator inquiry from Mike Rodriguez</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Campaign "Summer Essentials" completed successfully</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;