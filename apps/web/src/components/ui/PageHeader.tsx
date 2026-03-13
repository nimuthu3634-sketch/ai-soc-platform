import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="aegis-kicker">{eyebrow}</p> : null}
        <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl xl:text-[2.8rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
