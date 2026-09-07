import { FiCheckCircle, FiClock, FiXCircle, FiSlash } from "react-icons/fi";

export default function RegistrationStatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();

  const config = {
    pending: {
      label: "Pending",
      icon: FiClock,
      classes: "bg-warning-500/10 text-warning-500",
    },

    approved: {
      label: "Approved",
      icon: FiCheckCircle,
      classes: "bg-success-500/10 text-success-500",
    },

    rejected: {
      label: "Rejected",
      icon: FiXCircle,
      classes: "bg-danger-500/10 text-danger-500",
    },

    cancelled: {
      label: "Cancelled",
      icon: FiSlash,
      classes: "bg-gray-500/10 text-gray-500",
    },
  };

  const current = config[normalizedStatus] || config.pending;

  const Icon = current.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1.5
        text-xs
        font-bold
        ${current.classes}
      `}
    >
      <Icon size={14} />

      {current.label}
    </span>
  );
}
