import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  iconClassName?: string;
}

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  iconClassName = "h-16 w-16 text-gray-400"
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon className={iconClassName} />
          </div>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
