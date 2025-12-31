#!/usr/bin/env node

/**
 * Next.js dev server with automatic cache recovery
 * Detects cache corruption patterns and auto-recovers by clearing .next
 *
 * Features:
 * - Server-side error detection from stdout/stderr
 * - HTTP endpoint for browser-triggered recovery (/recovery)
 * - Periodic health check to detect unresponsive states
 */

import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = dirname(__dirname);
const nextDir = join(webDir, '.next');

const DEV_PORT = parseInt(process.env.PORT || '13000', 10);
const RECOVERY_PORT = DEV_PORT + 1; // 13001
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

const CORRUPTION_PATTERNS = [
  /Cannot find module '\.\/vendor-chunks\//,
  /ENOENT.*routes-manifest\.json/,
  /MODULE_NOT_FOUND.*\.next\//,
  /Cannot find module.*\.next\/server/,
  /__webpack_modules__\[moduleId\] is not a function/,
  /TypeError.*__webpack_modules__/,
];

let devProcess = null;
let isRecovering = false;
let healthCheckTimer = null;
let serverReady = false;

// Recovery HTTP server for browser-triggered recovery
function startRecoveryServer() {
  const server = createServer((req, res) => {
    // CORS headers for browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/recovery' && (req.method === 'GET' || req.method === 'POST')) {
      console.log('\n📡 Recovery triggered from browser');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'recovering' }));

      if (!isRecovering) {
        handleCorruption();
      }
      return;
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', serverReady }));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(RECOVERY_PORT, () => {
    console.log(`🔌 Recovery server listening on http://localhost:${RECOVERY_PORT}`);
  });

  return server;
}

// Periodic health check
async function checkHealth() {
  if (isRecovering || !serverReady) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`http://localhost:${DEV_PORT}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Check for error page indicators in response
    if (!response.ok && response.status >= 500) {
      console.log(`\n⚠️ Health check failed: HTTP ${response.status}`);
      handleCorruption();
    }
  } catch (err) {
    // Network errors during dev are normal (HMR, etc), only trigger on timeout
    if (err.name === 'AbortError') {
      console.log('\n⚠️ Health check timeout - server may be unresponsive');
      // Don't auto-recover on timeout, could be slow compilation
    }
  }
}

function startHealthCheck() {
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  healthCheckTimer = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
}

function stopHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }
}

async function cleanCache() {
  console.log('\n🔧 Cache corruption detected! Auto-recovering...');
  console.log('   Deleting .next folder...');

  try {
    await rm(nextDir, { recursive: true, force: true });
    console.log('   Cache cleared successfully.');
  } catch (err) {
    console.error('   Failed to clear cache:', err.message);
  }
}

function startDevServer() {
  console.log('🚀 Starting Next.js dev server with auto-recovery...\n');
  serverReady = false;

  devProcess = spawn('pnpm', ['next', 'dev', '-p', DEV_PORT.toString()], {
    cwd: webDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  const checkForCorruption = (data) => {
    const output = data.toString();
    process.stdout.write(output);

    // Detect when server is ready
    if (output.includes('Ready in') || output.includes('started server')) {
      serverReady = true;
      startHealthCheck();
    }

    if (isRecovering) return;

    for (const pattern of CORRUPTION_PATTERNS) {
      if (pattern.test(output)) {
        isRecovering = true;
        handleCorruption();
        break;
      }
    }
  };

  devProcess.stdout.on('data', checkForCorruption);
  devProcess.stderr.on('data', checkForCorruption);

  devProcess.on('close', (code) => {
    stopHealthCheck();
    if (!isRecovering) {
      console.log(`\nDev server exited with code ${code}`);
      process.exit(code);
    }
  });
}

async function handleCorruption() {
  if (devProcess) {
    devProcess.kill('SIGTERM');
    // Wait for process to terminate
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await cleanCache();

  console.log('   Restarting dev server...\n');
  isRecovering = false;
  startDevServer();
}

// Handle SIGINT/SIGTERM gracefully
process.on('SIGINT', () => {
  stopHealthCheck();
  if (devProcess) devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopHealthCheck();
  if (devProcess) devProcess.kill('SIGTERM');
  process.exit(0);
});

// Start everything
startRecoveryServer();
startDevServer();
