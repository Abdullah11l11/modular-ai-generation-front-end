import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import type { ProjectFile, ProjectFileKind } from '@/types/api';

type FileSpec = {
  layer: ProjectFileKind;
  name: string;
  extension: string;
  content: string;
};

function getDefaultContent(layer: ProjectFileKind, name: string): string {
  if (layer === 'slide' && name === 'content') {
    return '<!DOCTYPE html>\n<html>\n<head><title>Content</title></head>\n<body>\n  <h1>{{title}}</h1>\n  <p>{{subtitle}}</p>\n  <div>{{body}}</div>\n</body>\n</html>';
  }
  if (layer === 'style' && name === 'style') {
    return `:root {
  --background-color: #ffffff;
  --title-font-size: 2rem;
  --title-text-color: #0f172a;
  --title-text-align: left;
  --title-margin-bottom: 0.5rem;
  --title-margin-top: 0;
}

body {
  background-color: var(--background-color);
  margin: 0;
  padding: 1rem 2rem;
}

h1 {
  font-size: var(--title-font-size);
  color: var(--title-text-color);
  text-align: var(--title-text-align);
  margin-top: var(--title-margin-top);
  margin-bottom: var(--title-margin-bottom);
}`;
  }
  if (layer === 'content' && name === 'content') {
    return JSON.stringify({ title: 'Title', subtitle: 'Subtitle', body: 'Body content' }, null, 2);
  }
  if (layer === 'layout' && name === 'layout') {
    return `:root {
  --background-color: #ffffff;
  --surface-color: #f8fafc;
  --text-color: #0f172a;
  --border-color: #e2e8f0;
  --primary-color: #3b82f6;
  --accent-color: #06b6d4;
  --body-font: Inter;
  --heading-font: Inter;
  --font-size: 16px;
  --line-height: 1.5;
  --text-align: left;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--body-font);
  font-size: var(--font-size);
  line-height: var(--line-height);
  text-align: var(--text-align);
  margin: 0;
  padding: 2rem;
}

h1 {
  color: var(--primary-color);
  font-family: var(--heading-font);
  font-size: 1.75rem;
}`;
  }
  return '';
}

export function useInitSinglePageProject(projectId: string, files: ProjectFile[], hasTemplate: boolean) {
  const createMutation = useCreateProjectFile();
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(false);

  const requiredFiles: FileSpec[] = [
    { layer: 'slide', name: 'content', extension: 'html', content: getDefaultContent('slide', 'content') },
    { layer: 'style', name: 'style', extension: 'css', content: getDefaultContent('style', 'style') },
    { layer: 'content', name: 'content', extension: 'json', content: getDefaultContent('content', 'content') },
  ];

  if (hasTemplate) {
    requiredFiles.push({
      layer: 'layout', name: 'layout', extension: 'css', content: getDefaultContent('layout', 'layout'),
    });
  }

  const init = useCallback(async () => {
    const missing = requiredFiles.filter(
      (spec) => !files.some((f) => f.layer === spec.layer && f.name === `${spec.name}.${spec.extension}`),
    );

    if (missing.length === 0) return;

    setIsInitializing(true);
    await Promise.all(
      missing.map((spec) =>
        createMutation.mutateAsync({
          projectId,
          payload: { layer: spec.layer, name: `${spec.name}.${spec.extension}`, extension: spec.extension, content: spec.content },
        }),
      ),
    );
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
    setIsInitializing(false);
  }, [files, projectId, createMutation, queryClient]);

  return { init, isInitializing };
}
