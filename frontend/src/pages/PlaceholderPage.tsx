type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="page-section">
      <div className="section-card">
        <p className="eyebrow">Модуль в разработке</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}