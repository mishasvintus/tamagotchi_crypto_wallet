import { ActivityItem } from '@/tamagotchi/types';
import './ActivityButton.css';

interface ActivityButtonProps {
  activity: ActivityItem;
  onClick: () => void;
}

export function ActivityButton({ activity, onClick }: ActivityButtonProps) {
  return (
    <button className="activity-button" onClick={onClick}>
      <span className="activity-button__emoji">{activity.emoji}</span>
    </button>
  );
}


