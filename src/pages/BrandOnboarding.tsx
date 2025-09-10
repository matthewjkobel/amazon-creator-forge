import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const brandOnboardingSchema = z.object({
  company_name: z.string().min(1, "Brand name is required").max(100, "Brand name must be 100 characters or less"),
  website_url: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  amazon_storefront_url: z.string().url("Please enter a valid Amazon storefront URL").optional().or(z.literal("")),
  about: z.string().max(1000, "About section must be 1000 characters or less").optional(),
  contact_name: z.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
});

type BrandOnboardingData = z.infer<typeof brandOnboardingSchema>;

const BrandOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BrandOnboardingData>({
    resolver: zodResolver(brandOnboardingSchema),
    defaultValues: {
      company_name: "",
      website_url: "",
      amazon_storefront_url: "",
      about: "",
      contact_name: user?.user_metadata?.full_name || "",
    },
  });

  const aboutValue = watch("about");

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}-logo.${fileExt}`;
    const filePath = `brand-logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('creator-headshots') // Using existing bucket
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Logo upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('creator-headshots')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: BrandOnboardingData) => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Upload logo if provided
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
        if (!logoUrl) {
          setError("Failed to upload logo. Please try again.");
          return;
        }
      }

      // Log session state prior to brand insert
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔐 Session before brand insert (BrandOnboarding):", {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        accessToken: sessionData.session?.access_token ? 'present' : 'missing'
      });

      // Create brand profile
      const { error } = await supabase
        .from("brands")
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          website_url: data.website_url || null,
          amazon_storefront_url: data.amazon_storefront_url || null,
          about: data.about || null,
          contact_name: data.contact_name,
          contact_email: user.email || '',
          logo_url: logoUrl,
          approval_status: 'draft'
        });

      if (error) {
        console.error("❌ Brand creation error:", {
          message: error.message,
          name: (error as any).name,
          status: (error as any).status,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
        });
        setError("Failed to create brand profile. Please try again.");
        return;
      }

      toast({
        title: "Welcome to PartnerConnections!",
        description: "Your brand profile has been created successfully.",
      });

      navigate("/brand-dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            PartnerConnections
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome! Set Up Your Brand</h1>
          <p className="text-muted-foreground">
            Let's create your brand profile so creators can discover and connect with you.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Brand Logo */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Brand Name *</Label>
                <Input
                  id="company_name"
                  {...register("company_name")}
                  placeholder="Enter your brand/company name"
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  {...register("website_url")}
                  placeholder="https://yourbrand.com"
                />
                {errors.website_url && (
                  <p className="text-sm text-destructive">{errors.website_url.message}</p>
                )}
              </div>

              {/* Amazon Storefront */}
              <div className="space-y-2">
                <Label htmlFor="amazon_storefront_url">Amazon Storefront</Label>
                <Input
                  id="amazon_storefront_url"
                  type="url"
                  {...register("amazon_storefront_url")}
                  placeholder="https://amazon.com/stores/your-brand"
                />
                {errors.amazon_storefront_url && (
                  <p className="text-sm text-destructive">{errors.amazon_storefront_url.message}</p>
                )}
              </div>

              {/* About */}
              <div className="space-y-2">
                <Label htmlFor="about">About Your Brand</Label>
                <Textarea
                  id="about"
                  {...register("about")}
                  placeholder="Tell creators about your brand, values, and what you're looking for in partnerships..."
                  rows={5}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Share your brand story and partnership goals</span>
                  <span>{aboutValue?.length || 0}/1000</span>
                </div>
                {errors.about && (
                  <p className="text-sm text-destructive">{errors.about.message}</p>
                )}
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="contact_name">Brand Contact Name *</Label>
                <Input
                  id="contact_name"
                  {...register("contact_name")}
                  placeholder="Your name"
                />
                {errors.contact_name && (
                  <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/role-selection")}
                  className="sm:w-auto"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1"
                >
                  {loading ? "Creating Your Profile..." : "Create Brand Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandOnboarding;