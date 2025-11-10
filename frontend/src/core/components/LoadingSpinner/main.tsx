import { getLoadingSpinnerClassName } from './variants';
import type { LoadingSpinnerProps } from './types';

export const LoadingSpinner = (props: LoadingSpinnerProps) => {
  const { size = 'medium', className } = props;

  return (
    <div className={getLoadingSpinnerClassName({ size, className })}>
      <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
};
