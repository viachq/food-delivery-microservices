/**
 * Глобальна система сповіщень (Toast Notifications)
 * Використовується для показу success, error, info, warning повідомлень
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
}

export const showNotification = (
  message: string,
  type: NotificationType = 'success',
  duration: number = 3000
) => {
  // Видаляємо існуючі сповіщення
  document.querySelectorAll('.toast-notification').forEach((n) => n.remove());

  const colors: Record<NotificationType, string> = {
    success: 'background: linear-gradient(to right, #22c55e, #16a34a)',
    error: 'background: linear-gradient(to right, #ef4444, #dc2626)',
    info: 'background: linear-gradient(to right, #3b82f6, #2563eb)',
    warning: 'background: linear-gradient(to right, #f59e0b, #d97706)',
  };

  const icons: Record<NotificationType, string> = {
    success: `<svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`,
    error: `<svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>`,
    info: `<svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`,
    warning: `<svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>`,
  };

  const toast = document.createElement('div');
  toast.className =
    'toast-notification fixed top-24 right-4 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 max-w-md';
  toast.style.cssText = `${colors[type]}; color: white; animation: fadeIn 0.3s ease-out;`;
  toast.innerHTML = `
    <div style="width: 2.5rem; height: 2.5rem; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      ${icons[type]}
    </div>
    <p style="font-weight: 600; margin: 0; flex: 1;">${message}</p>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Зручні обгортки для різних типів
export const showSuccess = (message: string, duration?: number) =>
  showNotification(message, 'success', duration);

export const showError = (message: string, duration?: number) =>
  showNotification(message, 'error', duration);

export const showInfo = (message: string, duration?: number) =>
  showNotification(message, 'info', duration);

export const showWarning = (message: string, duration?: number) =>
  showNotification(message, 'warning', duration);

