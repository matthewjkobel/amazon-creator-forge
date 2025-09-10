import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const brandSchema = z.object({
  company_name: z.string().min(1, "Brand name is required").max(100, "Brand name must be 100 characters or less"),
  website_url: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  amazon_storefront_url: z.string().url("Please enter a valid Amazon storefront URL").optional().or(z.literal("")),
  about: z.string().max(1000, "About section must be 1000 characters or less").optional(),
  contact_name: z.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
  contact_email: z.string().email("Please enter a valid email address"),
});

type BrandFormData = z.infer<typeof brandSchema>;

const BrandProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      company_name: "",
      website_url: "",
      amazon_storefront_url: "",
      about: "",
      contact_name: "",
      contact_email: "",
    },
  });

  const aboutValue = watch("about");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load existing brand data if it exists
    const loadBrandData = async () => {
      const { data: brand, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (brand) {
        setIsEditing(true);
        setBrandData(brand);
        setValue("company_name", brand.company_name || "");
        setValue("website_url", brand.website_url || "");
        setValue("amazon_storefront_url", brand.amazon_storefront_url || "");
        setValue("about", brand.about || "");
        setValue("contact_name", brand.contact_name || "");
        setValue("contact_email", brand.contact_email || "");
      }
    };

    loadBrandData();
  }, [user, navigate, setValue]);

  const handleSubmitForApproval = async () => {
    if (!brandData) return;

    // Check submission limit (max 5 attempts)
    if (brandData.submission_count >= 5) {
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
        .from("brands")
        .update({
          approval_status: 'pending',
          submitted_at: new Date().toISOString(),
          submission_count: brandData.submission_count + 1
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Reload brand data to get updated status
      const { data: updatedBrand } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setBrandData(updatedBrand);

      toast({
        title: "Submitted for Review",
        description: "Your brand profile has been submitted for admin approval."
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
    if (!brandData) return null;

    const statusConfig = {
      draft: { variant: "secondary" as const, icon: AlertCircle, text: "Draft" },
      pending: { variant: "default" as const, icon: Clock, text: "Pending Review" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" }
    };

    const config = statusConfig[brandData.approval_status as keyof typeof statusConfig];
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
    if (!brandData) return false;
    return brandData.approval_status === 'draft' || brandData.approval_status === 'rejected';
  };

  const onSubmit = async (data: BrandFormData) => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // First ensure user exists in public.users table
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔐 Session before RPC ensure_user_row (BrandProfile):", {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        accessToken: sessionData.session?.access_token ? 'present' : 'missing'
      });
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: user.id,
        p_email: user.email || '',
        p_full_name: user.user_metadata?.full_name || '',
        p_role: 'brand'
      });

      if (userError) {
        console.error("❌ ensure_user_row error (BrandProfile):", {
          message: userError.message,
          name: userError.name,
          status: (userError as any).status,
          code: (userError as any).code,
          details: (userError as any).details,
          hint: (userError as any).hint,
        });
        setError("Failed to set up user profile. Please try again.");
        return;
      }

      // Create or update brand profile
      const { error } = await supabase
        .from("brands")
        .upsert({
          user_id: user.id,
          company_name: data.company_name,
          website_url: data.website_url || null,
          amazon_storefront_url: data.amazon_storefront_url || null,
          about: data.about || null,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
        });

      if (error) {
        setError("Failed to save brand profile. Please try again.");
        return;
      }

      toast({
        title: isEditing ? "Profile Updated!" : "Welcome to PartnerConnections!",
        description: isEditing 
          ? "Your brand profile has been updated successfully."
          : "Your brand profile has been created successfully.",
      });

      navigate("/brand-dashboard");
    } catch (err) {
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
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? "Edit Brand Profile" : "Create Your Brand Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Update your brand information to help creators find and connect with you."
              : "Tell creators about your brand and make it easy for them to reach out for partnerships."
            }
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
            <div className="flex items-center justify-between">
              <CardTitle>Brand Information</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    {...register("contact_name")}
                    placeholder="Your name"
                  />
                  {errors.contact_name && (
                    <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    {...register("contact_email")}
                    placeholder="partnerships@yourbrand.com"
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                  )}
                </div>
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
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Profile" : "Create Profile")
                  }
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
                      {brandData?.submission_count > 0 && (
                        <span className="block mt-1">
                          Submission attempts: {brandData.submission_count}/5
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandProfile;