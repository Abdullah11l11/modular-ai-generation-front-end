import { useMemo } from 'react';
import type { CssPropertyDef, CssPropertyGroup } from '@/features/editor/types/cssProperties';

export function parseCssValues(content: string, registry: CssPropertyDef[]): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    if (registry.some((p) => p.key === key)) {
      result[key] = value;
    }
  }

  return result;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

export function useCssProperties(
  fileContent: string | null | undefined,
  registry: CssPropertyDef[],
): { groups: CssPropertyGroup[]; hasVariables: boolean } {
  return useMemo(() => {
    const parsed = parseCssValues(fileContent ?? '', registry);
    const groupsByName = groupBy(registry, (p) => p.group);
    const groups: CssPropertyGroup[] = [];
    const groupOrder = [...groupsByName.keys()];

    for (const groupName of groupOrder) {
      const props = groupsByName.get(groupName)!;
      groups.push({
        name: groupName,
        label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
        properties: props.map((p) => ({
          ...p,
          value: parsed[p.key] ?? p.default,
        })),
      });
    }

    return { groups, hasVariables: Object.keys(parsed).length > 0 };
  }, [fileContent, registry]);
}
