import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Globe, ShoppingBag, Video, DollarSign, Instagram, Youtube, FileText, ExternalLink, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";

const socialPlatforms = [
  { name: "YouTube", value: "youtube", icon: Youtube, placeholder: "https://youtube.com/@yourhandle" },
  { name: "Instagram", value: "instagram", icon: Instagram, placeholder: "https://instagram.com/yourhandle" },
  { name: "TikTok", value: "tiktok", icon: Video, placeholder: "https://tiktok.com/@yourhandle" },
  { name: "Facebook", value: "facebook", icon: ExternalLink, placeholder: "https://facebook.com/yourpage" },
  { name: "Pinterest", value: "pinterest", icon: ExternalLink, placeholder: "https://pinterest.com/yourhandle" },
  { name: "X (Twitter)", value: "x", icon: ExternalLink, placeholder: "https://x.com/yourhandle" }
];

const niches = [
  "Beauty", "Fashion", "Fitness", "Food", "Home", "Outdoors", "Parenting", "Pets", "Tech", "Travel"
];

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  bio: z.string().min(10, "About me must be at least 10 characters").max(1000, "About me must be 1000 characters or less"),
  storefrontUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  featuredVideoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  selectedNiches: z.array(z.string()).min(1, "Please select at least one niche"),
  socials: z.record(z.string())
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CreatorProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isExistingCreator, setIsExistingCreator] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      location: "",
      bio: "",
      storefrontUrl: "",
      featuredVideoUrl: "",
      priceMin: "",
      priceMax: "",
      selectedNiches: [],
      socials: {}
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load existing creator profile if exists
  useEffect(() => {
    const loadCreatorProfile = async () => {
      if (!user) return;

      try {
        // Check if creator profile exists
        const { data: creator, error } = await supabase
          .from("creators")
          .select(`
            *,
            creator_socials (*),
            creator_niches (niche_id),
            niches (name)
          `)
          .eq("user_id", user.id)
          .single();

        if (creator && !error) {
          setIsExistingCreator(true);
          
          // Populate form with existing data
          const socialsData: Record<string, string> = {};
          creator.creator_socials?.forEach((social: any) => {
            socialsData[social.platform] = social.url || "";
          });

          const selectedNiches = creator.creator_niches?.map((cn: any) => 
            niches.find(n => n === cn.niches?.name)
          ).filter(Boolean) || [];

          form.reset({
            displayName: creator.display_name || "",
            location: creator.location || "",
            bio: creator.bio || "",
            storefrontUrl: creator.storefront_url || "",
            featuredVideoUrl: creator.featured_video_url || "",
            priceMin: creator.price_min?.toString() || "",
            priceMax: creator.price_max?.toString() || "",
            selectedNiches,
            socials: socialsData
          });
        }
      } catch (err) {
        console.error("Error loading creator profile:", err);
      }
    };

    loadCreatorProfile();
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Upsert creator profile
      const { data: creator, error: creatorError } = await supabase
        .from("creators")
        .upsert({
          user_id: user.id,
          display_name: data.displayName,
          location: data.location,
          bio: data.bio,
          storefront_url: data.storefrontUrl,
          featured_video_url: data.featuredVideoUrl,
          price_min: data.priceMin ? parseInt(data.priceMin) : null,
          price_max: data.priceMax ? parseInt(data.priceMax) : null
        })
        .select()
        .single();

      if (creatorError) throw creatorError;

      // Handle niches
      if (creator) {
        // Delete existing niches
        await supabase
          .from("creator_niches")
          .delete()
          .eq("creator_id", creator.id);

        // Insert new niches
        if (data.selectedNiches.length > 0) {
          const { data: nicheData } = await supabase
            .from("niches")
            .select("id, name")
            .in("name", data.selectedNiches);

          if (nicheData) {
            const nicheInserts = nicheData.map(niche => ({
              creator_id: creator.id,
              niche_id: niche.id
            }));

            await supabase
              .from("creator_niches")
              .insert(nicheInserts);
          }
        }

        // Handle social links
        // Delete existing socials
        await supabase
          .from("creator_socials")
          .delete()
          .eq("creator_id", creator.id);

        // Insert new socials
        const socialInserts = Object.entries(data.socials)
          .filter(([_, url]) => url.trim())
          .map(([platform, url]) => ({
            creator_id: creator.id,
            platform,
            url: url.trim()
          }));

        if (socialInserts.length > 0) {
          await supabase
            .from("creator_socials")
            .insert(socialInserts);
        }
      }

      toast({
        title: "Profile saved!",
        description: isExistingCreator ? "Your creator profile has been updated." : "Welcome to PartnerConnections! Your creator profile is now live.",
      });

      navigate("/directory");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isExistingCreator ? "Update Your Profile" : "Create Your Creator Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isExistingCreator 
              ? "Keep your profile up to date to attract the best brand partnerships."
              : "Tell brands about yourself and showcase what makes you special."
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="City, State/Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Me *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell brands about yourself, your content style, and what makes you unique... (up to 1000 characters)"
                          className="min-h-[120px]"
                          maxLength={1000}
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground text-right">
                        {field.value?.length || 0}/1000 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Links & Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="storefrontUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amazon Storefront Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://amazon.com/shop/yourstore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuredVideoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Featured Content Examples
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Link to your best content examples" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Niche(s) / Product Categories *</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="selectedNiches"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-4">
                        {niches.map((niche) => (
                          <FormField
                            key={niche}
                            control={form.control}
                            name="selectedNiches"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={niche}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(niche)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, niche])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== niche
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {niche}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map((platform) => (
                  <FormField
                    key={platform.value}
                    control={form.control}
                    name={`socials.${platform.value}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <platform.icon className="h-4 w-4" />
                          {platform.name}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={platform.placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/directory")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : isExistingCreator ? "Update Profile" : "Create Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatorProfile;