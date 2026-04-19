'use client';

import React, { createContext, useCallback, useContext, useReducer } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  duration: number;
}

interface NotificationContextValue {
  toasts:  Toast[];
  show:    (title: string, message?: string, type?: ToastType, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

type Action =
  | { type: 'ADD';    payload: Toast }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' };

// ── Reducer ───────────────────────────────────────────────────────────────────
const reducer = (state: Toast[], action: Action): Toast[] => {
  switch (action.type) {
    case 'ADD':    return [action.payload, ...state].slice(0, 5); // max 5 toasts
    case 'REMOVE': return state.filter((t) => t.id !== action.payload);
    case 'CLEAR':  return [];
    default:       return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, dispatch] = useReducer(reducer, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const dismissAll = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const show = useCallback((
    title: string,
    message?: string,
    type: ToastType = 'info',
    duration = 4000
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    dispatch({ type: 'ADD', payload: { id, type, title, message, duration } });

    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), duration);
    }
  }, []);

  const success = useCallback((title: string, message?: string) =>
    show(title, message, 'success'), [show]);

  const error = useCallback((title: string, message?: string) =>
    show(title, message, 'error', 6000), [show]);

  const warning = useCallback((title: string, message?: string) =>
    show(title, message, 'warning', 5000), [show]);

  const info = useCallback((title: string, message?: string) =>
    show(title, message, 'info'), [show]);

  return (
    <NotificationContext.Provider value={{
      toasts, show, success, error, warning, info, dismiss, dismissAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;
