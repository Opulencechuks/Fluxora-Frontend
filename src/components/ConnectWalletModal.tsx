import { CSSProperties, MouseEvent, useEffect, useRef, useState } from "react";
import styles from "./ConnectWalletModal.module.css";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFreighter?: () => void;
  onConnectAlbedo?: () => void;
  onConnectWalletConnect?: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function ConnectWalletModal({
  isOpen,
  onClose,
  onConnectFreighter,
  onConnectAlbedo,
  onConnectWalletConnect,
}: ConnectWalletModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  const [isCloseFocused, setIsCloseFocused] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const walletOptions: WalletOption[] = [
    {
      id: "freighter",
      name: "Freighter",
      description: "Recommended browser extension for Stellar wallets.",
      icon: "🚀",
      action: onConnectFreighter ?? (() => {}),
    },
    {
      id: "albedo",
      name: "Albedo",
      description: "Open in-browser wallet for quick secure approvals.",
      icon: "⭐",
      action: onConnectAlbedo ?? (() => {}),
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Pair with compatible mobile wallets via QR.",
      icon: "🔗",
      action: onConnectWalletConnect ?? (() => {}),
    },
  ];

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        id="connect-wallet-modal"
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-modal-title"
        aria-describedby="connect-wallet-modal-description"
      >
        {/* Close button */}
        <button
          type="button"
          ref={closeButtonRef}
          style={{
            ...(inlineStyles.closeButton as React.CSSProperties),
            boxShadow: isCloseFocused
              ? "0 0 0 2px var(--surface-base), 0 0 0 4px var(--interactive-focus-ring)"
              : "none",
          }}
          onFocus={() => setIsCloseFocused(true)}
          onBlur={() => setIsCloseFocused(false)}
          onClick={onClose}
          aria-label="Close wallet connection dialog"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Step 1 of 1</span>
          <h2 id="connect-wallet-modal-title" className={styles.title}>
            Choose your wallet
          </h2>
          <p id="connect-wallet-modal-description" className={styles.subtitle}>
            Select a provider below to connect. You will review and approve the
            request in your wallet.
          </p>
        </div>

        <div style={inlineStyles.walletList as React.CSSProperties} role="list" aria-label="Wallet providers">
          {walletOptions.map((wallet) => {
            const isActive =
              hoveredOptionId === wallet.id || focusedOptionId === wallet.id;

            return (
              <button
                key={wallet.id}
                type="button"
                role="listitem"
                style={{
                  ...(inlineStyles.walletOption as React.CSSProperties),
                  background: isActive ? "var(--surface-elevated)" : "var(--surface-neutral)",
                  borderColor: isActive ? "var(--border-interactive)" : "var(--border-neutral)",
                  boxShadow: isActive
                    ? "0 0 0 2px var(--surface-base), 0 0 0 4px var(--interactive-focus-ring)"
                    : "none",
                }}
                onClick={wallet.action}
                onMouseEnter={() => setHoveredOptionId(wallet.id)}
                onMouseLeave={() => setHoveredOptionId(null)}
                onFocus={() => setFocusedOptionId(wallet.id)}
                onBlur={() => setFocusedOptionId(null)}
                aria-label={`Connect with ${wallet.name}`}
              >
                <div style={inlineStyles.walletIcon as React.CSSProperties} aria-hidden="true">
                  {wallet.icon}
                </div>
                <div style={inlineStyles.walletInfo as React.CSSProperties}>
                  <div style={inlineStyles.walletName as React.CSSProperties}>{wallet.name}</div>
                  <div style={inlineStyles.walletDescription as React.CSSProperties}>{wallet.description}</div>
                </div>
                <svg
                  className={styles.chevron}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          By continuing, you agree to Fluxora&apos;s{" "}
          <a href="/terms" className={styles.termsLink}>
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  );
}

const inlineStyles: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(2, 8, 18, 0.8)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "clamp(12px, 4vw, 24px)",
  },
  modal: {
    position: "relative",
    background: "var(--surface-neutral)",
    borderRadius: 16,
    padding: "clamp(18px, 5vw, 30px)",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
    border: "1px solid var(--border-neutral)",
    maxHeight: "90vh",
    overflowY: "auto",
    fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--text-muted)",
    fontSize: "1.125rem",
    cursor: "pointer",
    borderRadius: 8,
    padding: "0.35rem 0.45rem",
    lineHeight: 1,
    transition: "all 160ms ease",
  },
  header: {
    marginBottom: "1rem",
    paddingRight: "2.2rem",
  },
  badge: {
    display: "inline-block",
    borderRadius: 999,
    border: "1px solid rgba(34, 211, 238, 0.35)",
    color: "var(--status-info)",
    background: "rgba(34, 211, 238, 0.12)",
    padding: "5px 9px",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.03em",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.25rem, 4vw, 1.7rem)",
    fontWeight: 700,
    color: "var(--text-vivid)",
    marginBottom: "0.5rem",
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: 0,
    fontSize: "clamp(0.86rem, 2.8vw, 0.95rem)",
    color: "var(--text-secondary)",
    lineHeight: 1.55,
    maxWidth: 420,
  },
  walletList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  walletOption: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(0.75rem, 3vw, 1rem)",
    border: "1px solid var(--border-neutral)",
    borderRadius: 12,
    padding: "clamp(0.75rem, 3vw, 1rem)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 150ms ease-in-out",
    color: "inherit",
  },
  walletIcon: {
    fontSize: "clamp(1.35rem, 4vw, 1.9rem)",
    flexShrink: 0,
    width: "clamp(38px, 11vw, 48px)",
    height: "clamp(38px, 11vw, 48px)",
    borderRadius: 10,
    background: "var(--surface-elevated)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: "clamp(0.92rem, 2.5vw, 1rem)",
    fontWeight: 700,
    color: "var(--text-vivid)",
    marginBottom: "0.25rem",
  },
  walletDescription: {
    fontSize: "clamp(0.76rem, 2vw, 0.875rem)",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  chevron: {
    fontSize: "1.1rem",
    color: "var(--text-muted)",
    flexShrink: 0,
  },
  footer: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    lineHeight: 1.5,
    textAlign: "center",
    margin: 0,
  },
  termsLink: {
    color: "var(--status-info)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};
