"use client";

import { CardModern } from "@/components/ui/card-modern";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LucideIcon, AlertCircle, DollarSign, Coins, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  variant?: "default" | "warning" | "success" | "info";
  index?: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  variant = "default",
  index = 0 
}: StatCardProps) {
  const variants = {
    default: "border-white/20",
    warning: "border-red-500/20 bg-red-500/5",
    success: "border-green-500/20 bg-green-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <CardModern 
      variant="glass" 
      className={`p-4 sm:p-6 ${variants[variant]} animate-scale-in`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
        </div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
        {value}
      </p>
    </CardModern>
  );
}

interface StatsGridProps {
  economyData: {
    deuda: number;
    divisas: {
      usd: number;
      btc: number;
    };
    lastCobro: string | null;
    sat: boolean;
    empresarial: boolean;
  };
}

export function StatsGrid({ economyData }: StatsGridProps) {
  const stats = [];
  let index = 0;

  // Deuda
  if (economyData.deuda > 0) {
    stats.push(
      <StatCard
        key="deuda"
        title="Deuda Pendiente"
        value={formatCurrency(economyData.deuda)}
        icon={AlertCircle}
        iconColor="text-red-400"
        iconBg="bg-red-500/20"
        variant="warning"
        index={index++}
      />
    );
  }

  // Divisa USD
  if (economyData.divisas.usd > 0) {
    stats.push(
      <StatCard
        key="usd"
        title="Divisa USD"
        value={`$${economyData.divisas.usd.toFixed(2)} USD`}
        icon={DollarSign}
        iconColor="text-green-400"
        iconBg="bg-green-500/20"
        variant="success"
        index={index++}
      />
    );
  }

  // Divisa BTC
  if (economyData.divisas.btc > 0) {
    stats.push(
      <StatCard
        key="btc"
        title="Divisa BTC"
        value={`₿${economyData.divisas.btc.toFixed(8)} BTC`}
        icon={Coins}
        iconColor="text-orange-400"
        iconBg="bg-orange-500/20"
        variant="info"
        index={index++}
      />
    );
  }

  // Último cobro
  stats.push(
    <StatCard
      key="lastPayment"
      title="Último Cobro"
      value={formatDate(economyData.lastCobro)}
      icon={TrendingUp}
      iconColor="text-blue-400"
      iconBg="bg-blue-500/20"
      variant="info"
      index={index++}
    />
  );

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
      {stats}
    </div>
  );
}