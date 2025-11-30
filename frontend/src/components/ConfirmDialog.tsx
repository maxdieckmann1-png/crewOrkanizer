import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            {loading ? 'Wird verarbeitet...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      confirmButtonClass?: string;
    }
  ) => {
    setConfig({
      title,
      message,
      onConfirm,
      ...options,
    });
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!config) return;

    setLoading(true);
    try {
      await config.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setLoading(false);
  };

  const dialog = config ? (
    <ConfirmDialog
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      confirmButtonClass={config.confirmButtonClass}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
    />
  ) : null;

  return {
    confirm,
    dialog,
  };
};
