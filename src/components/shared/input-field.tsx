export function Field({
  label,
  name,
  placeholder,
  type = "text",
  error,
  hint,
  required,
  maxLength = 1000,
  minLength = 0,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number 
  minLength?: number 
}) {
  return (
    <div>
      <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        minLength={minLength ? minLength : required ? 1 : 0}
        maxLength={maxLength ?? 1000}
        placeholder={placeholder ?? ""}
        required={required}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
      {hint && !error && <p className="text-xs text-text-on-cream-muted mt-1">{hint}</p>}
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
