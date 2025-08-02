import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, User, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import avatar1 from '@/assets/avatars/avatar-1.png';
import avatar2 from '@/assets/avatars/avatar-2.png';
import avatar3 from '@/assets/avatars/avatar-3.png';
import avatar4 from '@/assets/avatars/avatar-4.png';
import avatar5 from '@/assets/avatars/avatar-5.png';
import UserCompetitions from '@/components/UserCompetitions';

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
];

// Days, months, years for date picker
const days = Array.from({ length: 31 }, (_, i) => i + 1);
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
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    nationality: '',
    phone: '',
    gender: '',
    birth_date: '',
    avatar_url: ''
  });

  // Split birth_date for form
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setProfileData(data);
        
        // Split birth_date if exists
        if (data.birth_date) {
          const date = new Date(data.birth_date);
          setBirthDay(date.getDate().toString().padStart(2, '0'));
          setBirthMonth((date.getMonth() + 1).toString().padStart(2, '0'));
          setBirthYear(date.getFullYear().toString());
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct birth_date from separate fields
      let birth_date = null;
      if (birthDay && birthMonth && birthYear) {
        birth_date = `${birthYear}-${birthMonth}-${birthDay}`;
      }

      const updateData = {
        ...profileData,
        birth_date
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Navigate back to previous page
      navigate(-1);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarSelection(false);
  };

  const handleRemoveAvatar = () => {
    setProfileData(prev => ({ ...prev, avatar_url: '' }));
    setShowAvatarSelection(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2 bg-background hover:bg-accent hover:text-accent-foreground border-border"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Avatar Selection */}
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profileData.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {profileData.full_name ? 
                            profileData.full_name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2) :
                            user.email?.charAt(0).toUpperCase() || 'U'
                          }
                        </AvatarFallback>
                      </Avatar>
                       <div className="flex flex-col gap-2 sm:flex-row">
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                           className="gap-2"
                         >
                           <Camera className="h-4 w-4" />
                           Change Avatar
                         </Button>
                         {profileData.avatar_url && (
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={handleRemoveAvatar}
                             className="whitespace-nowrap"
                           >
                             Remove
                           </Button>
                         )}
                       </div>
                    </div>

                    {/* Avatar Selection Grid */}
                    {showAvatarSelection && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <div className="grid grid-cols-5 gap-3">
                          {animatedAvatars.map((avatar, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar)}
                              className="relative group"
                            >
                              <Avatar className="w-16 h-16 transition-transform group-hover:scale-110 ring-2 ring-transparent group-hover:ring-primary">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>A{index + 1}</AvatarFallback>
                              </Avatar>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      readOnly
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select 
                      value={profileData.nationality} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, nationality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your nationality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profileData.gender} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label>Birth Date</Label>
                    <div className="flex gap-2">
                      <Select value={birthDay} onValueChange={setBirthDay}>
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
                      <Select value={birthMonth} onValueChange={setBirthMonth}>
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
                      <Select value={birthYear} onValueChange={setBirthYear}>
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
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6">
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}