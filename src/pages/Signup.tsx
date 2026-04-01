import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
    EnvelopeIcon, 
    LockClosedIcon, 
    UserIcon, 
    PhoneIcon,
    BuildingStorefrontIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

const signUpSchema = yup.object({
    name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().required('Email is required').email('Invalid email format'),
    phone: yup.string().required('Phone number is required'),
    password: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    businessName: yup.string().required('Business name is required'),
    address: yup.string().required('Address is required'),
}).required();

type SignUpFormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    address: string;
    
};

// type SignUpFormData = yup.InferType<typeof signUpSchema>;

export const SignUp: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: yupResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            businessName: '',
            address: '',
        }
    });

    const onSubmit = async (data: SignUpFormData) => {
        setLoading(true);
        try {
            const result = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                businessName: data.businessName,
                
            });
            
            if (result.success) {
                showToast('Business account created successfully! Please log in.', 'success');
                navigate('/login');
            } else {
                showToast(result.error || 'Registration failed', 'error');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-600 mb-2">Start Your Business</h1>
                    <p className="text-secondary-600">Create your business account and start selling</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            icon={<UserIcon className="w-5 h-5" />}
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            icon={<EnvelopeIcon className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Phone Number"
                            placeholder="+1 234 567 8900"
                            icon={<PhoneIcon className="w-5 h-5" />}
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        
                        <Input
                            label="Business Name"
                            placeholder="My Store"
                            icon={<BuildingStorefrontIcon className="w-5 h-5" />}
                            error={errors.businessName?.message}
                            {...register('businessName')}
                        />
                    </div>

                    <Input
                        label="Business Address (Optional)"
                        placeholder="123 Main St, City, Country"
                        icon={<MapPinIcon className="w-5 h-5" />}
                        {...register('address')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a strong password"
                            icon={<LockClosedIcon className="w-5 h-5" />}
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            icon={<LockClosedIcon className="w-5 h-5" />}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />
                    </div>

                    <div className="bg-secondary-50 p-4 rounded-lg">
                        <p className="text-sm text-secondary-600">
                            <strong>14-day free trial</strong> on Pro plan included. No credit card required.
                            You'll be the administrator of your business.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        loading={loading}
                        className="mt-6"
                    >
                        Create Business Account
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-secondary-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};