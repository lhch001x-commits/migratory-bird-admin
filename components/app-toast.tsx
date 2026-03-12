'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type ToastPayload = {
  title?: string
  description: string
  duration?: number
}

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useAppToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useAppToast must be used within <AppToastProvider>')
  return ctx
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastPayload & { open: boolean }) | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((payload: ToastPayload) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const duration = payload.duration ?? 3000
    setToast({ ...payload, duration, open: true })
    timerRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, open: false } : prev))
    }, duration)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast?.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-md bg-black/45 text-white px-6 py-4 shadow-lg max-w-[420px]">
            <div className="flex flex-col items-center text-center">
              {toast.title && (
                <div className="text-sm font-semibold mb-1">{toast.title}</div>
              )}
              <div className="text-sm">{toast.description}</div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

