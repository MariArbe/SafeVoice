export default function Campo({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  isTextArea = false,
  rows = 4,
}) {
  const inputStyles =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputStyles}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputStyles}
        />
      )}

      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}