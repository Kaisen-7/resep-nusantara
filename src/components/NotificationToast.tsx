import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "info" | "error";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export const NotificationToast = ({ id, message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const bgColors = {
    success: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
    info: "bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50",
    error: "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </motion.div>
  );
};

export default NotificationToast;
