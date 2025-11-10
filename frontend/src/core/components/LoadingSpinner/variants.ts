import { clsx } from 'clsx';
import type { LoadingSpinnerProps } from './types';

export function getLoadingSpinnerClassName(props: LoadingSpinnerProps): string {
  const { size = 'medium', className } = props;

  return clsx(
    'flex items-center justify-center',
    {
      'w-4 h-4': size === 'small',
      'w-8 h-8': size === 'medium',
      'w-12 h-12': size === 'large',
    },
    className
  );
}
