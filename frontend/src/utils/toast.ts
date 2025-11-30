import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notify = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, defaultOptions);
  },
};

// Pre-defined messages for common actions
export const toastMessages = {
  auth: {
    loginSuccess: '✅ Erfolgreich angemeldet!',
    loginError: '❌ Anmeldung fehlgeschlagen',
    logoutSuccess: '👋 Erfolgreich abgemeldet',
    registerSuccess: '🎉 Account erfolgreich erstellt!',
    registerError: '❌ Registrierung fehlgeschlagen',
  },
  event: {
    createSuccess: '✅ Event erfolgreich erstellt!',
    createError: '❌ Event konnte nicht erstellt werden',
    updateSuccess: '✅ Event erfolgreich aktualisiert!',
    updateError: '❌ Event konnte nicht aktualisiert werden',
    deleteSuccess: '🗑️ Event erfolgreich gelöscht',
    deleteError: '❌ Event konnte nicht gelöscht werden',
    statusChangeSuccess: '✅ Status erfolgreich geändert',
    statusChangeError: '❌ Status konnte nicht geändert werden',
  },
  shift: {
    applySuccess: '✅ Bewerbung erfolgreich abgeschickt!',
    applyError: '❌ Bewerbung konnte nicht abgeschickt werden',
    cancelSuccess: '✅ Bewerbung erfolgreich zurückgezogen',
    cancelError: '❌ Bewerbung konnte nicht zurückgezogen werden',
  },
  application: {
    approveSuccess: '✅ Bewerbung genehmigt!',
    approveError: '❌ Genehmigung fehlgeschlagen',
    rejectSuccess: '✅ Bewerbung abgelehnt',
    rejectError: '❌ Ablehnung fehlgeschlagen',
  },
  general: {
    saveSuccess: '✅ Erfolgreich gespeichert!',
    saveError: '❌ Speichern fehlgeschlagen',
    loadError: '❌ Laden fehlgeschlagen',
    networkError: '🌐 Netzwerkfehler - Bitte später versuchen',
    unauthorized: '🔒 Nicht autorisiert',
    notFound: '🔍 Nicht gefunden',
  },
};
