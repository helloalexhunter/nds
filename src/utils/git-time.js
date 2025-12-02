import { execSync } from 'node:child_process';

/**
 * Fetches the last commit time for a specific file path.
 * @param {string} filePath - The file path relative to the repository root (e.g., 'src/pages/resources.astro').
 * @returns {string} The date string in ISO 8601 format, or the current date if Git fails.
 */
export function getLastCommitDate(filePath) {
  try {
    // Command: git log -1 --format=%aI -- [file path]
    // -1: only show the last commit
    // --format=%aI: format the output as author date, ISO 8601
    // --: separates git options from file paths
    
    // Execute the command synchronously
    const dateString = execSync(`git log -1 --format=%aI -- ${filePath}`).toString().trim();

    // If a valid date is returned, use it
    if (dateString) {
      return dateString;
    }
  } catch (error) {
    // If the file hasn't been committed yet, or Git isn't available,
    // log the error and fall back to the current date to avoid build failure.
    console.warn(`[Git Time Utility] Could not find commit time for ${filePath}. Falling back to current date.`, error.message);
  }

  // Fallback: If Git command fails or file isn't committed, use today's date.
  return new Date().toISOString();
}