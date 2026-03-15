# Contributing to RedShell

Thank you for your interest in contributing to RedShell! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Security](#security)
- [Maintainer Notes](#maintainer-notes)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you agree to uphold this code. Please read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/redshell.git
   cd redshell
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check if the issue has already been reported in [existing issues](https://github.com/marcusjhanford/redshell/issues)
- Try to isolate the problem and create a minimal reproduction

When submitting a bug report, please include:
- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs. actual behavior
- **Environment details**: Node version, OS, etc.
- **Code snippets** or screenshots if applicable
- **Transaction hashes** for blockchain-related issues

### Suggesting Features

We welcome feature suggestions! Please:
- **Check existing suggestions** first
- **Explain the use case** and why it would be valuable
- **Describe the solution** you'd like to see
- **Consider alternatives** you've thought about

### Pull Requests

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following our coding standards

3. **Run tests and type checking**:
   ```bash
   npm run test
   npm run typecheck
   npm run lint
   ```

4. **Commit your changes** with clear messages:
   ```bash
   git commit -m "feat: add semantic validation for code output"
   git commit -m "fix: resolve race condition in judge routing"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**:
   - Fill out the PR template completely
   - Link any related issues
   - Request review from @marcusjhanford
   - Ensure all checks pass

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Cloudflare account (for deployment)
- API keys for:
  - Anthropic (Claude API)
  - E2B (code sandbox)
  - Alchemy or Goldsky (webhook)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# See .env.example for required variables

# Run local development server
npm run dev

# The worker will be available at http://localhost:8787
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Coding Standards

### TypeScript Style Guide

- Use **strict TypeScript** (`strict: true` in tsconfig.json)
- Prefer `const` over `let`, never use `var`
- Use explicit return types on exported functions
- Avoid `any` - use `unknown` with type guards when necessary
- Use meaningful variable names
- Keep functions small and focused

### File Organization

```
src/
├── judges/          # Judge implementations
│   ├── text.ts      # Text/semantic judge
│   └── code.ts      # Code execution judge
├── utils/           # Utility functions
│   ├── blockchain.ts
│   ├── memos.ts
│   └── extract.ts
├── worker.ts        # Entry point
├── router.ts        # Job routing
└── types.ts         # Type definitions
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: 100 characters max
- **Trailing commas**: Required (where valid)

Example:
```typescript
export async function evaluateText(
  criteria: string,
  deliverable: string,
): Promise<Verdict> {
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4.5',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return parseVerdict(result);
}
```

### Error Handling

- Always handle promise rejections
- Use custom error classes for domain-specific errors
- Log errors with context before re-throwing
- Never expose sensitive data in error messages

### Comments

- Use JSDoc for exported functions
- Explain "why" not "what" (code shows what)
- Keep comments current with code changes

Example:
```typescript
/**
 * Evaluates a text deliverable against criteria using Claude.
 * Returns APPROVE if the deliverable meets criteria, REJECT otherwise.
 * 
 * @param criteria - The acceptance criteria to evaluate against
 * @param deliverable - The text to evaluate
 * @returns Promise resolving to the verdict
 * @throws {JudgeError} If evaluation fails
 */
export async function textJudge(
  criteria: string,
  deliverable: string,
): Promise<Verdict> {
  // ... implementation
}
```

## Testing

### Test Requirements

All new features must include tests:
- **Unit tests** for individual functions
- **Integration tests** for judge modules
- **Edge cases** (empty inputs, errors, etc.)

### Writing Tests

We use **Vitest** for testing. Tests should:
- Be descriptive ("should approve when deliverable matches criteria")
- Use mocks for external APIs (Anthropic, E2B)
- Cover success and failure paths
- Be independent (no shared state between tests)

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { textJudge } from '../src/judges/text';

describe('textJudge', () => {
  it('should approve when deliverable matches criteria', async () => {
    const result = await textJudge(
      'Create a function that adds two numbers',
      'function add(a, b) { return a + b; }',
    );
    expect(result.decision).toBe('APPROVE');
  });
});
```

### Test Coverage

Aim for >80% coverage on new code. Run:
```bash
npm run test:coverage
```

## Security

### Reporting Security Issues

**DO NOT** report security vulnerabilities publicly in GitHub issues.

Instead, please email security concerns to:
- **Security email**: security@redshell.ai (create this email)
- Or use [GitHub's private vulnerability reporting](https://github.com/marcusjhanford/redshell/security/advisories)

We will respond within 48 hours and work with you to address the issue responsibly.

### Security Best Practices for Contributors

- Never commit secrets or API keys
- Never log sensitive data (private keys, API keys)
- Use environment variables for all configuration
- Validate all external inputs
- Use parameterized queries (if adding database features)
- Follow the principle of least privilege

## Maintainer Notes

### Maintainer Response Time

As the sole maintainer, I (@marcusjhanford) commit to:
- **Issues**: Initial response within 3-5 business days
- **PRs**: Review within 3-5 business days
- **Security reports**: Response within 24 hours
- **Critical bugs**: Response within 24 hours

### PR Review Process

1. Automated checks must pass (tests, typecheck, lint)
2. Code review by @marcusjhanford (CODEOWNERS enforces this)
3. Approval required before merge
4. Squash merge preferred for clean history

### Becoming a Contributor

For now, all contributions go through the PR review process. As the project grows, I may add trusted contributors as maintainers based on:
- Quality and consistency of contributions
- Understanding of the codebase
- Alignment with project goals
- Community participation

## Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/marcusjhanford/redshell/discussions)
- **Bug reports**: [Open an issue](https://github.com/marcusjhanford/redshell/issues/new?template=bug_report.md)
- **Feature requests**: [Open an issue](https://github.com/marcusjhanford/redshell/issues/new?template=feature_request.md)
- **Security**: Email security@redshell.ai or use private reporting

Thank you for helping make RedShell better! 🚀
