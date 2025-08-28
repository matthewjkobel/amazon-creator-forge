import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Building2, 
  Star, 
  TrendingUp, 
  Shield, 
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const brandSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company_name: z.string().min(2, "Company name is required"),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional()
});

const creatorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  display_name: z.string().min(2, "Display name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().optional()
});

type BrandFormData = z.infer<typeof brandSchema>;
type CreatorFormData = z.infer<typeof creatorSchema>;

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_creators: 0,
    total_brands: 0,
    active_inquiries: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"brand" | "creator">("brand");

  const brandForm = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      email: "",
      password: "",
      company_name: "",
      website_url: "",
      notes: ""
    }
  });

  const creatorForm = useForm<CreatorFormData>({
    resolver: zodResolver(creatorSchema),
    defaultValues: {
      email: "",
      password: "",
      display_name: "",
      bio: "",
      location: ""
    }
  });

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) return;

      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || userData?.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
        await loadDashboardData();
      } catch (err) {
        console.error("Error checking admin access:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkAdminAccess();
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast]);

  const loadDashboardData = async () => {
    try {
      // Load users
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      // Load creators with user info
      const { data: creatorsData } = await supabase
        .from("creators")
        .select(`
          *,
          users (email, full_name, role),
          creator_niches (
            niches (name)
          )
        `)
        .order("created_at", { ascending: false });

      // Load brands with user info
      const { data: brandsData } = await supabase
        .from("brands")
        .select(`
          *,
          users (email, full_name, role)
        `)
        .order("created_at", { ascending: false });

      // Load inquiries count
      const { count: inquiriesCount } = await supabase
        .from("inquiries")
        .select("*", { count: "exact", head: true });

      setUsers(usersData || []);
      setCreators(creatorsData || []);
      setBrands(brandsData || []);
      setStats({
        total_users: usersData?.length || 0,
        total_creators: creatorsData?.length || 0,
        total_brands: brandsData?.length || 0,
        active_inquiries: inquiriesCount || 0
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    }
  };

  const handleCreateBrand = async (data: BrandFormData) => {
    try {
      setLoading(true);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.company_name
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user record
        const { error: userError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.company_name,
            role: "brand"
          });

        if (userError) throw userError;

        // Create brand record
        const { error: brandError } = await supabase
          .from("brands")
          .insert({
            user_id: authData.user.id,
            company_name: data.company_name,
            website_url: data.website_url || null,
            notes: data.notes || null
          });

        if (brandError) throw brandError;

        toast({
          title: "Brand created successfully",
          description: `${data.company_name} has been added to the platform.`
        });

        brandForm.reset();
        setCreateDialogOpen(false);
        await loadDashboardData();
      }
    } catch (error: any) {
      console.error("Error creating brand:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create brand account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCreator = async (data: CreatorFormData) => {
    try {
      setLoading(true);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.display_name
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user record
        const { error: userError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.display_name,
            role: "creator"
          });

        if (userError) throw userError;

        // Create creator record
        const { error: creatorError } = await supabase
          .from("creators")
          .insert({
            user_id: authData.user.id,
            display_name: data.display_name,
            bio: data.bio,
            location: data.location || null
          });

        if (creatorError) throw creatorError;

        toast({
          title: "Creator created successfully",
          description: `${data.display_name} has been added to the platform.`
        });

        creatorForm.reset();
        setCreateDialogOpen(false);
        await loadDashboardData();
      }
    } catch (error: any) {
      console.error("Error creating creator:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create creator account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCreators = creators.filter(creator =>
    creator.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(brand =>
    brand.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage users, creators, and brands on the platform
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
              </DialogHeader>
              
              <Tabs value={createType} onValueChange={(value) => setCreateType(value as "brand" | "creator")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="brand">Brand</TabsTrigger>
                  <TabsTrigger value="creator">Creator</TabsTrigger>
                </TabsList>

                <TabsContent value="brand" className="space-y-4">
                  <Form {...brandForm}>
                    <form onSubmit={brandForm.handleSubmit(handleCreateBrand)} className="space-y-4">
                      <FormField
                        control={brandForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandForm.control}
                        name="company_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandForm.control}
                        name="website_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional information..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Brand Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="creator" className="space-y-4">
                  <Form {...creatorForm}>
                    <form onSubmit={creatorForm.handleSubmit(handleCreateCreator)} className="space-y-4">
                      <FormField
                        control={creatorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={creatorForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={creatorForm.control}
                        name="display_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={creatorForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Tell us about this creator..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={creatorForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City, State/Country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Creator Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creators</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_creators}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_brands}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_inquiries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Welcome to the admin dashboard. Here you can manage all users, view platform statistics, and onboard new brands and creators.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.full_name || user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New users this month</span>
                        <span className="font-semibold">{stats.total_users}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active creators</span>
                        <span className="font-semibold">{stats.total_creators}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Partner brands</span>
                        <span className="font-semibold">{stats.total_brands}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total inquiries</span>
                        <span className="font-semibold">{stats.active_inquiries}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.full_name || 'No name'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="creators">
              <Card>
                <CardHeader>
                  <CardTitle>Creators ({filteredCreators.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Creator</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Niches</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCreators.map((creator) => (
                        <TableRow key={creator.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback>
                                  {creator.display_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{creator.display_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{creator.users?.email}</TableCell>
                          <TableCell>{creator.location || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {creator.creator_niches?.slice(0, 2).map((niche: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {niche.niches.name}
                                </Badge>
                              ))}
                              {creator.creator_niches?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{creator.creator_niches.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={creator.visibility === 'public' ? 'default' : 'secondary'}>
                              {creator.visibility}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brands">
              <Card>
                <CardHeader>
                  <CardTitle>Brands ({filteredBrands.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBrands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={brand.logo_url} />
                                <AvatarFallback>
                                  {brand.company_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{brand.company_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{brand.users?.email}</TableCell>
                          <TableCell>
                            {brand.website_url ? (
                              <a 
                                href={brand.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {brand.website_url}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(brand.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;