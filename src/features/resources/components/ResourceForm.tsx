import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'

export function ResourceForm() {
  return (
    <PlaceholderPanel title="Resource editor">
      <form className="grid max-w-2xl gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input className="rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Kind</span>
          <select className="rounded-md border border-slate-300 px-3 py-2">
            <option value="prompt">Prompt</option>
            <option value="skill">Skill</option>
            <option value="agent">Agent</option>
            <option value="mcp">MCP</option>
            <option value="design_doc">Design doc</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Body</span>
          <textarea
            className="min-h-48 rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          className="w-fit rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
          type="button"
        >
          Save draft
        </button>
      </form>
    </PlaceholderPanel>
  )
}
