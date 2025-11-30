import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
          {spinner}
          {text && <p className="text-gray-700 font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {spinner}
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

// Inline spinner for buttons
export const ButtonSpinner: React.FC = () => (
  <svg
    className="animate-spin h-5 w-5 text-white inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Page loading component
export const PageLoading: React.FC<{ text?: string }> = ({
  text = 'Laden...',
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Card skeleton loader
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
  </div>
);

// List skeleton loader
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </>
);
