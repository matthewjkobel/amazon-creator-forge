import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Check, 
  ArrowRight,
  Star,
  Zap,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free Preview",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring our creator directory",
      icon: Users,
      variant: "outline" as const,
      popular: false,
      features: [
        "Browse limited creator profiles",
        "View basic creator information",
        "Access to platform overview",
        "Email support"
      ],
      limitations: [
        "Limited profile details",
        "No direct messaging",
        "No advanced filters",
        "No contact information"
      ]
    },
    {
      name: "Brand Membership",
      price: "$299",
      period: "per year",
      description: "Full access for serious brand partnerships",
      icon: Zap,
      variant: "hero" as const,
      popular: true,
      features: [
        "Full creator directory access",
        "Direct messaging with creators",
        "Advanced search & filtering",
        "Creator contact information",
        "Partnership tracking tools",
        "Campaign analytics",
        "Collaboration templates",
        "Priority support"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For agencies and large brands with custom needs",
      icon: Crown,
      variant: "premium" as const,
      popular: false,
      features: [
        "Everything in Brand Membership",
        "Multi-user team access",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "Advanced reporting & analytics",
        "Custom contract templates",
        "24/7 phone support"
      ],
      limitations: []
    }
  ];

  const creatorBenefits = [
    "Free profile creation and management",
    "Get discovered by premium brands",
    "Direct partnership opportunities",
    "No subscription fees - ever",
    "Keep 100% of your earnings",
    "Professional portfolio showcase"
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
              💰 Transparent Pricing
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Simple,{" "}
              <span className="text-transparent bg-clip-text gradient-primary">
                Transparent
              </span>{" "}
              Pricing
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Choose the plan that works for your business. Upgrade or downgrade at any time. 
              Creators join for free, brands invest in quality partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${
                  plan.popular 
                    ? 'border-primary shadow-strong scale-105 z-10' 
                    : 'hover:shadow-medium'
                } transition-smooth`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {plan.price}
                      {plan.price !== "Custom" && (
                        <span className="text-base font-normal text-muted-foreground">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant={plan.variant}
                    onClick={() => {
                      if (plan.name === "Enterprise") {
                        window.open('mailto:enterprise@partnerconnections.com', '_blank');
                      } else {
                        navigate('/auth');
                      }
                    }}
                  >
                    {plan.name === "Free Preview" ? "Start Free" : 
                     plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                For Creators: Always Free
              </h2>
              <p className="text-xl text-muted-foreground">
                We believe creators should never pay to find opportunities. 
                Join our platform completely free and start earning.
              </p>
            </div>
            
            <Card className="bg-gradient-card border-none shadow-medium">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-coral" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Creator Membership</h3>
                        <p className="text-muted-foreground">Free Forever</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {creatorBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-6xl font-bold text-coral mb-4">FREE</div>
                    <p className="text-muted-foreground mb-6">
                      No hidden fees, no commissions on your earnings. 
                      Just opportunities to grow your business.
                    </p>
                    <Button 
                      variant="coral" 
                      size="lg"
                      onClick={() => navigate('/auth')}
                    >
                      Join as Creator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-8">
              We're here to help you find the perfect plan for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.open('mailto:support@partnerconnections.com', '_blank')}
              >
                Contact Support
              </Button>
              <Button 
                variant="hero"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;