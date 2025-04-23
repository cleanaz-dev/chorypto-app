import { AlertCircle } from "lucide-react";
import { Clock } from "lucide-react";
import { XCircle } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { RiEthFill } from "react-icons/ri";
import { SiLitecoin, SiTether } from "react-icons/si";

export const COINS = [
  {
    name: "Bitcoin",
    tag: "BTC",
    icon: <FaBitcoin />,
  },
  {
    name: "Ethereum",
    tag: "ETH",
    icon: <FaEthereum />, 
  },
  {
    name: "Litecoin",
    tag: "LTC",
    icon: <SiLitecoin />,
  },
  {
    name: "Tether",
    tag: "USDT",
    icon: <SiTether />,
  },
];

// Dyanmic color for chore status
export const choreStatusColor = {
  Active: "text-emerald-500",
  Overdue: "text-red-500",
  Completed: "text-gray-600",
  Late: "text-yellow-500",
  Missed: "text-orange-500",
};

export const choreDecorationColor = {
  Active: "decoration-emerald-500",
  Overdue: "decoration-red-500",
  Completed: "decoration-gray-600",
  Late: "decoration-yellow-500",
  Missed: "decoration-orange-500",
};

export const statusIcons = {
  Completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  Pending: <Clock className="h-5 w-5 text-yellow-500" />,
  Failed: <XCircle className="h-5 w-5 text-red-500" />,
  Processing: <AlertCircle className="h-5 w-5 text-blue-500" />,
  // Default icon for unknown statuses
  default: <Clock className="h-5 w-5 text-gray-500" />
}

export const statusVariants = {
  Completed: 'bg-green-100/10 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Processing: 'bg-blue-100 text-blue-700',
  // Default variant for unknown statuses
  default: 'bg-gray-100 text-gray-700'
}
