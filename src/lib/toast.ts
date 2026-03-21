import type { CSSProperties } from "react";
import toast from "react-hot-toast";

const baseStyle: CSSProperties = {
  background: "#18181b",
  color: "#fafafa",
  borderRadius: "0.5rem",
  boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "14px",
  padding: "12px 16px",
  maxWidth: "min(100vw - 2rem, 22rem)",
};

export function successToast(message: string) {
  return toast.success(message, {
    duration: 3500,
    position: "top-right",
    style: {
      ...baseStyle,
      borderLeft: "3px solid #f97316",
    },
  });
}

export function errorToast(message: string) {
  return toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      ...baseStyle,
      borderLeft: "3px solid #ef4444",
    },
  });
}
