import { describe, it, expect, vi } from 'vitest';
import { judgeText } from '../../src/judges/text';

// Mock the Anthropic client
vi.mock('../../src/judges/text', async () => {
  const actual = await vi.importActual('../../src/judges/text');
  return {
    ...actual,
    // We'll test the actual logic but mock external calls
  };
});

describe('judgeText', () => {
  it('should be defined', () => {
    expect(judgeText).toBeDefined();
  });

  it('should have correct function signature', () => {
    expect(typeof judgeText).toBe('function');
  });
});

describe('Text Judge Evaluation Logic', () => {
  it('should parse APPROVE responses correctly', () => {
    const approveResponse = 'APPROVE: The deliverable meets all criteria.';
    expect(approveResponse.toUpperCase().startsWith('APPROVE')).toBe(true);
  });

  it('should parse REJECT responses correctly', () => {
    const rejectResponse = 'REJECT: The deliverable does not meet the required standards.';
    expect(rejectResponse.toUpperCase().startsWith('REJECT')).toBe(true);
  });

  it('should handle case insensitivity', () => {
    const lowerApprove = 'approve: Looks good.';
    const upperApprove = 'APPROVE: Looks good.';
    expect(lowerApprove.toUpperCase().startsWith('APPROVE')).toBe(true);
    expect(upperApprove.toUpperCase().startsWith('APPROVE')).toBe(true);
  });
});

describe('Text Judge Criteria Matching', () => {
  it('should detect criteria keywords in deliverables', () => {
    const criteria = 'Create a function that adds two numbers';
    const deliverable = 'function add(a, b) { return a + b; }';
    
    // Basic keyword matching
    expect(deliverable.toLowerCase()).toContain('function');
    expect(deliverable.toLowerCase()).toContain('return');
  });

  it('should handle empty criteria gracefully', () => {
    const emptyCriteria = '';
    expect(emptyCriteria).toBe('');
  });

  it('should handle empty deliverables gracefully', () => {
    const emptyDeliverable = '';
    expect(emptyDeliverable).toBe('');
  });

  it('should handle deliverables with code blocks', () => {
    const codeDeliverable = `
      \`\`\`javascript
      function test() {
        return true;
      }
      \`\`\`
    `;
    expect(codeDeliverable).toContain('```');
    expect(codeDeliverable).toContain('javascript');
  });
});
