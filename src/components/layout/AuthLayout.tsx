import { Outlet } from "react-router-dom";

const features = [
  "Modular file model — structure, style, and content separated",
  "One-click fork and remix any community template",
  "AI generation at every layer — cloud or local models",
  "Export to HTML, PDF, PNG, and Markdown",
];

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] font-sans">
      <div className="flex w-full items-center justify-center px-6 lg:w-3/5">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      <aside className="hidden lg:flex lg:w-2/5 flex-col justify-center gap-8 bg-[var(--acc)] p-12 text-[var(--sur)]">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--cy)] bg-[var(--cy-d)] px-3 py-1 text-xs font-semibold text-[var(--cy)]">
            <span className="size-1.5 rounded-full bg-[var(--cy)]" />
            Modular Generation Framework
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">
            Separate structure, style
            <br />
            <span className="text-[var(--cy)]">and content.</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed opacity-80">
            Build reliable, composable AI-generated content with the modular
            approach. Fork templates, generate at any layer, export everywhere.
          </p>
        </div>

        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm leading-snug">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--cy)]" />
              {f}
            </li>
          ))}
        </ul>

        <blockquote className="border-l-2 border-[var(--cy)] pl-4 text-sm leading-relaxed italic opacity-80">
          "MGF changed how I create presentations. I fork a template, generate
          content with AI, and export in minutes."
          <footer className="mt-2 text-xs not-italic opacity-60">
            — Alex, Student
          </footer>
        </blockquote>
      </aside>
    </div>
  );
}
