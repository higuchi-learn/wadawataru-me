// BlogEditor と TagSelectOverlay で共有するフォーム用コンポーネント

type FormLabelProps = {
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function FormLabel({ name, required, hint, error }: FormLabelProps) {
  return (
    <div className="flex items-center gap-1 text-xs leading-4">
      <span className="text-black">{name}</span>
      {error ? (
        <span className="text-[var(--error)]">{error}</span>
      ) : (
        required && hint && <span className="text-[var(--error)]">({hint})</span>
      )}
    </div>
  );
}

type InputFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  // 画像の貼り付けをサポートするため、onPasteイベントハンドラーを受け取る
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  error?: string;
};

export function InputField({ label, required, hint, value, onChange, placeholder, multiline, onPaste, error }: InputFieldProps) {
  const borderClass = error ? 'border-[var(--error)]' : 'border-[var(--inputborder,#9f9fa9)]';
  const inputClass = `bg-[var(--inputcontainer)] border ${borderClass} rounded-sm shadow-sm px-2 text-sm leading-5 w-full focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]`;
  return (
    <div className="flex flex-col gap-0 p-1 w-full shrink-0">
      <FormLabel name={label} required={required} hint={hint} error={error} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} py-1 resize-none break-all`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // 画像の貼り付けをサポートするため、onPasteイベントハンドラーをinput要素に渡す
          onPaste={onPaste}
          placeholder={placeholder}
          className={`${inputClass} h-7`}
        />
      )}
    </div>
  );
}
