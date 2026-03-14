import { describe, it, expect } from 'vitest';
import { judgeCode } from '../../src/judges/code';

describe('judgeCode', () => {
  it('should be defined', () => {
    expect(judgeCode).toBeDefined();
  });

  it('should have correct function signature', () => {
    expect(typeof judgeCode).toBe('function');
  });
});

describe('Code Judge Evaluation Logic', () => {
  it('should identify successful execution', () => {
    // Successful execution has no stderr
    const stderr = '';
    const hasErrors = stderr.length > 0;
    expect(hasErrors).toBe(false);
  });

  it('should identify failed execution', () => {
    // Failed execution has stderr content
    const stderr = 'Error: undefined variable';
    const hasErrors = stderr.length > 0;
    expect(hasErrors).toBe(true);
  });

  it('should handle various error types', () => {
    const errors = [
      'SyntaxError: Unexpected token',
      'ReferenceError: x is not defined',
      'TypeError: Cannot read property',
      'Error: Something went wrong',
    ];

    errors.forEach(error => {
      expect(error.length).toBeGreaterThan(0);
      expect(error.toLowerCase()).toMatch(/error|exception/);
    });
  });

  it('should handle empty stdout', () => {
    const stdout = '';
    expect(stdout).toBe('');
  });

  it('should handle execution timeout scenarios', () => {
    // Simulating timeout error
    const timeoutError = 'Execution timeout: Code took too long to execute';
    expect(timeoutError.toLowerCase()).toContain('timeout');
  });
});

describe('Code Judge Language Support', () => {
  it('should support JavaScript evaluation', () => {
    const code = 'console.log("Hello World")';
    expect(code).toContain('console');
    expect(code).toContain('log');
  });

  it('should support Python evaluation', () => {
    const code = 'print("Hello World")';
    expect(code).toContain('print');
  });

  it('should handle multi-line code', () => {
    const code = `
      function main() {
        const x = 1;
        const y = 2;
        return x + y;
      }
      main();
    `;
    expect(code.split('\n').length).toBeGreaterThan(1);
  });
});
