import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Shield, 
  Star, 
  TrendingUp, 
  Handshake,
  CheckCircle,
  ArrowRight,
  Play,
  Award
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Home = () => {
  const navigate = useNavigate();

  const trustBadges = [
    { name: "500+ Creators", icon: Users },
    { name: "98% Success Rate", icon: TrendingUp },
    { name: "Vetted Partners", icon: Shield },
    { name: "24/7 Support", icon: Star },
  ];

  const creatorBenefits = [
    "Get discovered by premium brands",
    "Secure higher-paying partnerships", 
    "Access exclusive collaboration tools",
    "Build your professional portfolio"
  ];

  const brandBenefits = [
    "Access vetted creator database",
    "Advanced filtering & search",
    "Streamlined collaboration tools",
    "Performance tracking & analytics"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              variant="outline" 
              className="mb-6 bg-primary/5 text-primary border-primary/20 text-sm px-4 py-2"
            >
              🚀 Connecting Brands with Amazon-Focused Creators
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              The Premier{" "}
              <span className="text-transparent bg-clip-text gradient-primary">
                Creator Partnership
              </span>{" "}
              Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Connect with vetted Amazon-focused creators and build authentic partnerships 
              that drive real results for your ecommerce brand.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="hero" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Join as Brand
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {trustBadges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center gap-2">
                  <badge.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Propositions */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Both Sides of the Partnership
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a brand looking for creators or a creator seeking partnerships, 
              we've got you covered.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Brands */}
            <Card className="group hover:shadow-strong transition-smooth">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">For Brands</h3>
                  <p className="text-muted-foreground">
                    Find the perfect creators for your Amazon products
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {brandBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant="hero"
                  onClick={() => navigate('/directory')}
                >
                  Start Finding Creators
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* For Creators */}
            <Card className="group hover:shadow-strong transition-smooth">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-coral" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">For Creators</h3>
                  <p className="text-muted-foreground">
                    Get discovered by premium ecommerce brands
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {creatorBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant="coral"
                  onClick={() => navigate('/auth')}
                >
                  Apply as Creator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, streamlined process to connect brands with creators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Browse & Filter",
                description: "Use our advanced filters to find creators that match your brand's niche and requirements.",
                icon: Search
              },
              {
                step: "02", 
                title: "Connect & Collaborate",
                description: "Reach out to creators directly through our platform and discuss partnership opportunities.",
                icon: Handshake
              },
              {
                step: "03",
                title: "Track & Optimize",
                description: "Monitor campaign performance and build long-term relationships with top-performing creators.",
                icon: TrendingUp
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Better Partnerships?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of brands and creators who trust PartnerConnections 
              for their collaboration needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/directory')}
              >
                Browse Creator Directory
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/how-it-works')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">PartnerConnections</span>
            </div>
            <p className="text-muted-foreground mb-6">
              The premier platform for ecommerce creator partnerships.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-smooth">Privacy</a>
              <a href="#" className="hover:text-primary transition-smooth">Terms</a>
              <a href="#" className="hover:text-primary transition-smooth">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;