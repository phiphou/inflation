#!/usr/bin/env node

import { execSync } from 'node:child_process'

/**
 * Postinstall script that:
 * 1. Installs lefthook only if in a git repository
 * 2. Runs biome format to fix any formatting issues
 */

const isCI = process.env.CI === 'true' || process.env.CI === '1'

function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function run() {
  console.log('⚙️  Running postinstall...')

  // Install lefthook only if we're in a git repo and not in CI
  if (isGitRepository() && !isCI) {
    try {
      console.log('🪝 Installing git hooks with lefthook...')
      execSync('lefthook install', { stdio: 'inherit' })
      console.log('✅ Lefthook hooks installed')
    } catch (error) {
      console.warn('⚠️  Failed to install lefthook:', error.message)
    }
  } else {
    if (!isGitRepository()) {
      console.log('ℹ️  Skipping lefthook (not a git repository)')
    } else if (isCI) {
      console.log('ℹ️  Skipping lefthook (CI environment)')
    }
  }

  // Run biome format to fix any formatting issues (skip in CI to save time)
  if (!isCI) {
    try {
      console.log('🎨 Formatting code with biome...')
      execSync('biome format . --write', { stdio: 'inherit' })
      console.log('✅ Code formatted')
    } catch (error) {
      console.warn('⚠️  Failed to format with biome:', error.message)
    }
  }

  console.log('✨ Postinstall complete')
}

run()
