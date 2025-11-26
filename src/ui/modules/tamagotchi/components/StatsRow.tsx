import { StatButton } from './StatButton';
import './StatsRow.css';

export interface StatItem {
  emoji: string;
  value: number;
  onClick: () => void;
}

interface StatsRowProps {
  stats: StatItem[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="stats-row">
      {stats.map((stat, index) => (
        <StatButton
          key={index}
          emoji={stat.emoji}
          value={stat.value}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}

