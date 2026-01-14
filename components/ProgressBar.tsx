
import React from 'react';

interface Props {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<Props> = ({ current, total }) => {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div 
        className="bg-primary h-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
