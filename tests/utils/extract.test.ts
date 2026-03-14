import { describe, it, expect } from 'vitest';
import {
  extractCriteria,
  extractDeliverable,
  extractCode,
  formatEvidence,
} from '../../src/utils/extract';

describe('extractCriteria', () => {
  it('should extract criteria from event payload', () => {
    const event = { criteria: 'Create a function that adds two numbers' };
    expect(extractCriteria(event)).toBe('Create a function that adds two numbers');
  });

  it('should fallback to requirements field', () => {
    const event = { requirements: 'Requirements text here' };
    expect(extractCriteria(event)).toBe('Requirements text here');
  });

  it('should fallback to spec field', () => {
    const event = { spec: 'Specification text here' };
    expect(extractCriteria(event)).toBe('Specification text here');
  });

  it('should fallback to task field', () => {
    const event = { task: 'Task description here' };
    expect(extractCriteria(event)).toBe('Task description here');
  });

  it('should return null for empty event', () => {
    expect(extractCriteria({})).toBeNull();
  });

  it('should handle nested payload', () => {
    const event = { payload: { criteria: 'Nested criteria' } };
    expect(extractCriteria(event)).toBe('Nested criteria');
  });

  it('should handle nested data field', () => {
    const event = { data: { criteria: 'Criteria in data' } };
    expect(extractCriteria(event)).toBe('Criteria in data');
  });

  it('should ignore empty strings', () => {
    const event = { criteria: '   ', requirements: 'Valid requirements' };
    expect(extractCriteria(event)).toBe('Valid requirements');
  });

  it('should trim whitespace', () => {
    const event = { criteria: '  Trimmed criteria  ' };
    expect(extractCriteria(event)).toBe('Trimmed criteria');
  });
});

describe('extractDeliverable', () => {
  it('should extract deliverable from event', () => {
    const event = { deliverable: 'The deliverable content' };
    expect(extractDeliverable(event)).toBe('The deliverable content');
  });

  it('should fallback to output field', () => {
    const event = { output: 'Output content' };
    expect(extractDeliverable(event)).toBe('Output content');
  });

  it('should fallback to result field', () => {
    const event = { result: 'Result content' };
    expect(extractDeliverable(event)).toBe('Result content');
  });

  it('should handle object deliverables', () => {
    const event = { deliverable: { code: 'function test() {}' } };
    expect(extractDeliverable(event)).toEqual({ code: 'function test() {}' });
  });

  it('should return null for empty event', () => {
    expect(extractDeliverable({})).toBeNull();
  });

  it('should handle null event gracefully', () => {
    expect(extractDeliverable(null)).toBeNull();
  });
});

describe('extractCode', () => {
  it('should extract code from string deliverable', () => {
    const event = { deliverable: 'function test() { return true; }' };
    const result = extractCode(event);
    expect(result.code).toBe('function test() { return true; }');
    expect(result.language).toBeNull();
  });

  it('should extract code from object deliverable', () => {
    const event = { deliverable: { code: 'function test() {}', language: 'javascript' } };
    const result = extractCode(event);
    expect(result.code).toBe('function test() {}');
    expect(result.language).toBe('javascript');
  });

  it('should fallback to source field', () => {
    const event = { deliverable: { source: 'print("hello")' } };
    const result = extractCode(event);
    expect(result.code).toBe('print("hello")');
  });

  it('should fallback to content field', () => {
    const event = { deliverable: { content: 'const x = 1;' } };
    const result = extractCode(event);
    expect(result.code).toBe('const x = 1;');
  });

  it('should fallback to snippet field', () => {
    const event = { deliverable: { snippet: 'snippet code' } };
    const result = extractCode(event);
    expect(result.code).toBe('snippet code');
  });

  it('should handle language field variations', () => {
    const event = { deliverable: { code: 'test', lang: 'python' } };
    const result = extractCode(event);
    expect(result.language).toBe('python');
  });

  it('should return null for missing code', () => {
    const event = { deliverable: { other: 'field' } };
    const result = extractCode(event);
    expect(result.code).toBeNull();
    expect(result.language).toBeNull();
  });
});

describe('formatEvidence', () => {
  it('should format string deliverable', () => {
    const deliverable = 'Test deliverable';
    expect(formatEvidence(deliverable)).toBe('Test deliverable');
  });

  it('should format object deliverable as JSON', () => {
    const deliverable = { code: 'test', output: 'result' };
    const result = formatEvidence(deliverable);
    expect(result).toContain('code');
    expect(result).toContain('test');
  });

  it('should handle null deliverable', () => {
    expect(formatEvidence(null)).toBe('<no deliverable provided>');
  });

  it('should handle undefined deliverable', () => {
    expect(formatEvidence(undefined)).toBe('<no deliverable provided>');
  });

  it('should truncate long deliverables', () => {
    const longString = 'a'.repeat(5000);
    const result = formatEvidence(longString);
    expect(result.length).toBeLessThan(longString.length);
    expect(result).toContain('...<truncated>');
  });

  it('should respect custom maxLength', () => {
    const string = 'a'.repeat(200);
    const result = formatEvidence(string, 100);
    expect(result.length).toBeLessThanOrEqual(100 + '\n...<truncated>'.length);
  });
});
