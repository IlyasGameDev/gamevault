import {
  Boxes,
  Brain,
  Car,
  ChefHat,
  CircleDot,
  Compass,
  Crown,
  Diamond,
  Dices,
  Dumbbell,
  Flame,
  Gamepad2,
  Grid2X2,
  Heart,
  Joystick,
  Medal,
  MousePointer2,
  Puzzle,
  Repeat2,
  Rocket,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UsersRound,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  '3d': Boxes,
  action: Zap,
  adventure: Compass,
  arcade: Gamepad2,
  board: Grid2X2,
  boys: Gamepad2,
  card: Diamond,
  casual: WandSparkles,
  clicker: MousePointer2,
  cooking: ChefHat,
  discover: Compass,
  driving: Car,
  girls: Heart,
  hypercasual: Sparkles,
  hot: Flame,
  io: Crown,
  leaderboards: Medal,
  multiplayer: UsersRound,
  new: Sparkles,
  popular: Flame,
  puzzle: Puzzle,
  racing: Rocket,
  shooting: Target,
  simulation: Dices,
  skill: Swords,
  soccer: CircleDot,
  sports: Dumbbell,
  stickman: UsersRound,
  strategy: Brain,
  trending: Flame,
  updated: Repeat2,
  trophy: Trophy,
  originals: Joystick,
  more: Boxes,
} as const;

export type GameIconType = keyof typeof ICONS;

interface GameIconProps {
  type?: string | null;
  size?: number;
  className?: string;
}

export default function GameIcon({ type, size = 16, className }: GameIconProps) {
  const key = normalizeIconKey(type) as GameIconType;
  const Icon = ICONS[key] ?? ICONS.discover;

  return (
    <Icon
      size={size}
      strokeWidth={2.4}
      className={cn('shrink-0 text-[#6C5CFF]', className)}
    />
  );
}

function normalizeIconKey(type?: string | null) {
  return (type ?? 'discover')
    .toLowerCase()
    .trim()
    .replace(/^\.io$/, 'io')
    .replace(/\s+/g, '-');
}
