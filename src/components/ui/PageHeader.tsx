type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-base leading-7 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  )
}
