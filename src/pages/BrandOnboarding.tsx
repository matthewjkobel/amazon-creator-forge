import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, AlertCircle, Camera, Upload } from "lucide-react";
import ImageZoomEditor from "@/components/ImageZoomEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";

const niches = [
  "Beauty", "Fashion", "Fitness", "Food", "Home", "Outdoors", "Parenting", "Pets", "Tech", "Travel", "Other"
];

// Custom URL validation that's more flexible
const flexibleUrlSchema = z.string().optional().refine((val) => {
  if (!val || val.trim() === "") return true;
  
  // Basic URL pattern check - allow URLs with or without protocol
  const urlPattern = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/.*)?$/;
  const simplePattern = /^[\w\-]+(\.[\w\-]+)+/; // For basic domain.com format
  
  return urlPattern.test(val) || simplePattern.test(val);
}, "Please enter a valid website URL");

// Logo file validation - flexible but with size limits
const logoSchema = z.any().optional().refine((file) => {
  if (!file) return true;
  
  // Check if it's a file
  if (!(file instanceof File)) return true;
  
  // Check file size (max 15MB)
  if (file.size > 15 * 1024 * 1024) return false;
  
  // Check file type
  if (!file.type.startsWith('image/')) return false;
  
  return true;
}, "Please upload an image file under 15MB");

const brandOnboardingSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  website: flexibleUrlSchema,
  amazonStorefront: flexibleUrlSchema,
  about: z.string().min(10, "About must be at least 10 characters").max(1000, "About must be 1000 characters or less"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  selectedNiches: z.array(z.string()).min(1, "Please select at least one category"),
  customNiche: z.string().optional(),
  logoFile: logoSchema
}).refine((data) => {
  // If "Other" is selected, customNiche must be provided
  if (data.selectedNiches.includes("Other")) {
    return data.customNiche && data.customNiche.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify your custom category",
  path: ["customNiche"]
});

type BrandOnboardingFormData = z.infer<typeof brandOnboardingSchema>;

const BrandOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isExistingBrand, setIsExistingBrand] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageEditState, setImageEditState] = useState<{ zoom: number; position: { x: number; y: number } }>({ zoom: 1, position: { x: 0, y: 0 } });

  const form = useForm<BrandOnboardingFormData>({
    resolver: zodResolver(brandOnboardingSchema),
    defaultValues: {
      brandName: "",
      website: "",
      amazonStorefront: "",
      about: "",
      contactName: "",
      selectedNiches: [],
      customNiche: "",
      logoFile: undefined
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  // Load existing brand profile if exists
  useEffect(() => {
    const loadBrandProfile = async () => {
      if (!user) return;

      try {
        // Check if brand profile exists
        const { data: brand, error } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (brand && !error) {
          setIsExistingBrand(true);
          setBrandData(brand);
          
          // Populate form with existing data
          form.reset({
            brandName: brand.company_name || "",
            website: brand.website_url || "",
            amazonStorefront: brand.amazon_storefront_url || "",
            about: brand.about || "",
            contactName: brand.contact_name || "",
            selectedNiches: [], // We'll need to load niches separately if we implement brand_niches table
            customNiche: "",
            logoFile: undefined
          });

          // Set existing logo preview if available
          if (brand.logo_url) {
            setLogoPreview(brand.logo_url);
          }
        }
      } catch (err) {
        console.error("Error loading brand profile:", err);
      }
    };

    loadBrandProfile();
  }, [user, form]);

  // Auto-save to database
  const autoSaveToDatabase = useCallback(async (formData: BrandOnboardingFormData) => {
    if (!user || !autoSaveEnabled) return;

    try {
      // First ensure user exists in public.users table
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: user.id,
        p_email: user.email || '',
        p_full_name: user.user_metadata?.full_name || '',
        p_role: 'brand'
      });

      if (userError) {
        console.warn("Auto-save user setup failed:", userError);
        return;
      }

      // Auto-save brand profile
      const updateData: any = {
        user_id: user.id,
        company_name: formData.brandName,
        website_url: formData.website || null,
        amazon_storefront_url: formData.amazonStorefront || null,
        about: formData.about,
        contact_name: formData.contactName,
        contact_email: user.email // Use user's email as contact email
      };

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();

      if (brandError) {
        console.warn("Auto-save brand failed:", brandError);
        return;
      }

      console.log("Auto-saved brand profile data");
    } catch (error) {
      console.warn("Auto-save failed:", error);
    }
  }, [user, autoSaveEnabled]);

  // Auto-save effect
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!user || !autoSaveEnabled) return;
      
      // Only auto-save if we have minimum required fields
      if (data.brandName && data.about && data.about.length >= 10 && data.contactName) {
        const timeoutId = setTimeout(() => {
          autoSaveToDatabase(data as BrandOnboardingFormData);
        }, 3000); // Save 3 seconds after user stops typing

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, autoSaveToDatabase, user, autoSaveEnabled]);
  const uploadLogo = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/logo.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('creator-headshots') // Reusing the same bucket for brand logos
      .upload(fileName, file, { 
        upsert: true 
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('creator-headshots')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      setSelectedImageFile(file);
      form.setValue("logoFile", file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], originalImageFile?.name || 'logo.jpg', {
      type: croppedBlob.type,
    });
    
    setSelectedImageFile(file);
    form.setValue("logoFile", file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedBlob);
    setShowImageEditor(false);
  };

  const handleNicheToggle = (niche: string) => {
    const currentNiches = form.getValues("selectedNiches");
    const updatedNiches = currentNiches.includes(niche)
      ? currentNiches.filter(n => n !== niche)
      : [...currentNiches, niche];
    
    form.setValue("selectedNiches", updatedNiches);
  };

  const onSubmit = async (data: BrandOnboardingFormData) => {
    if (!user) {
      console.error("No authenticated user found");
      toast({
        title: "Authentication Error",
        description: "Please log in to save your profile.",
        variant: "destructive"
      });
      return;
    }

    console.log("Starting brand profile save for user:", user.id);
    console.log("Form data:", data);

    // Temporarily disable auto-save during submission
    setAutoSaveEnabled(false);
    setLoading(true);
    try {
      // First ensure user exists in public.users table
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: user.id,
        p_email: user.email || '',
        p_full_name: user.user_metadata?.full_name || '',
        p_role: 'brand'
      });

      if (userError) throw userError;

      let logoUrl = null;
      
      // Upload logo if provided
      if (data.logoFile) {
        console.log("Uploading logo file:", data.logoFile.name);
        logoUrl = await uploadLogo(data.logoFile, user.id);
        console.log("Logo uploaded successfully:", logoUrl);
      }

      // Handle niches - if "Other" is selected, create custom niche
      let allNiches = [...data.selectedNiches];
      
      if (data.selectedNiches.includes("Other") && data.customNiche?.trim()) {
        // Create custom niche if it doesn't exist
        const { data: existingNiche } = await supabase
          .from("niches")
          .select("id, name")
          .eq("name", data.customNiche.trim())
          .maybeSingle();
          
        if (!existingNiche) {
          await supabase
            .from("niches")
            .insert({ name: data.customNiche.trim() });
        }
        
        // Replace "Other" with the custom niche name
        allNiches = allNiches.filter(n => n !== "Other").concat(data.customNiche.trim());
      }

      // Create or update brand profile
      const brandData: any = {
        user_id: user.id,
        company_name: data.brandName,
        website_url: data.website || null,
        amazon_storefront_url: data.amazonStorefront || null,
        about: data.about,
        contact_name: data.contactName,
        contact_email: user.email // Use user's email as contact email
      };

      if (logoUrl) {
        brandData.logo_url = logoUrl;
      }

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .upsert(brandData, { onConflict: 'user_id' })
        .select()
        .single();

      if (brandError) throw brandError;

      // Save selected niches (we'll create a brand_niches table similar to creator_niches)
      // For now, let's store in the about field or create the table if needed
      
      console.log("Brand profile saved successfully");

      toast({
        title: isExistingBrand ? "Profile Updated!" : "Welcome to PartnerConnections!",
        description: isExistingBrand 
          ? "Your brand profile has been updated successfully."
          : "Your brand profile has been created successfully.",
      });

      navigate("/brand-dashboard");
    } catch (error) {
      console.error("Error creating brand profile:", error);
      toast({
        title: "Error",
        description: "Failed to create brand profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setAutoSaveEnabled(true); // Re-enable auto-save
    }
  };

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            PartnerConnections
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isExistingBrand ? "Edit Brand Profile" : "Create Your Brand Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isExistingBrand 
              ? "Update your brand information to help creators find and connect with you."
              : "Tell creators about your brand and make it easy for them to reach out for partnerships."
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  {...form.register("brandName")}
                  placeholder="Enter your brand name"
                />
                {form.formState.errors.brandName && (
                  <p className="text-sm text-destructive">{form.formState.errors.brandName?.message}</p>
                )}
              </div>

              {/* Brand Logo */}
              <div className="space-y-4">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    {logoPreview ? (
                      <AvatarImage src={logoPreview} alt="Brand logo" />
                    ) : (
                      <AvatarFallback>
                        <Building2 className="h-8 w-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </Label>
                    
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageEditor(true)}
                        className="self-start"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                {form.formState.errors.logoFile && (
                  <p className="text-sm text-destructive">{String(form.formState.errors.logoFile.message)}</p>
                )}
              </div>

              {/* Category / Niche */}
              <div className="space-y-4">
                <Label>Category / Niche *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {niches.map((niche) => (
                    <div key={niche} className="flex items-center space-x-2">
                      <Checkbox
                        id={niche}
                        checked={form.watch("selectedNiches").includes(niche)}
                        onCheckedChange={() => handleNicheToggle(niche)}
                      />
                      <Label htmlFor={niche} className="text-sm font-normal cursor-pointer">
                        {niche}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {form.watch("selectedNiches").includes("Other") && (
                  <div className="space-y-2">
                    <Label htmlFor="customNiche">Custom Category</Label>
                    <Input
                      id="customNiche"
                      {...form.register("customNiche")}
                      placeholder="Enter your custom category"
                    />
                    {form.formState.errors.customNiche && (
                      <p className="text-sm text-destructive">{form.formState.errors.customNiche?.message}</p>
                    )}
                  </div>
                )}
                
                {form.formState.errors.selectedNiches && (
                  <p className="text-sm text-destructive">{form.formState.errors.selectedNiches?.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://yourbrand.com"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">{form.formState.errors.website?.message}</p>
                )}
              </div>

              {/* Amazon Storefront */}
              <div className="space-y-2">
                <Label htmlFor="amazonStorefront">Amazon Storefront</Label>
                <Input
                  id="amazonStorefront"
                  {...form.register("amazonStorefront")}
                  placeholder="https://amazon.com/stores/your-brand"
                />
                {form.formState.errors.amazonStorefront && (
                  <p className="text-sm text-destructive">{form.formState.errors.amazonStorefront?.message}</p>
                )}
              </div>

              {/* About the brand */}
              <div className="space-y-2">
                <Label htmlFor="about">About the Brand *</Label>
                <Textarea
                  id="about"
                  {...form.register("about")}
                  placeholder="Tell creators about your brand, values, and what you're looking for in partnerships..."
                  rows={5}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Share your brand story and partnership goals</span>
                  <span>{form.watch("about")?.length || 0}/1000</span>
                </div>
                {form.formState.errors.about && (
                  <p className="text-sm text-destructive">{form.formState.errors.about?.message}</p>
                )}
              </div>

              {/* Brand Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="contactName">Brand Contact Name *</Label>
                <Input
                  id="contactName"
                  {...form.register("contactName")}
                  placeholder="Your name"
                />
                {form.formState.errors.contactName && (
                  <p className="text-sm text-destructive">{form.formState.errors.contactName?.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="sm:w-auto"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1"
                >
                  {loading 
                    ? (isExistingBrand ? "Updating..." : "Creating...") 
                    : (isExistingBrand ? "Update Profile" : "Create Profile")
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && originalImageFile && (
        <ImageZoomEditor
          imageFile={originalImageFile}
          onSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
          initialZoom={imageEditState.zoom}
          initialPosition={imageEditState.position}
        />
      )}
    </div>
  );
};

export default BrandOnboarding;