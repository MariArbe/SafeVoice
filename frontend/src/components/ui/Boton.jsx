export default function Boton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-xs",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700 shadow-xs",
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-emerald-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  );
}