#!/usr/bin/env node

/**
 * Prerequisites Checker
 * Verifies that all required software is installed before running the application
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkCommand(command, name, minVersion = null) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    const version = output.trim().split('\n')[0];
    log(`✓ ${name}: ${version}`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${name}: Not found`, colors.red);
    return false;
  }
}

function checkFile(path, name) {
  if (existsSync(path)) {
    log(`✓ ${name}: Found`, colors.green);
    return true;
  } else {
    log(`✗ ${name}: Not found`, colors.yellow);
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(50), colors.blue);
  log('GAD Legal Consult - Prerequisites Check', colors.bold);
  log('='.repeat(50) + '\n', colors.blue);

  let allGood = true;

  // Check Node.js
  log('Checking Node.js...', colors.blue);
  if (!checkCommand('node --version', 'Node.js')) {
    allGood = false;
    log('  → Install from: https://nodejs.org/', colors.yellow);
  }

  // Check npm
  log('\nChecking npm...', colors.blue);
  if (!checkCommand('npm --version', 'npm')) {
    allGood = false;
    log('  → npm should come with Node.js', colors.yellow);
  }

  // Check PostgreSQL
  log('\nChecking PostgreSQL...', colors.blue);
  const pgInstalled = checkCommand('psql --version', 'PostgreSQL');
  if (!pgInstalled) {
    allGood = false;
    log('  → Windows: https://www.postgresql.org/download/windows/', colors.yellow);
    log('  → macOS: brew install postgresql@16', colors.yellow);
    log('  → Linux: sudo apt-get install postgresql', colors.yellow);
  }

  // Check for .env file
  log('\nChecking configuration...', colors.blue);
  const envExists = checkFile('.env', '.env file');
  if (!envExists) {
    log('  → Copy .env.example to .env and configure it', colors.yellow);
    log('  → Command: cp .env.example .env', colors.yellow);
  }

  // Check for node_modules
  log('\nChecking dependencies...', colors.blue);
  const depsInstalled = checkFile('node_modules', 'node_modules');
  if (!depsInstalled) {
    log('  → Run: npm install', colors.yellow);
  }

  // Summary
  log('\n' + '='.repeat(50), colors.blue);
  if (allGood && envExists && depsInstalled) {
    log('✓ All prerequisites met! You\'re ready to go.', colors.green + colors.bold);
    log('\nNext steps:', colors.blue);
    log('  1. Ensure PostgreSQL is running', colors.reset);
    log('  2. Run: npm run db:push', colors.reset);
    log('  3. Run: npm run dev', colors.reset);
  } else {
    log('⚠ Some prerequisites are missing', colors.yellow + colors.bold);
    log('\nPlease install missing items and run this check again.', colors.reset);
    log('For detailed setup instructions, see: SETUP.md', colors.blue);
  }
  log('='.repeat(50) + '\n', colors.blue);
}

main().catch(console.error);
