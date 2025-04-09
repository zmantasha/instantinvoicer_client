"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, FileText, Share2, Zap, X, Eye, EyeOff } from "lucide-react";
import BlogSection from "@/components/BlogSection";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      // Fetch user profile to check role
      axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setIsLoggedIn(true);
        setIsAdmin(response.data.user?.roles?.includes('admin'));
      })
      .catch(() => {
        // If token is invalid, clear it
        Cookies.remove('accessToken');
        setIsLoggedIn(false);
        setIsAdmin(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      // Redirect based on role
      const redirectPath = isAdmin ? '/admin' : '/user/myinvoice';
      router.push(redirectPath);
    } else if (authChecked) {
      // Only show auth modal if we've confirmed the user isn't logged in
      setShowAuthModal(true);
    }
  };

  const handleGoogleAuth = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_SERVER}/auth/google`,
      "_self"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate confirm password for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/v1/user/login' : '/api/v1/user/registration';
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data && response.data.token) {
        // Store token in cookie instead of localStorage
        Cookies.set('accessToken', response.data.token, {
          expires: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour
          path: '/',
          secure: true,
          sameSite: 'None'
        });

        // Check if user is admin and redirect accordingly
        const isAdmin = response.data.user?.roles?.includes('admin');
        const redirectPath = isAdmin ? '/admin' : '/user/myinvoice';
        router.push(redirectPath);
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Authentication failed');
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen">
      {/* Auth Modal */}
      {showAuthModal && !isLoggedIn && authChecked && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md relative"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0c69cc] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0c69cc] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0c69cc] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0c69cc] focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0c69cc] focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0c69cc] text-white py-3 rounded-lg font-semibold hover:bg-[#0c69cc]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="text-[#0c69cc] hover:underline"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <button
                onClick={handleGoogleAuth}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0c69cc] text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <span className="text-sm font-medium">✨ New Feature</span>
                <span className="ml-2 text-sm">Excel to Invoice in one click</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Create Professional Invoices in{" "}
                <span className="text-yellow-300">Seconds</span>
              </h1>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Generate, customize, and share beautiful invoices instantly. Perfect for freelancers and businesses of all sizes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <button
                    onClick={handleGetStarted}
                    className="relative z-10 bg-white text-[#0c69cc] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    {isLoggedIn ? (isAdmin ? 'Go to Dashboard' : 'Go to Invoices') : 'Get Started Free'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <button
                    onClick={scrollToFeatures}
                    className="relative z-10 bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    Learn More
                  </button>
                </motion.div>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/67.jpg",
                    "https://randomuser.me/api/portraits/women/68.jpg"
                  ].map((src, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c69cc] bg-white overflow-hidden">
                      <Image
                        src={src}
                        alt={`User ${i + 1}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">1000+</span> businesses trust us
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/invoice-preview.png"
                  alt="Invoice Preview"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c69cc]/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-gray-800">Live Preview</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create Perfect Invoices
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines simplicity with powerful features to help you create professional invoices effortlessly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-[#0c69cc]/10 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Create Invoices in 3 Simple Steps
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and create your first professional invoice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#0c69cc] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0c69cc] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Your First Invoice?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses already using our platform.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <button
                onClick={handleGetStarted}
                className="relative z-10 bg-white text-[#0c69cc] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                {isLoggedIn ? (isAdmin ? 'Go to Dashboard' : 'Go to Invoices') : 'Start Creating Invoices'}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />
    </main>
  );
}

const features = [
  {
    title: "Instant Creation",
    description: "Generate professional invoices in seconds with our intuitive interface.",
    icon: <Zap className="w-6 h-6 text-[#0c69cc]" />,
  },
  {
    title: "Customizable Templates",
    description: "Choose from multiple templates and customize them to match your brand.",
    icon: <FileText className="w-6 h-6 text-[#0c69cc]" />,
  },
  {
    title: "Real-time Updates",
    description: "See live updates when clients view or pay your invoices.",
    icon: <Clock className="w-6 h-6 text-[#0c69cc]" />,
  },
  {
    title: "Easy Sharing",
    description: "Share invoices via email, WhatsApp, or generate a shareable link.",
    icon: <Share2 className="w-6 h-6 text-[#0c69cc]" />,
  },
  {
    title: "Payment Tracking",
    description: "Track payment status and automatically update invoice watermarks.",
    icon: <CheckCircle2 className="w-6 h-6 text-[#0c69cc]" />,
  },
  {
    title: "Excel Integration",
    description: "Paste data directly from Excel and let our system handle the formatting.",
    icon: <FileText className="w-6 h-6 text-[#0c69cc]" />,
  },
];

const steps = [
  {
    title: "Sign Up",
    description: "Create your account in less than a minute.",
  },
  {
    title: "Customize",
    description: "Add your business details and customize your invoice template.",
  },
  {
    title: "Create & Share",
    description: "Generate your invoice and share it with clients instantly.",
  },
];
