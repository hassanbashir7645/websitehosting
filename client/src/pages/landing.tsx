import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, ListTodo, Award, Boxes, BarChart3, Shield, Clock } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Comprehensive employee directory with role-based access control"
    },
    {
      icon: UserPlus,
      title: "Smart Onboarding",
      description: "Streamlined onboarding process with automated checklists"
    },
    {
      icon: ListTodo,
      title: "Task Management",
      description: "Efficient task assignment and tracking system"
    },
    {
      icon: Award,
      title: "Recognition System",
      description: "Employee recognition and achievement tracking"
    },
    {
      icon: Boxes,
      title: "Logistics Management",
      description: "Inventory and equipment management made simple"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive analytics and reporting dashboard"
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
              <h1 className="text-xl font-bold text-gray-900">Meeting Matters</h1>
              <p className="text-sm text-gray-600">HR Management System</p>
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
            Streamline Your HR Operations with
            <span className="text-primary"> Meeting Matters</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A comprehensive HR management system designed for modern organizations. 
            Manage employees, streamline onboarding, track tasks, and boost productivity 
            with role-based access control and real-time insights.
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
            Everything You Need for HR Management
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify your HR processes and enhance employee experience
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
              Built for Every Role in Your Organization
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for different user roles with appropriate access levels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { role: "HR Admin", description: "Complete system access and management", color: "bg-primary" },
              { role: "Branch Manager", description: "Department oversight and reporting", color: "bg-accent" },
              { role: "Team Lead", description: "Team management and task assignment", color: "bg-warning" },
              { role: "Employee", description: "Personal dashboard and task management", color: "bg-secondary" },
              { role: "Logistics Manager", description: "Inventory and equipment management", color: "bg-destructive" }
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
            Ready to Transform Your HR Operations?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join organizations that trust Meeting Matters for their HR management needs
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
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold">Meeting Matters</h4>
                <p className="text-sm text-gray-400">HR Management System</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Meeting Matters. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
