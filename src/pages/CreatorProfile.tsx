import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Globe, ShoppingBag, Video, DollarSign, Instagram, Youtube, FileText, ExternalLink, AlertCircle, Check, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";

const socialPlatforms = [
  { name: "YouTube", value: "youtube", icon: Youtube, placeholder: "yourhandle" },
  { name: "Instagram", value: "instagram", icon: Instagram, placeholder: "yourhandle" },
  { name: "TikTok", value: "tiktok", icon: Video, placeholder: "yourhandle" },
  { name: "Facebook", value: "facebook", icon: ExternalLink, placeholder: "yourpage" },
  { name: "Pinterest", value: "pinterest", icon: ExternalLink, placeholder: "yourhandle" },
  { name: "X (Twitter)", value: "x", icon: ExternalLink, placeholder: "yourhandle" }
];

const niches = [
  "Beauty", "Fashion", "Fitness", "Food", "Home", "Outdoors", "Parenting", "Pets", "Tech", "Travel"
];

// Custom URL validation that's more flexible
const flexibleUrlSchema = z.string().optional().refine((val) => {
  if (!val || val.trim() === "") return true;
  
  // Basic URL pattern check - allow URLs with or without protocol
  const urlPattern = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/.*)?$/;
  const simplePattern = /^[\w\-]+(\.[\w\-]+)+/; // For basic domain.com format
  
  return urlPattern.test(val) || simplePattern.test(val);
}, "Please enter a valid website URL");

