import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Handshake, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      title: "Sign Up & Set Your Profile",
      description: "Create your account and tell us about your brand or creator profile. Set your preferences and partnership goals.",
      icon: Users,
      details: [
        "Complete profile setup in under 5 minutes",
        "Upload brand assets or creator portfolio",
        "Set collaboration preferences",
        "Define your target audience and niches"
      ]
    },
    {
      step: "02", 
      title: "Browse & Filter Matches",
      description: "Use our advanced search and filtering system to find perfect partnership matches based on your criteria.",
      icon: Search,
      details: [
        "Filter by niche, audience size, and engagement",
        "View detailed analytics and performance metrics",
        "Save favorites and create shortlists",
        "Get AI-powered match recommendations"
      ]
    },
    {
      step: "03",
      title: "Connect & Collaborate",
      description: "Reach out to potential partners through our secure messaging system and negotiate partnership terms.",
      icon: Handshake,
      details: [
        "Send direct messages with partnership proposals",
        "Share collaboration briefs and requirements",
        "Negotiate terms and pricing securely",
        "Use built-in contract templates"
      ]
    },
    {
      step: "04",
      title: "Track & Optimize",
      description: "Monitor campaign performance, track ROI, and build long-term relationships with successful partners.",
      icon: TrendingUp,
      details: [
        "Real-time campaign performance tracking",
        "Detailed analytics and ROI reporting",
        "Rate and review partnership experiences",
        "Build a network of trusted partners"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge 
              variant="outline" 
              className="mb-6 bg-primary/5 text-primary border-primary/20 text-sm px-4 py-2"
            >
              ✨ Simple, Streamlined Process
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              How{" "}
              <span className="text-transparent bg-clip-text gradient-primary">
                PartnerConnections
              </span>{" "}
              Works
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              From discovery to campaign success, we've streamlined every step of the 
              creator partnership process to save you time and deliver better results.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="mb-20 last:mb-0">
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-glow">
                        {step.step}
                      </div>
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                    <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Placeholder Visual */}
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <Card className="h-80 bg-gradient-card border-none shadow-medium">
                      <CardContent className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <step.icon className="h-16 w-16 text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Step {step.step} Visualization
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proven Success Metrics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process delivers measurable results for both brands and creators
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { metric: "98%", label: "Success Rate", description: "Of partnerships result in ongoing collaborations" },
              { metric: "3.2x", label: "ROI Average", description: "Return on investment for brand partnerships" },
              { metric: "72hrs", label: "Response Time", description: "Average time to first partnership response" },
              { metric: "500+", label: "Active Creators", description: "Vetted creators across all major niches" }
            ].map((stat) => (
              <Card key={stat.label} className="text-center p-6 hover:shadow-medium transition-smooth">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.metric}</div>
                  <div className="font-semibold mb-2">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-6 w-6 text-primary" />
              <Star className="h-6 w-6 text-primary" />
              <Star className="h-6 w-6 text-primary" />
              <Star className="h-6 w-6 text-primary" />
              <Star className="h-6 w-6 text-primary" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of successful partnerships on PartnerConnections. 
              Set up your profile and start connecting today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/directory')}
              >
                Browse Creators
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;