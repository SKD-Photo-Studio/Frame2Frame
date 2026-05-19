const fs = require('fs');
const path = require('path');

// 1. Resolve paths
const PACKAGE_PATH = path.resolve(__dirname, '../frontend/package.json');
const LOCAL_PATH = path.resolve(__dirname, '../Local Docs/Local_Changelog.md');
const LOCAL_ARCHIVE_PATH = path.resolve(__dirname, '../Local Docs/Local_Changelog_Archive.md');
const PUBLIC_PATH = path.resolve(__dirname, '../Public Docs/CHANGELOG.md');
const PUBLIC_ARCHIVE_PATH = path.resolve(__dirname, '../Public Docs/CHANGELOG_ARCHIVE.md');

// 2. Parse command arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("\x1b[31m❌ Error: Missing arguments.\x1b[0m");
  console.log("Usage: node scripts/changelog.js <added|changed|fixed|secured|removed> <description> [--release]");
  console.log("Example: node scripts/changelog.js fixed \"Cleaned out dead NEXT_PUBLIC_DEV_BYPASS_AUTH variable\"");
  process.exit(1);
}

// 3. Keep a Changelog standard categories with highly readable emojis
const CATEGORY_MAP = {
  added: "🚀 Added",
  changed: "⚙️ Changed",
  fixed: "🩹 Fixed",
  secured: "🔒 Secured",
  removed: "🗑️ Removed"
};

const categoryInput = args[0].toLowerCase();
const category = CATEGORY_MAP[categoryInput] || `⚙️ Changed`;
const description = args[1];
const isRelease = args.includes('--release');

// 4. Retrieve current version from package.json for automated synchronization
let version = '2.4.5';
try {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  version = pkg.version || '2.4.5';
} catch (e) {
  console.warn("⚠️ Could not read version from package.json, defaulting to 2.4.5");
}

const currentDate = new Date().toISOString().split('T')[0];
const targetHeader = `## [v${version}] - ${currentDate}`;

// 5. Automated Archiving of historical entries to prevent context bloat
function archiveHistoricalVersions(filePath, archivePath, maxBytes = 2500) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.length <= maxBytes) return;

  console.log(`⚡ Context size too high in ${path.basename(filePath)} (${content.length} chars). Archiving older releases...`);

  // Split content by version headers (## [v)
  const parts = content.split(/(?=## \[v)/g);
  if (parts.length <= 2) return; // Only 0, 1, or 2 blocks - nothing older to archive!

  const intro = parts[0].trim();
  const latestBlock = parts[1].trim();

  // Everything from index 2 and onward are historical versions to be moved
  const historicBlocks = parts.slice(2).map(p => p.trim()).join('\n\n');

  // Prepend or write new historical blocks at the top of the archive file
  let archiveContent = '';
  const archiveTitle = path.basename(archivePath).includes('Local')
    ? '# 📜 Local Changelog Archive: SKD Photo Studio\n\n'
    : '# 📜 Changelog Archive: SKD Photo Studio\n\n';

  if (fs.existsSync(archivePath)) {
    const existingArchive = fs.readFileSync(archivePath, 'utf8');
    const existingBody = existingArchive.replace(/^# .*?\n+/i, '').trim();
    archiveContent = `${archiveTitle}${historicBlocks}\n\n${existingBody}`;
  } else {
    archiveContent = `${archiveTitle}${historicBlocks}`;
  }

  // Create directory if not exists
  const archiveDir = path.dirname(archivePath);
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  fs.writeFileSync(archivePath, archiveContent.trim() + '\n', 'utf8');
  console.log(`📦 Archived historical versions into: ${path.basename(archivePath)}`);

  // Re-write the active changelog, keeping only the latest version plus a pointer link
  const archiveFilename = path.basename(archivePath);
  const activeContent = `${intro}\n\n${latestBlock}\n\n---\n\n*👉 For older version history, see the [Changelog Archive](./${archiveFilename}).*\n`;
  fs.writeFileSync(filePath, activeContent, 'utf8');
}

// 6. Update Active Changelog file
function updateChangelog(filePath, titlePrefix) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Locate the target version header
  const headerIndex = content.indexOf(targetHeader);
  let updatedContent = '';

  const entryText = `- **${category}**: ${description}`;

  if (headerIndex !== -1) {
    // Version block already exists, append the new bullet to it
    const preHeader = content.substring(0, headerIndex + targetHeader.length);
    const postHeader = content.substring(headerIndex + targetHeader.length);

    // Find the end of the current version block (where next header or end of file starts)
    const nextHeaderIndex = postHeader.search(/## \[v/);
    if (nextHeaderIndex !== -1) {
      const activeBlock = postHeader.substring(0, nextHeaderIndex).trim();
      const rest = postHeader.substring(nextHeaderIndex);
      updatedContent = `${preHeader}\n${activeBlock}\n${entryText}\n\n${rest}`;
    } else {
      // It's the last block or only block in the file
      // Strip any archive links if present
      const cleanPostHeader = postHeader.replace(/---\s*\*👉 For older version history[\s\S]*$/, '').trim();
      updatedContent = `${preHeader}\n${cleanPostHeader}\n${entryText}\n`;
    }
  } else {
    // Version block does not exist, insert it below the intro
    const firstHeaderIndex = content.search(/## \[v/);
    if (firstHeaderIndex !== -1) {
      const intro = content.substring(0, firstHeaderIndex).trim();
      const rest = content.substring(firstHeaderIndex).trim();
      updatedContent = `${intro}\n\n${targetHeader}\n### Status: Awaiting Push to Development Repository\n${entryText}\n\n${rest}`;
    } else {
      // Empty or no headers found
      updatedContent = `${content.trim()}\n\n${targetHeader}\n${entryText}\n`;
    }
  }

  // Append archive pointer link if the archive file exists
  const archiveFilename = path.basename(filePath).includes('Local') ? 'Local_Changelog_Archive.md' : 'CHANGELOG_ARCHIVE.md';
  const archivePath = path.resolve(path.dirname(filePath), archiveFilename);
  if (fs.existsSync(archivePath)) {
    updatedContent = updatedContent.trim() + `\n\n---\n\n*👉 For older version history, see the [Changelog Archive](./${archiveFilename}).*\n`;
  }

  // Write the updated content
  fs.writeFileSync(filePath, updatedContent.trim() + '\n', 'utf8');
  console.log(`✅ Successfully updated: ${path.basename(filePath)}`);
}

// Execute changes
try {
  // Update local changelog
  updateChangelog(LOCAL_PATH, "📓 Local Changelog");
  archiveHistoricalVersions(LOCAL_PATH, LOCAL_ARCHIVE_PATH);

  // If release flag is passed, update and archive public changelog as well
  if (isRelease) {
    updateChangelog(PUBLIC_PATH, "CHANGELOG");
    archiveHistoricalVersions(PUBLIC_PATH, PUBLIC_ARCHIVE_PATH);
  }
} catch (err) {
  console.error("❌ Error running version recorder:", err.message);
}
