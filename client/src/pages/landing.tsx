import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BarChart3, Users, FileText, Award, Shield, Clock, Target } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "Psychometric Assessments",
      description: "Comprehensive personality, cognitive, and emotional intelligence testing"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed scoring, trait analysis, and comprehensive reporting"
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Track test attempts, manage candidates, and review results"
    },
    {
      icon: Award,
      title: "Professional Reports",
      description: "Generate detailed PDF reports with insights and recommendations"
    },
    {
      icon: FileText,
      title: "Multiple Test Types",
      description: "Personality, cognitive aptitude, emotional intelligence, and integrity tests"
    },
    {
      icon: Target,
      title: "Hiring Insights",
      description: "Data-driven hiring recommendations and candidate evaluation"
    },
    {
      icon: Shield,
      title: "Role-Based Security",
      description: "Advanced security with granular permission controls"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Live notifications and real-time data synchronization"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PsychoTest Pro</h1>
              <p className="text-sm text-gray-600">Psychometric Testing Platform</p>
            </div>
          </div>
          <Button onClick={() => window.location.href = '/api/login'} className="btn-primary">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Advanced Psychometric Testing for
            <span className="text-primary"> Better Hiring Decisions</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A comprehensive psychometric testing platform designed for modern recruitment. 
            Assess personality traits, cognitive abilities, emotional intelligence, and integrity 
            with scientifically validated tests and detailed analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button variant="outline" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Psychometric Assessment
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to enhance your recruitment process with data-driven insights
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Modern Recruitment Teams
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for HR professionals, recruiters, and hiring managers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { role: "HR Administrator", description: "Complete platform management and analytics", color: "bg-primary" },
              { role: "Recruiter", description: "Candidate assessment and result review", color: "bg-accent" },
              { role: "Hiring Manager", description: "Team-specific hiring insights", color: "bg-warning" },
              { role: "Test Candidate", description: "Seamless test-taking experience", color: "bg-secondary" },
              { role: "System Admin", description: "Platform configuration and maintenance", color: "bg-destructive" }
            ].map((role, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Shield className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-lg">{role.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Hiring Process?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join organizations that trust PsychoTest Pro for data-driven hiring decisions
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'} 
            className="btn-primary text-lg px-8 py-3"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold">PsychoTest Pro</h4>
                <p className="text-sm text-gray-400">Psychometric Testing Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 PsychoTest Pro. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
