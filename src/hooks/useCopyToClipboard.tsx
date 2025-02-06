import { useState } from "react";

function useCopyToClipboard(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return [copied, copyToClipboard];
}

export default useCopyToClipboard;