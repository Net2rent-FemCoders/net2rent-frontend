import { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.scss';

function getFocusable(container) {
    if (!container) return [];
    return Array.from(
        container.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), ' +
            'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
    );
}

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    initialFocusRef,
    closeOnBackdrop = true,
    closeLabel = 'Cerrar',
    className = '',
}) {
    const dialogRef = useRef(null);
    const previouslyFocused = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        previouslyFocused.current = document.activeElement;

        const target =
            initialFocusRef?.current ??
            getFocusable(dialogRef.current)[0] ??
            dialogRef.current;
        target?.focus();

        return () => previouslyFocused.current?.focus?.();
    }, [isOpen, initialFocusRef]);

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose?.();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = getFocusable(dialogRef.current);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    if (!isOpen) return null;

    return createPortal(
        <div className="modal" onKeyDown={handleKeyDown}>
            <div
                className="modal__backdrop"
                onClick={closeOnBackdrop ? onClose : undefined}
            />

            <div
                ref={dialogRef}
                className={['modal__dialog', className].filter(Boolean).join(' ')}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <header className="modal__header">
                    <div className="modal__heading">
                        <h2 className="modal__title" id={titleId}>{title}</h2>
                        {subtitle && <p className="modal__subtitle">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        className="modal__close"
                        onClick={onClose}
                        aria-label={closeLabel}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <div className="modal__body">{children}</div>

                {footer && <footer className="modal__footer">{footer}</footer>}
            </div>
        </div>,
        document.body,
    );
}