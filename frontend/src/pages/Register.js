import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import ElasticButton, { ElasticIconButton } from '../components/ElasticButton';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    shopDomain: '',
    accessToken: '',
    appId: '',
    appSecret: '',
    webhookSecret: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.shopDomain) {
      newErrors.shopDomain = 'Shop domain is required';
    } else if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(formData.shopDomain)) {
      newErrors.shopDomain = 'Invalid shop domain format (e.g., mystore.myshopify.com)';
    }
    
    if (!formData.accessToken) {
      newErrors.accessToken = 'Access token is required';
    } else if (!formData.accessToken.startsWith('shpat_')) {
      newErrors.accessToken = 'Invalid access token format (should start with shpat_)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to SplitSet!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Registration failed');
        setErrors({ general: result.error });
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <React.Fragment key={index}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            index + 1 <= currentStep 
              ? 'bg-shopify-600 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {index + 1 <= currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${
              index + 1 < currentStep ? 'bg-shopify-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Layers className="w-12 h-12 text-shopify-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your SplitSet account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the SplitSet platform for intelligent product splitting
          </p>
        </div>

        <StepIndicator currentStep={step} totalSteps={2} />

        <form className="mt-8 space-y-6" onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <ElasticButton
                type="button"
                onClick={handleNextStep}
                className="w-full"
                variant="primary"
                size="lg"
              >
                Next: Shopify Store Setup
              </ElasticButton>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      You'll need to create a Custom App in your Shopify admin first. 
                      <a href="#" className="underline font-medium"> View setup guide</a>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700">
                  Shop Domain
                </label>
                <input
                  id="shopDomain"
                  name="shopDomain"
                  type="text"
                  required
                  value={formData.shopDomain}
                  onChange={handleChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.shopDomain ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                  placeholder="mystore.myshopify.com"
                />
                {errors.shopDomain && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopDomain}</p>
                )}
              </div>

              <div>
                <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                  Admin API Access Token
                </label>
                <input
                  id="accessToken"
                  name="accessToken"
                  type="password"
                  required
                  value={formData.accessToken}
                  onChange={handleChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.accessToken ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm`}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                />
                {errors.accessToken && (
                  <p className="mt-1 text-sm text-red-600">{errors.accessToken}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  From your Shopify Admin → Settings → Apps → Develop apps → Create app
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <details className="border border-gray-200 rounded-md p-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Advanced Settings (Optional)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label htmlFor="appId" className="block text-sm font-medium text-gray-700">
                        App ID (Optional)
                      </label>
                      <input
                        id="appId"
                        name="appId"
                        type="text"
                        value={formData.appId}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm"
                        placeholder="123456789"
                      />
                    </div>

                    <div>
                      <label htmlFor="appSecret" className="block text-sm font-medium text-gray-700">
                        App Secret (Optional)
                      </label>
                      <input
                        id="appSecret"
                        name="appSecret"
                        type="password"
                        value={formData.appSecret}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm"
                        placeholder="Your app secret"
                      />
                    </div>

                    <div>
                      <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
                        Webhook Secret (Optional)
                      </label>
                      <input
                        id="webhookSecret"
                        name="webhookSecret"
                        type="password"
                        value={formData.webhookSecret}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-shopify-500 focus:border-shopify-500 sm:text-sm"
                        placeholder="Your webhook secret"
                      />
                    </div>
                  </div>
                </details>
              </div>

              <div className="flex space-x-3">
                <ElasticButton
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1"
                  variant="secondary"
                  size="lg"
                >
                  Back
                </ElasticButton>
                
                <ElasticButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="flex-1"
                  variant="primary"
                  size="lg"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </ElasticButton>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-shopify-600 hover:text-shopify-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
