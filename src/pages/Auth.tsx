import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, EyeOff, Upload, User, Camera } from 'lucide-react';
import avatar1 from '@/assets/avatars/avatar-1.png';
import avatar2 from '@/assets/avatars/avatar-2.png';
import avatar3 from '@/assets/avatars/avatar-3.png';
import avatar4 from '@/assets/avatars/avatar-4.png';
import avatar5 from '@/assets/avatars/avatar-5.png';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Countries data
const countries = [
  { code: 'AF', name: 'Afghanistan', phone: '+93', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', phone: '+355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', phone: '+213', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', phone: '+376', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', phone: '+244', flag: '🇦🇴' },
  { code: 'AR', name: 'Argentina', phone: '+54', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', phone: '+374', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', phone: '+61', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', phone: '+43', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', phone: '+994', flag: '🇦🇿' },
  { code: 'BH', name: 'Bahrain', phone: '+973', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', phone: '+880', flag: '🇧🇩' },
  { code: 'BY', name: 'Belarus', phone: '+375', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', phone: '+32', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', phone: '+501', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', phone: '+229', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', phone: '+975', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', phone: '+591', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', phone: '+387', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', phone: '+267', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', phone: '+55', flag: '🇧🇷' },
  { code: 'BG', name: 'Bulgaria', phone: '+359', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', phone: '+226', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', phone: '+257', flag: '🇧🇮' },
  { code: 'CV', name: 'Cape Verde', phone: '+238', flag: '🇨🇻' },
  { code: 'KH', name: 'Cambodia', phone: '+855', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', phone: '+237', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', phone: '+1', flag: '🇨🇦' },
  { code: 'CF', name: 'Central African Republic', phone: '+236', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', phone: '+235', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', phone: '+56', flag: '🇨🇱' },
  { code: 'CN', name: 'China', phone: '+86', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', phone: '+57', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', phone: '+269', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', phone: '+242', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', phone: '+506', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', phone: '+385', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', phone: '+53', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', phone: '+357', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', phone: '+420', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', phone: '+45', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', phone: '+253', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', phone: '+1', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', phone: '+1', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', phone: '+593', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', phone: '+20', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', phone: '+503', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', phone: '+240', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', phone: '+291', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', phone: '+372', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', phone: '+268', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', phone: '+251', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', phone: '+679', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', phone: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'France', phone: '+33', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', phone: '+241', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', phone: '+220', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', phone: '+995', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', phone: '+49', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', phone: '+233', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', phone: '+30', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', phone: '+1', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', phone: '+502', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', phone: '+224', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', phone: '+245', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', phone: '+592', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', phone: '+509', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', phone: '+504', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', phone: '+36', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', phone: '+354', flag: '🇮🇸' },
  { code: 'IN', name: 'India', phone: '+91', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', phone: '+62', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', phone: '+98', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', phone: '+964', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', phone: '+353', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', phone: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', phone: '+39', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', phone: '+1', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', phone: '+81', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', phone: '+962', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', phone: '+7', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', phone: '+254', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', phone: '+686', flag: '🇰🇮' },
  { code: 'KP', name: 'North Korea', phone: '+850', flag: '🇰🇵' },
  { code: 'KR', name: 'South Korea', phone: '+82', flag: '🇰🇷' },
  { code: 'KW', name: 'Kuwait', phone: '+965', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', phone: '+996', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', phone: '+856', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', phone: '+371', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', phone: '+961', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', phone: '+266', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', phone: '+231', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', phone: '+218', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', phone: '+423', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', phone: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', phone: '+352', flag: '🇱🇺' },
  { code: 'MG', name: 'Madagascar', phone: '+261', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', phone: '+265', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', phone: '+60', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', phone: '+960', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', phone: '+223', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', phone: '+356', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', phone: '+692', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', phone: '+222', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', phone: '+230', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', phone: '+52', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', phone: '+691', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', phone: '+373', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', phone: '+377', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', phone: '+976', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', phone: '+382', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', phone: '+212', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', phone: '+258', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', phone: '+95', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', phone: '+264', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', phone: '+674', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', phone: '+977', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', phone: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', phone: '+64', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', phone: '+505', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', phone: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', phone: '+234', flag: '🇳🇬' },
  { code: 'MK', name: 'North Macedonia', phone: '+389', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', phone: '+47', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', phone: '+968', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', phone: '+92', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', phone: '+680', flag: '🇵🇼' },
  { code: 'PA', name: 'Panama', phone: '+507', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', phone: '+675', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', phone: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', phone: '+51', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', phone: '+63', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', phone: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', phone: '+351', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', phone: '+974', flag: '🇶🇦' },
  { code: 'RO', name: 'Romania', phone: '+40', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', phone: '+7', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', phone: '+250', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint Kitts and Nevis', phone: '+1', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', phone: '+1', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', phone: '+1', flag: '🇻🇨' },
  { code: 'WS', name: 'Samoa', phone: '+685', flag: '🇼🇸' },
  { code: 'SM', name: 'San Marino', phone: '+378', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', phone: '+239', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', phone: '+966', flag: '🇸🇦' },
  { code: 'SN', name: 'Senegal', phone: '+221', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', phone: '+381', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', phone: '+248', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', phone: '+232', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', phone: '+65', flag: '🇸🇬' },
  { code: 'SK', name: 'Slovakia', phone: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', phone: '+386', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', phone: '+677', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', phone: '+252', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', phone: '+27', flag: '🇿🇦' },
  { code: 'SS', name: 'South Sudan', phone: '+211', flag: '🇸🇸' },
  { code: 'ES', name: 'Spain', phone: '+34', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', phone: '+94', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', phone: '+249', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', phone: '+597', flag: '🇸🇷' },
  { code: 'SE', name: 'Sweden', phone: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', phone: '+41', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', phone: '+963', flag: '🇸🇾' },
  { code: 'TJ', name: 'Tajikistan', phone: '+992', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', phone: '+255', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', phone: '+66', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', phone: '+670', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', phone: '+228', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', phone: '+676', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', phone: '+1', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', phone: '+216', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', phone: '+90', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', phone: '+993', flag: '🇹🇲' },
  { code: 'TV', name: 'Tuvalu', phone: '+688', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', phone: '+256', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', phone: '+380', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', phone: '+971', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', phone: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', phone: '+1', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', phone: '+598', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', phone: '+998', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', phone: '+678', flag: '🇻🇺' },
  { code: 'VA', name: 'Vatican City', phone: '+379', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', phone: '+58', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', phone: '+84', flag: '🇻🇳' },
  { code: 'YE', name: 'Yemen', phone: '+967', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', phone: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', phone: '+263', flag: '🇿🇼' },
];

// Animated avatars
const animatedAvatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harley',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kimberly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Madison',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Penny'
];

// Days array for birth date dropdown
const days = Array.from({ length: 31 }, (_, i) => i + 1);

// Months array for birth date dropdown
const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Years array for birth date dropdown (from current year - 100 to current year - 18)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

// Cleanup function for auth state
const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    nationality: '',
    countryCode: '+359',
    phone: '',
    gender: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    avatarUrl: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Must contain at least one number');
    return errors;
  };

  // Age validation
  const validateAge = (day: string, month: string, year: string): boolean => {
    if (!day || !month || !year) return false;
    
    const today = new Date();
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Password validation
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        setError('Password requirements not met:\n' + passwordErrors.join('\n'));
        return;
      }

      // Password confirmation check
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Age validation
      if (!validateAge(formData.birthDay, formData.birthMonth, formData.birthYear)) {
        setError('You must be at least 18 years old to register');
        return;
      }

      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      const fullPhone = `${formData.countryCode}${formData.phone}`;

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            username: formData.username,
            nationality: formData.nationality,
            phone: fullPhone,
            gender: formData.gender,
            birth_date: birthDate,
            avatar_url: formData.avatarUrl || null
          }
        }
      });

      if (error) {
        // Better error message for existing email
        if (error.message.includes('User already registered')) {
          setError('A user with this email already exists. Please try signing in.');
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Registration successful!",
            description: "Welcome to the platform!",
          });
          window.location.href = '/';
        } else {
          toast({
            title: "Registration successful!",
            description: "Please check your email for confirmation.",
          });
        }
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter an email address');
      return;
    }

    setIsResettingPassword(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Recovery email sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      console.error('Error during password reset:', error);
      setError(error.message || 'An error occurred while sending the email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Sign in successful!",
          description: "Welcome back!",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Error during signin:', error);
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData({...formData, avatarUrl});
    setShowAvatarSelection(false);
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

    } catch (error: any) {
      console.error(`Error during ${provider} auth:`, error);
      setError(error.message || `An error occurred during ${provider} authentication`);
    } finally {
      setSocialLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          size="sm"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full" onValueChange={() => setError(null)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address *</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="mt-4 text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm"
                      onClick={handlePasswordReset}
                      disabled={isResettingPassword || !formData.email}
                    >
                      {isResettingPassword ? 'Sending...' : 'Forgot password?'}
                    </Button>
                    {resetEmailSent && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Recovery email sent!
                      </p>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                {/* Social Auth Buttons */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Quick Sign Up
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('google')}
                      disabled={socialLoading !== ''}
                      className="w-full"
                    >
                      {socialLoading === 'google' ? (
                        'Connecting...'
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('apple')}
                      disabled={socialLoading !== ''}
                      className="w-full"
                    >
                      {socialLoading === 'apple' ? (
                        'Connecting...'
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                          Continue with Apple
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or complete manually
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name *</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                       required
                       title="Please fill out this field"
                     />
                   </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                       required
                       title="Please fill out this field"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="signup-email">Email Address *</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="name@example.com"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       required
                       title="Please fill out this field"
                     />
                   </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-nationality">Nationality *</Label>
                    <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select value={formData.countryCode} onValueChange={(value) => setFormData({...formData, countryCode: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.phone}>
                              {country.flag} {country.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="888 123 456"
                        value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         required
                         title="Please fill out this field"
                         className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <div className="flex gap-2">
                      <Select value={formData.birthDay} onValueChange={(value) => setFormData({...formData, birthDay: value})} required>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {days.map((day) => (
                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={formData.birthMonth} onValueChange={(value) => setFormData({...formData, birthMonth: value})} required>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={formData.birthYear} onValueChange={(value) => setFormData({...formData, birthYear: value})} required>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">You must be at least 18 years old</p>
                  </div>

                  {/* Avatar Selection */}
                  <div className="space-y-2">
                    <Label>Avatar (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.avatarUrl} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Presets
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      capture="user"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setFormData({...formData, avatarUrl: url});
                        }
                      }}
                    />
                    
                    {showAvatarSelection && (
                      <div className="grid grid-cols-5 gap-2 p-4 border rounded-lg">
                        {animatedAvatars.map((avatar, index) => (
                          <Avatar 
                            key={index}
                            className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary"
                            onClick={() => handleAvatarSelect(avatar)}
                          >
                            <AvatarImage src={avatar} />
                            <AvatarFallback>{index + 1}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters, numbers, uppercase and lowercase"
                        value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         required
                         title="Please fill out this field"
                         minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                         onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                         required
                         title="Please fill out this field"
                       />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    * Required fields
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}