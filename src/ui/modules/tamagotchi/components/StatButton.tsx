import './StatButton.css';

interface StatButtonProps {
  emoji: string;
  value: number;
  onClick: () => void;
  absolute?: boolean;
}

export function StatButton({ emoji, value, onClick, absolute = false }: StatButtonProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const className = absolute ? 'stat-button stat-button--absolute' : 'stat-button';

  return (
    <button className={className} onClick={onClick}>
      <div className="stat-button__circle-container">
        <svg className="stat-button__circle" viewBox="0 0 80 80">
          {/* Фоновый круг */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="5"
          />
          {/* Заполненный круг */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#4caf50"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            className="stat-button__progress"
          />
        </svg>
        <div className="stat-button__content">
          <div className="stat-button__emoji">{emoji}</div>
        </div>
      </div>
    </button>
  );
}

