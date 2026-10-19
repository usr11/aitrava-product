export function PageHeader({ eyebrow, title, text, children }: { eyebrow?: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-app py-10 lg:py-14">
        {eyebrow && <p className="eyebrow text-blue">{eyebrow}</p>}
        <h1 className="h-display mt-2 text-4xl text-navy sm:text-5xl">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-lg text-text-2">{text}</p>}
        {children}
      </div>
    </section>
  );
}
