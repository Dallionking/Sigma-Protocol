import React from 'react';
import { Platform } from 'react-native';
import {
  Home,
  DollarSign,
  Bot,
  User,
  Bell,
  Lock,
  Settings,
  Gift,
  Star,
  Info,
  Shield,
  MessageCircle,
  BarChart3,
  Zap,
  Target,
  Search,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash2,
  Plus,
  Clock,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Trophy,
  Mail,
  TrendingUp,
  TrendingDown,
  Rocket,
  Scale,
  Sparkles,
  PartyPopper,
  HelpCircle,
  FileText,
  Users,
  Wallet,
  Send,
  Download,
  Upload,
  Eye,
  EyeOff,
  X,
  Menu,
  MoreVertical,
  ExternalLink,
  Copy,
  Share2,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Link,
  Bookmark,
  Flag,
  Award,
  Crown,
  Gem,
  Coins,
  PiggyBank,
  Banknote,
  CircleDollarSign,
  Activity,
  BarChart2,
  PieChart,
  LineChart,
  Gauge,
  Timer,
  Hourglass,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Laptop,
  Server,
  Database,
  Cloud,
  Key,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Lock as LockIcon,
  Unlock,
  LogOut,
  LogIn,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/lib/theme';

/**
 * Icon name mapping - maps semantic names to Lucide icons
 * This replaces all emoji icons throughout the app
 */
const ICONS = {
  // Navigation / Tab Bar
  home: Home,
  income: DollarSign,
  ai: Bot,
  account: User,
  
  // Common Actions
  settings: Settings,
  search: Search,
  check: Check,
  checkCircle: CheckCircle,
  plus: Plus,
  close: X,
  menu: Menu,
  more: MoreVertical,
  back: ChevronLeft,
  forward: ChevronRight,
  externalLink: ExternalLink,
  copy: Copy,
  share: Share2,
  
  // Account Menu Items
  user: User,
  profile: User,
  lock: Lock,
  security: Lock,
  bell: Bell,
  notifications: Bell,
  bellRing: BellRing,
  bellOff: BellOff,
  message: MessageCircle,
  support: MessageCircle,
  gift: Gift,
  referral: Gift,
  star: Star,
  bonuses: Star,
  info: Info,
  about: Info,
  help: HelpCircle,
  
  // Risk / Trading
  shield: Shield,
  shieldCheck: ShieldCheck,
  shieldAlert: ShieldAlert,
  shieldOff: ShieldOff,
  scale: Scale,
  balanced: Scale,
  rocket: Rocket,
  aggressive: Rocket,
  
  // Charts / Analytics
  chart: BarChart3,
  barChart: BarChart3,
  barChart2: BarChart2,
  pieChart: PieChart,
  lineChart: LineChart,
  analytics: BarChart3,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  activity: Activity,
  gauge: Gauge,
  
  // Finance / Money
  dollar: DollarSign,
  wallet: Wallet,
  creditCard: CreditCard,
  coins: Coins,
  piggyBank: PiggyBank,
  banknote: Banknote,
  circleDollar: CircleDollarSign,
  
  // Time
  clock: Clock,
  timer: Timer,
  hourglass: Hourglass,
  calendar: Calendar,
  
  // Feedback / Status
  warning: AlertTriangle,
  alert: AlertTriangle,
  error: AlertTriangle,
  lightbulb: Lightbulb,
  tip: Lightbulb,
  idea: Lightbulb,
  sparkles: Sparkles,
  party: PartyPopper,
  celebration: PartyPopper,
  zap: Zap,
  bolt: Zap,
  target: Target,
  
  // Actions
  refresh: RefreshCw,
  sync: RefreshCw,
  send: Send,
  download: Download,
  upload: Upload,
  
  // Favorites / Social
  heart: Heart,
  favorite: Heart,
  trophy: Trophy,
  award: Award,
  crown: Crown,
  gem: Gem,
  bookmark: Bookmark,
  flag: Flag,
  
  // Delete / Destructive
  trash: Trash2,
  delete: Trash2,
  
  // Documents / Legal
  document: FileText,
  legal: FileText,
  terms: FileText,
  privacy: FileText,
  
  // Users
  users: Users,
  team: Users,
  userPlus: UserPlus,
  userMinus: UserMinus,
  userCheck: UserCheck,
  userX: UserX,
  
  // Communication
  mail: Mail,
  email: Mail,
  phone: Phone,
  globe: Globe,
  link: Link,
  location: MapPin,
  
  // Visibility
  eye: Eye,
  eyeOff: EyeOff,
  
  // Audio
  volume: Volume2,
  mute: VolumeX,
  
  // Connectivity
  wifi: Wifi,
  wifiOff: WifiOff,
  
  // Devices
  smartphone: Smartphone,
  monitor: Monitor,
  laptop: Laptop,
  server: Server,
  database: Database,
  cloud: Cloud,
  
  // Auth / Security
  key: Key,
  fingerprint: Fingerprint,
  unlock: Unlock,
  logout: LogOut,
  login: LogIn,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  /** The name of the icon to render */
  name: IconName;
  /** Size of the icon (default: 24) */
  size?: number;
  /** Color of the icon. Can be a color string or 'primary' | 'muted' | 'white' | 'error' | 'warning' */
  color?: string | 'primary' | 'muted' | 'white' | 'error' | 'warning' | 'success';
  /** Whether the icon is in a focused/active state (uses primary color) */
  focused?: boolean;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
  /** Additional style props */
  style?: object;
}

/**
 * Resolve color prop to actual color value
 */
function resolveColor(color: IconProps['color'], focused?: boolean): string {
  if (focused) {
    return colors.primary.DEFAULT;
  }
  
  if (!color) {
    return colors.neutral[600];
  }
  
  switch (color) {
    case 'primary':
      return colors.primary.DEFAULT;
    case 'muted':
      return colors.neutral[500];
    case 'white':
      return colors.neutral[900];
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'success':
      return colors.success;
    default:
      return color;
  }
}

/**
 * Premium Icon component using Lucide React Native
 * Replaces all emoji icons throughout the app with consistent, scalable vector icons
 * 
 * @example
 * // Basic usage
 * <Icon name="home" />
 * 
 * // With size and color
 * <Icon name="bell" size={28} color="primary" />
 * 
 * // Focused state (for tab bar, etc.)
 * <Icon name="account" focused={isFocused} />
 */
export function Icon({ 
  name, 
  size = 24, 
  color, 
  focused = false,
  strokeWidth = 2,
  style,
}: IconProps) {
  const IconComponent = ICONS[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ICONS map`);
    return null;
  }
  
  const iconColor = resolveColor(color, focused);
  
  return (
    <IconComponent 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}

/**
 * Get the Lucide icon component directly for advanced use cases
 */
export function getIconComponent(name: IconName): LucideIcon | undefined {
  return ICONS[name];
}

/**
 * Check if an icon name is valid
 */
export function isValidIconName(name: string): name is IconName {
  return name in ICONS;
}

// Export all icon names for autocomplete
export const iconNames = Object.keys(ICONS) as IconName[];