// Headshot file validation - flexible but with size limits
const headshotSchema = z.any().optional().refine((file) => {
  if (!file) return true;
  
  // Check if it's a file
  if (!(file instanceof File)) return true;
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) return false;
  
  // Check file type
  if (!file.type.startsWith('image/')) return false;
  
  return true;
}, "Please upload an image file under 10MB");

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(1, "Location is required"),
  bio: z.string().min(10, "About me must be at least 10 characters").max(1000, "About me must be 1000 characters or less"),
  storefrontUrl: flexibleUrlSchema,
  featuredVideoUrl: flexibleUrlSchema,
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  selectedNiches: z.array(z.string()).min(1, "Please select at least one niche"),
  socials: z.record(z.string().optional()),
  headshotFile: headshotSchema
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CreatorProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isExistingCreator, setIsExistingCreator] = useState(false);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

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
      socials: {},
      headshotFile: undefined
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
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
          setCreatorData(creator);
          
          // Populate form with existing data - extract handles from URLs
          const socialsData: Record<string, string> = {};
          creator.creator_socials?.forEach((social: any) => {
            // Extract handle from URL if possible, otherwise use the whole URL
            let handle = social.handle || social.url || "";
            if (!social.handle && social.url) {
              // Try to extract handle from URL
              const url = social.url;
              if (url.includes('youtube.com/@')) {
                handle = url.split('@')[1];
              } else if (url.includes('instagram.com/')) {
                handle = url.split('instagram.com/')[1]?.split('/')[0] || '';
              } else if (url.includes('tiktok.com/@')) {
                handle = url.split('@')[1];
              } else if (url.includes('facebook.com/')) {
                handle = url.split('facebook.com/')[1]?.split('/')[0] || '';
              } else if (url.includes('pinterest.com/')) {
                handle = url.split('pinterest.com/')[1]?.split('/')[0] || '';
              } else if (url.includes('x.com/')) {
                handle = url.split('x.com/')[1]?.split('/')[0] || '';
              } else {
                handle = url;
              }
            }
            socialsData[social.platform] = handle;
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

  // Auto-save to database every 30 seconds
  const autoSaveToDatabase = useCallback(async (formData: ProfileFormData) => {
    if (!user || !autoSaveEnabled) return;

    try {
      const updateData: any = {
        user_id: user.id,
        display_name: formData.displayName,
        location: formData.location,
        bio: formData.bio,
        storefront_url: formData.storefrontUrl,
        featured_video_url: formData.featuredVideoUrl,
        price_min: formData.priceMin ? parseInt(formData.priceMin) : null,
        price_max: formData.priceMax ? parseInt(formData.priceMax) : null
      };

      await supabase
        .from("creators")
        .upsert(updateData);

      console.log("Auto-saved profile data");
    } catch (error) {
      console.warn("Auto-save failed:", error);
    }
  }, [user, autoSaveEnabled]);

  // Auto-save effect
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!user || !autoSaveEnabled) return;
      
      // Only auto-save if we have minimum required fields
      if (data.displayName && data.location && data.bio && data.bio.length >= 10) {
        const timeoutId = setTimeout(() => {
          autoSaveToDatabase(data as ProfileFormData);
        }, 3000); // Save 3 seconds after user stops typing

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, autoSaveToDatabase, user, autoSaveEnabled]);

  const uploadHeadshot = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/headshot.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('creator-headshots')
      .upload(fileName, file, { 
        upsert: true 
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('creator-headshots')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      let headshotUrl = null;
      
      // Upload headshot if provided
      if (data.headshotFile) {
        headshotUrl = await uploadHeadshot(data.headshotFile, user.id);
      }

      // Upsert creator profile
      const updateData: any = {
        user_id: user.id,
        display_name: data.displayName,
        location: data.location,
        bio: data.bio,
        storefront_url: data.storefrontUrl,
        featured_video_url: data.featuredVideoUrl,
        price_min: data.priceMin ? parseInt(data.priceMin) : null,
        price_max: data.priceMax ? parseInt(data.priceMax) : null
      };

      if (headshotUrl) {
        updateData.headshot_url = headshotUrl;
      }

      const { data: creator, error: creatorError } = await supabase
        .from("creators")
        .upsert(updateData)
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

        // Convert handles to full URLs and insert new socials
        const socialInserts = Object.entries(data.socials)
          .filter(([_, handle]) => handle && handle.trim())
          .map(([platform, handle]) => {
            const cleanHandle = handle.trim();
            let fullUrl = cleanHandle;
            
            // Convert handle to full URL based on platform
            if (!cleanHandle.startsWith('http')) {
              switch (platform) {
                case 'youtube':
                  fullUrl = `https://youtube.com/@${cleanHandle}`;
                  break;
                case 'instagram':
                  fullUrl = `https://instagram.com/${cleanHandle}`;
                  break;
                case 'tiktok':
                  fullUrl = `https://tiktok.com/@${cleanHandle}`;
                  break;
                case 'facebook':
                  fullUrl = `https://facebook.com/${cleanHandle}`;
                  break;
                case 'pinterest':
                  fullUrl = `https://pinterest.com/${cleanHandle}`;
                  break;
                case 'x':
                  fullUrl = `https://x.com/${cleanHandle}`;
                  break;
                default:
                  fullUrl = cleanHandle;
              }
            }
            
            return {
              creator_id: creator.id,
              platform,
              url: fullUrl,
              handle: cleanHandle
            };
          });

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

      navigate("/creator-dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      console.log("Full error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!creatorData) return;

    // Check submission limit (max 5 attempts)
    if (creatorData.submission_count >= 5) {
      toast({
        title: "Submission Limit Reached",
        description: "You have reached the maximum number of submission attempts. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("creators")
        .update({
          approval_status: 'pending',
          submitted_at: new Date().toISOString(),
          submission_count: creatorData.submission_count + 1
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Reload creator data to get updated status
      const { data: updatedCreator } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setCreatorData(updatedCreator);

      toast({
        title: "Submitted for Review",
        description: "Your creator profile has been submitted for admin approval."
      });
    } catch (error) {
      console.error("Error submitting for approval:", error);
      toast({
        title: "Error",
        description: "Failed to submit for approval. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!creatorData) return null;

    const statusConfig = {
      draft: { variant: "secondary" as const, icon: AlertCircle, text: "Draft" },
      pending: { variant: "default" as const, icon: Clock, text: "Pending Review" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" }
    };

    const config = statusConfig[creatorData.approval_status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="mb-4">
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const shouldShowSubmitButton = () => {
    if (!creatorData) return false;
    return creatorData.approval_status === 'draft' || creatorData.approval_status === 'rejected';
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
          <div className="flex flex-col items-center gap-2">
            {getStatusBadge()}
            <h1 className="text-3xl font-bold mb-2">
              {isExistingCreator ? "Update Your Profile" : "Create Your Creator Profile"}
            </h1>
            <p className="text-muted-foreground">
              {isExistingCreator 
                ? "Keep your profile up to date to attract the best brand partnerships."
                : "Tell brands about yourself and showcase what makes you special."
              }
            </p>
            {autoSaveEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3 w-3" />
                Auto-save enabled - your changes are saved automatically
              </div>
            )}
          </div>
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
                        Location *
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
                   name="headshotFile"
                   render={({ field: { onChange, value, ...field } }) => (
                     <FormItem>
                       <FormLabel>Profile Photo</FormLabel>
                       <FormControl>
                         <Input
                           type="file"
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             onChange(file);
                           }}
                           {...field}
                         />
                       </FormControl>
                       <div className="text-sm text-muted-foreground">
                         Upload an image file (max 10MB). Supports JPG, PNG, GIF, etc.
                       </div>
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
                <CardTitle>Social Media Handles (Optional)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your handle/username only - we'll create the full links automatically
                </p>
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
                onClick={() => navigate("/creator-dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : isExistingCreator ? "Update Profile" : "Create Profile"}
              </Button>
            </div>
          </form>

          {/* Submit for Approval Button */}
          {shouldShowSubmitButton() && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Ready to go live?</h3>
                  <p className="text-muted-foreground text-sm">
                    Submit your profile for admin approval to appear in the directory.
                    {creatorData?.submission_count > 0 && (
                      <span className="block mt-1">
                        Submission attempts: {creatorData.submission_count}/5
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default CreatorProfile;