import { useEffect, useRef, useCallback } from 'react'

/**
 * useClickOutside — Popup/dropdown dışına tıklanınca kapatan hook
 *
 * KURAL SETİ:
 * 1. Tüm popup/dropdown/modal'lar bu hook'u kullanmalı
 * 2. mousedown (capture) dinlenir — click'ten önce tetiklenir, daha güvenilir
 * 3. stopPropagation yapan child'lar bile yakalanır (capture: true)
 * 4. Escape tuşu da popup'ı kapatır
 * 5. ref, popup container'a bağlanır — içine tıklanırsa kapanmaz
 * 6. triggerRef (opsiyonel) toggle butonuna bağlanır — butona tıklanınca
 *    hook kapamaz, butonun kendi toggle'ı çalışır
 *
 * Kullanım:
 *   const popupRef = useClickOutside(() => setOpen(false), open)
 *   <div ref={popupRef}>...</div>
 *
 * Trigger butonu varsa:
 *   const popupRef = useClickOutside(() => setOpen(false), open, btnRef)
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
  isOpen: boolean,
  triggerRef?: React.RefObject<HTMLElement | null>,
) {
  const ref = useRef<T>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      // Popup içi — kapama
      if (ref.current?.contains(target)) return
      // Toggle butonu — butonun kendi onClick'i handle eder
      if (triggerRef?.current?.contains(target)) return
      onCloseRef.current()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [isOpen, triggerRef])

  return ref
}
