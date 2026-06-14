import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { CONTENT_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { ProjectFile, Id } from '@/types/api';

type ContentTabProps = {
  projectId: Id;
  selectedSlide: ProjectFile | null;
};

export function ContentTab({ projectId, selectedSlide }: ContentTabProps) {
  const content = selectedSlide?.content ?? '';
  const { groups } = useCssProperties(content, CONTENT_PROPERTIES);
  const { updateProperty } = useCssPropertyUpdates(projectId, selectedSlide?.id ?? null, content);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--t3)">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.properties.map((prop) => {
              if (prop.type === 'string') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <Input
                      value={prop.currentValue}
                      onChange={(e) => updateProperty(prop.varName, e.target.value)}
                      className="h-7 text-[11px]"
                    />
                  </div>
                );
              }

              if (prop.type === 'size') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <Input
                      value={prop.currentValue}
                      onChange={(e) => updateProperty(prop.varName, e.target.value)}
                      className="h-7 text-[11px]"
                    />
                  </div>
                );
              }

              if (prop.type === 'color') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={prop.currentValue}
                        onChange={(e) => updateProperty(prop.varName, e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded border-2 border-(--bor2) bg-transparent p-0.5"
                      />
                      <Input
                        value={prop.currentValue}
                        onChange={(e) => updateProperty(prop.varName, e.target.value)}
                        className="h-7 flex-1 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                );
              }

              if (prop.type === 'select') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <Select
                      value={prop.currentValue}
                      onValueChange={(v) => updateProperty(prop.varName, v)}
                    >
                      <SelectTrigger className="h-7 w-full text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prop.options?.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-[11px]">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
