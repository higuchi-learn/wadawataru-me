type CardTitleSize = 'Default' | 'Short';

type CardTitleProps = {
  title: string;
  size?: CardTitleSize;
  className?: string;
};

export default function CardTitle({ title, size = 'Default', className }: CardTitleProps) {
  const isDefault = size === 'Default';

  return (
    <div className={className ?? 'flex flex-col items-start'}>
      <p
        className={`font-semibold text-black tracking-normal whitespace-nowrap overflow-hidden text-ellipsis ${
          isDefault ? 'text-lg leading-7' : 'text-sm leading-5'
        }`}
      >
        {title}
      </p>
    </div>
  );
}
