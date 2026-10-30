export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="wrap py-10 lg:py-14">
        <h1 className="display text-[clamp(2rem,9vw,3.6rem)]">{title}</h1>
        {text && <p className="lede mt-4 text-ink-2">{text}</p>}
        {children}
      </div>
    </section>
  );
}
