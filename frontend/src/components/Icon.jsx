import {
  Ticket,
  UserRound,
  Phone,
  BookOpen,
  FileText,
  UsersRound,
  Shield,
  Folder,
  ChartNoAxesColumn,
  CreditCard,
  Mail,
  Link as LinkIcon,
  CalendarDays,
  MapPin,
  Database,
  ShoppingCart,
  Star,
  Wrench,
  Newspaper
} from "lucide-react";

const ICONS = {
  ticket: Ticket,
  user: UserRound,
  phone: Phone,
  book: BookOpen,
  doc: FileText,
  meeting: UsersRound,
  shield: Shield,
  folder: Folder,
  chart: ChartNoAxesColumn,
  card: CreditCard,
  mail: Mail,
  link: LinkIcon,
  calendar: CalendarDays,
  pin: MapPin,
  database: Database,
  "shopping-cart": ShoppingCart,
  star: Star,
  wrench: Wrench,
  newspaper: Newspaper,
};

export default function Icon({
  name,
  size = 22,
  className = "",
}) {
  const IconComponent = ICONS[name] || LinkIcon;

  return (
    <IconComponent
      className={`icon ${className}`}
      size={size}
      strokeWidth={1.6}
      aria-hidden="true"
    />
  );
}
