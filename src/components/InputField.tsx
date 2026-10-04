'use client';

// BlogEditor と TagSelectOverlay で共有するフォーム用コンポーネント
import { useId } from 'react';

type FormLabelProps = {
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  // 対応する入力欄の id。渡すと <label htmlFor> になり、ラベルを押すと入力欄にフォーカスが移る。
  // 読み上げソフトでも、入力欄に移ったときに「タイトル」などの名前が読み上げられる
  htmlFor?: string;
  // エラー文の要素に付ける id。入力欄の aria-describedby から参照し、エラーを読み上げソフトに伝える
  errorId?: string;
};

export function FormLabel({ name, required, hint, error, htmlFor, errorId }: FormLabelProps) {
  return (
    <div className="flex items-center gap-1 text-xs leading-4">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-black">
          {name}
        </label>
      ) : (
        <span className="text-black">{name}</span>
      )}
      {error ? (
        // role="alert": バリデーションエラーが出たことを、入力欄から離れていてもすぐ読み上げる
        <span id={errorId} role="alert" className="text-[var(--error)]">
          {error}
        </span>
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

export function InputField({
  label,
  required,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
  onPaste,
  error,
}: InputFieldProps) {
  // useId: ラベルと入力欄、入力欄とエラー文を結び付けるための、ページ内で重複しない id
  const id = useId();
  const errorId = `${id}-error`;
  // 入力欄に付ける共通の属性
  //   aria-required: 必須かどうか（ラベルの「(必須)」は色付きの文字なので、読み上げソフトには別に伝える）
  //   aria-invalid / aria-describedby: エラーがあるとき、その旨とエラー文を読み上げソフトに伝える
  const a11yProps = {
    id,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };
  const borderClass = error ? 'border-[var(--error)]' : 'border-[var(--inputborder,#9f9fa9)]';
  const inputClass = `bg-[var(--inputcontainer)] border ${borderClass} rounded-sm shadow-sm px-2 text-sm leading-5 w-full focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]`;
  return (
    <div className="flex flex-col gap-0 p-1 w-full shrink-0">
      <FormLabel name={label} required={required} hint={hint} error={error} htmlFor={id} errorId={errorId} />
      {multiline ? (
        <textarea
          {...a11yProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} py-1 resize-none break-all`}
        />
      ) : (
        <input
          {...a11yProps}
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
