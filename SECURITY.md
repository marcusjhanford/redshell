# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

**⚠️ IMPORTANT: Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them privately using one of these methods:

### Preferred Method: GitHub Private Vulnerability Reporting

You can report vulnerabilities directly through GitHub:
1. Go to the [Security tab](https://github.com/marcusjhanford/redshell/security) in the repository
2. Click "Report a vulnerability"
3. Follow the guided process to submit your report

This is the preferred method as it keeps all communication and tracking within GitHub's secure infrastructure.

### Alternative: Email

If you prefer email or cannot access GitHub:

- **Security Email**: security@redshell.ai

Please include the following information in your report:
- **Type of vulnerability** (e.g., buffer overflow, SQL injection, cross-site scripting)
- **Affected versions** (which versions are impacted)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** - what can an attacker achieve?
- **Suggested fix** (if you have one)

## Response Timeline

We are committed to addressing security issues promptly:

| Severity     | Response Time | Fix Target |
|-------------|---------------|------------|
| Critical    | Within 24 hours | 48-72 hours |
| High        | Within 48 hours | 1 week |
| Medium      | Within 1 week | 2-4 weeks |
| Low         | Within 2 weeks | Next release |

**Severity definitions:**
- **Critical**: Remote code execution, unauthorized fund access, private key exposure
- **High**: Data breaches, unauthorized transaction signing, API key exposure
- **Medium**: XSS, CSRF, information disclosure, DoS
- **Low**: Best practice violations, hardening issues

## What to Expect

After you submit a vulnerability report:

1. **Acknowledgment**: We will acknowledge receipt of your report within the response time above
2. **Investigation**: We will investigate the issue and may ask for additional information
3. **Updates**: We will keep you informed of our progress at least every 5 days
4. **Resolution**: Once fixed, we will:
   - Credit you in the security advisory (unless you wish to remain anonymous)
   - Notify you before the public disclosure
   - Publish a security advisory on GitHub
   - Release a patched version

## Disclosure Policy

We follow responsible disclosure practices:

1. **Private Resolution**: We work to resolve the issue privately
2. **Coordinated Disclosure**: We coordinate the public disclosure date with you
3. **Public Disclosure**: Once fixed, we will:
   - Publish a GitHub Security Advisory
   - Release a new version with the fix
   - Document the vulnerability in our changelog
   - Credit you as the reporter (if desired)

## Security Best Practices

### For Users

- **Never expose private keys** in code, logs, or error messages
- **Use environment variables** for all sensitive configuration
- **Keep dependencies updated** - watch for security advisories
- **Enable 2FA** on all accounts (GitHub, Cloudflare, etc.)
- **Review access permissions** regularly
- **Use strong, unique API keys** for each environment

### For Contributors

- **No secrets in code**: Never commit API keys, private keys, or passwords
- **Secure defaults**: Always use secure-by-default configurations
- **Input validation**: Validate all external inputs
- **Least privilege**: Request minimum necessary permissions
- **Dependency scanning**: Check for known vulnerabilities before adding dependencies

## Security Features

RedShell implements several security measures:

- **Webhook signature verification**: All incoming webhooks are validated
- **Private key isolation**: Keys never touch disk, stored in Cloudflare Secrets
- **Sandboxed code execution**: Code judge runs in isolated E2B environment
- **Rate limiting**: Built-in protection against spam
- **Audit logging**: All verdicts are logged on-chain

## Known Security Considerations

### Current Architecture

1. **Cloudflare Workers**: Edge computing isolates execution
2. **E2B Sandboxing**: Code execution is containerized and time-limited
3. **On-chain verification**: All verdicts are cryptographically signed and verifiable
4. **Deterministic prompts**: No hidden logic or allowlists

### Areas of Concern

Users and auditors should pay special attention to:

1. **Judge logic**: Ensure evaluation criteria are fair and transparent
2. **API key storage**: Verify keys are properly secured in environment variables
3. **Webhook endpoints**: Ensure only authorized sources can trigger jobs
4. **Smart contract integration**: Verify correct contract addresses and ABIs

## Security Updates

Subscribe to security notifications:
- Watch the repository on GitHub
- Enable Dependabot alerts
- Join our [Discord/Slack] (coming soon)
- Follow [@redshell on Twitter/X] (coming soon)

## Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

*(This list will be populated as vulnerabilities are reported and fixed)*

## Questions?

For questions about this security policy:
- Email: security@redshell.ai
- GitHub: Use the [Security tab](https://github.com/marcusjhanford/redshell/security)

---

**Last updated**: March 2026

Thank you for helping keep RedShell and our users secure! 🔒
