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
        // font-bold とホバー時のオレンジは、トップページのカードのタイトルにそろえている
        // group-hover は、親の Card（CARD_CLASS に group を付けている）のどこにホバーしても反応する
        className={`font-bold text-black tracking-normal whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[var(--ogangetext)] transition-colors ${
          isDefault ? 'text-lg leading-7' : 'text-sm leading-5'
        }`}
      >
        {title}
      </p>
    </div>
  );
}
