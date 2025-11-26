import { ActionButton } from './ActionButton';
import './ActionRow.css';

export interface ActionItem {
  emoji: string;
  onClick: () => void;
  activeColor?: string;
}

interface ActionRowProps {
  actions: ActionItem[];
}

export function ActionRow({ actions }: ActionRowProps) {
  return (
    <div className="action-row">
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          emoji={action.emoji}
          onClick={action.onClick}
          activeColor={action.activeColor}
        />
      ))}
    </div>
  );
}

