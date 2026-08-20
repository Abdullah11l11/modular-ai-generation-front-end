import { describe, it, expect, beforeEach } from 'vitest';
import { readProposal, writeProposal, proposalStorageKey } from '../proposalStorage';
import type { Proposal } from '@/features/editor/hooks/useEditorStore';

const SID_A = 'project-A';
const SID_B = 'project-B';

const SAMPLE: Proposal = {
  messageId: 3,
  label: 'Hero Section',
  files: [{ layer: 'slide', content: '<mgf-slide>hi</mgf-slide>' }],
  previewHtml: '<mgf-slide>hi</mgf-slide>',
};

describe('proposalStorage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('keys proposals by projectId', () => {
    expect(proposalStorageKey(SID_A)).toBe('mgf:proposal:project-A');
    expect(proposalStorageKey(SID_B)).toMatch(/^mgf:proposal:/);
  });

  it('returns null when nothing is stored', () => {
    expect(readProposal(SID_A)).toBeNull();
  });

  it('round-trips a proposal', () => {
    writeProposal(SID_A, SAMPLE);
    const back = readProposal(SID_A);
    expect(back).toEqual(SAMPLE);
  });

  it('isolates projects — writing A does not affect B', () => {
    const otherB: Proposal = { ...SAMPLE, messageId: 7, label: 'B thing' };
    writeProposal(SID_A, SAMPLE);
    writeProposal(SID_B, otherB);
    expect(readProposal(SID_A)).toEqual(SAMPLE);
    expect(readProposal(SID_B)).toEqual(otherB);
  });

  it('removes the entry when passed null', () => {
    writeProposal(SID_A, SAMPLE);
    expect(window.sessionStorage.getItem(proposalStorageKey(SID_A))).not.toBeNull();
    writeProposal(SID_A, null);
    expect(window.sessionStorage.getItem(proposalStorageKey(SID_A))).toBeNull();
    expect(readProposal(SID_A)).toBeNull();
  });

  it('returns null for malformed JSON instead of throwing', () => {
    window.sessionStorage.setItem(proposalStorageKey(SID_A), '{not json');
    expect(readProposal(SID_A)).toBeNull();
  });

  it('returns null when the stored shape is missing required fields', () => {
    // missing files
    window.sessionStorage.setItem(
      proposalStorageKey(SID_A),
      JSON.stringify({ messageId: 1, label: 'x' }),
    );
    expect(readProposal(SID_A)).toBeNull();

    // missing label
    window.sessionStorage.setItem(
      proposalStorageKey(SID_A),
      JSON.stringify({ messageId: 1, files: [] }),
    );
    expect(readProposal(SID_A)).toBeNull();

    // missing messageId
    window.sessionStorage.setItem(
      proposalStorageKey(SID_A),
      JSON.stringify({ label: 'x', files: [] }),
    );
    expect(readProposal(SID_A)).toBeNull();

    // wrong type for files
    window.sessionStorage.setItem(
      proposalStorageKey(SID_A),
      JSON.stringify({ messageId: 1, label: 'x', files: 'oops' }),
    );
    expect(readProposal(SID_A)).toBeNull();
  });

  it('overwrites a previous entry on repeated writes', () => {
    writeProposal(SID_A, SAMPLE);
    const updated: Proposal = { ...SAMPLE, label: 'Updated' };
    writeProposal(SID_A, updated);
    expect(readProposal(SID_A)).toEqual(updated);
  });
});
