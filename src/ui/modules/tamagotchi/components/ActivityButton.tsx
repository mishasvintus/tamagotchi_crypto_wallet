import { ActivityItem } from '@/tamagotchi/types';
import { ActionButton } from './ActionButton';

interface ActivityButtonProps {
  activity: ActivityItem;
  onClick: () => void;
}

export function ActivityButton({ activity, onClick }: ActivityButtonProps) {
  return (
    <ActionButton 
      emoji={activity.emoji} 
      onClick={onClick}
      activeColor="#4caf50"
    />
  );
}


