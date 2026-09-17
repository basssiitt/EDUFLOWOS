'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface FormData {
  schoolName: string;
  slug: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    slug: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from school name
    if (field === 'schoolName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.ownerFirstName.trim()) {
      newErrors.ownerFirstName = 'First name is required';
    }
    if (!formData.ownerLastName.trim()) {
      newErrors.ownerLastName = 'Last name is required';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">EduFlow</h1>
          <p className="text-muted-foreground mt-2">Register Your School</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s < step ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="font-medium">{s}</span>
                )}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  s < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'School Information'}
              {step === 2 && 'Admin Account'}
              {step === 3 && 'Registration Complete!'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter your school details to get started'}
              {step === 2 && 'Create your admin account'}
              {step === 3 && 'Your school has been registered successfully'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: School Info */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="School Name"
                  placeholder="e.g., Springfield Academy"
                  value={formData.schoolName}
                  onChange={(e) => updateFormData('schoolName', e.target.value)}
                  error={errors.schoolName}
                />

                <Input
                  label="School URL (Slug)"
                  placeholder="e.g., springfield-academy"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  error={errors.slug}
                  helperText="This will be your school's unique URL: eduflow.com/portal/{slug}"
                />

                <Input
                  label="Address (Optional)"
                  placeholder="School address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />

                <div className="flex justify-end">
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.ownerFirstName}
                    onChange={(e) => updateFormData('ownerFirstName', e.target.value)}
                    error={errors.ownerFirstName}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.ownerLastName}
                    onChange={(e) => updateFormData('ownerLastName', e.target.value)}
                    error={errors.ownerLastName}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@school.com"
                  value={formData.ownerEmail}
                  onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                  error={errors.ownerEmail}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  error={errors.phone}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} isLoading={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Register School'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">Welcome to EduFlow!</h3>
                <p className="text-muted-foreground mb-6">
                  Your school <strong>{formData.schoolName}</strong> has been registered successfully.
                </p>

                <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                  <p className="font-medium mb-2">Your School Details:</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>School URL:</strong> eduflow.com/portal/{formData.slug}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Admin Email:</strong> {formData.ownerEmail}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You can now log in and start setting up your school:
                  </p>
                  <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Add academic year and classes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Import students via CSV
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Add teachers and staff
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Set up fee structures
                    </li>
                  </ul>
                </div>

                <Button className="mt-6" onClick={() => router.push('/login')}>
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Link */}
        {step < 3 && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
