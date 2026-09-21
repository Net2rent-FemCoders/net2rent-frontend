import { useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import PinInput from "../../../../../../shared/components/ui/atoms/PinInput/PinInput.jsx";

import "./PinGenerator.scss";

function randomPin() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
    "",
  );
}

export default function PinGenerator({
  value = "",
  onChange,
  invalid = false,
  className = "",
}) {
  const classes = ["pin-generator", className].filter(Boolean).join(" ");
  const isComplete = /^\d{4}$/.test(value);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!isComplete) return;
    try {
      await navigator.clipboard.writeText(`PIN: ${value}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // If clipboard access fails (permission denied), we do nothing.
    }

    }

    return (
      <div className={classes}>
        <PinInput value={value} onChange={onChange} invalid={invalid} />

        <Button variant="secondary" onClick={() => onChange(randomPin())}>
          <RefreshCw size={16} aria-hidden="true" />
          Generar
        </Button>

        <Button
          variant="secondary"
          onClick={handleCopy}
          disabled={!isComplete}
          aria-label={copied ? "PIN copiado" : "Copiar PIN"}
        >
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    );
  }