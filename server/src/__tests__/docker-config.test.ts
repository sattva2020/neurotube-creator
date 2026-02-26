import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');

describe('Dockerfile', () => {
  const dockerfile = fs.readFileSync(path.join(ROOT, 'Dockerfile'), 'utf-8');

  it('should exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'Dockerfile'))).toBe(true);
  });

  it('should use node:22-alpine as base', () => {
    expect(dockerfile).toContain('FROM node:22-alpine');
  });

  it('should have multi-stage build with production stage', () => {
    expect(dockerfile).toContain('AS base');
    expect(dockerfile).toContain('AS deps');
    expect(dockerfile).toContain('AS production');
  });

  it('should expose port 3000', () => {
    expect(dockerfile).toContain('EXPOSE 3000');
  });

  it('should set NODE_ENV=production', () => {
    expect(dockerfile).toContain('NODE_ENV=production');
  });

  it('should copy drizzle migrations', () => {
    expect(dockerfile).toContain('server/drizzle/');
  });

  it('should use docker-entrypoint.sh as entrypoint', () => {
    expect(dockerfile).toContain('ENTRYPOINT ["./docker-entrypoint.sh"]');
  });

  it('should accept VERSION and COMMIT build args', () => {
    expect(dockerfile).toContain('ARG VERSION');
    expect(dockerfile).toContain('ARG COMMIT');
  });
});

describe('docker-compose.yml', () => {
  const compose = fs.readFileSync(path.join(ROOT, 'docker-compose.yml'), 'utf-8');

  it('should exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'docker-compose.yml'))).toBe(true);
  });

  it('should define postgres service with healthcheck', () => {
    expect(compose).toContain('postgres:');
    expect(compose).toContain('healthcheck:');
    expect(compose).toContain('pg_isready');
  });

  it('should define app service with full profile', () => {
    expect(compose).toContain('app:');
    expect(compose).toContain('- full');
  });

  it('should use named volume for postgres data', () => {
    expect(compose).toContain('pgdata:');
  });
});

describe('.dockerignore', () => {
  const dockerignore = fs.readFileSync(path.join(ROOT, '.dockerignore'), 'utf-8');

  it('should exist', () => {
    expect(fs.existsSync(path.join(ROOT, '.dockerignore'))).toBe(true);
  });

  it('should exclude node_modules', () => {
    expect(dockerignore).toContain('node_modules/');
  });

  it('should exclude .git', () => {
    expect(dockerignore).toContain('.git/');
  });

  it('should exclude dist directories', () => {
    expect(dockerignore).toContain('**/dist/');
  });

  it('should exclude .ai-factory and .claude', () => {
    expect(dockerignore).toContain('.ai-factory/');
    expect(dockerignore).toContain('.claude/');
  });

  it('should exclude env local files', () => {
    expect(dockerignore).toMatch(/\.env.*local/);
  });
});

describe('docker-entrypoint.sh', () => {
  const entrypoint = fs.readFileSync(path.join(ROOT, 'docker-entrypoint.sh'), 'utf-8');

  it('should exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'docker-entrypoint.sh'))).toBe(true);
  });

  it('should run drizzle-kit migrate', () => {
    expect(entrypoint).toContain('drizzle-kit migrate');
  });

  it('should start server with exec', () => {
    expect(entrypoint).toContain('exec node server/dist/index.js');
  });

  it('should use set -e for error handling', () => {
    expect(entrypoint).toContain('set -e');
  });
});
