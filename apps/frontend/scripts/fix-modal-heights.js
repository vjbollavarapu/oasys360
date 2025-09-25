#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the pattern for modals that need fixing
const PROBLEMATIC_PATTERNS = [
  'max-w-4xl',
  'max-w-3xl', 
  'max-w-2xl'
];

// Standard modal structure pattern
const GOOD_PATTERN = 'max-h-[80vh] overflow-hidden flex flex-col';

function findTsxFiles() {
  return glob.sync('**/*.tsx', {
    ignore: ['node_modules/**', '.next/**', 'dist/**'],
    cwd: process.cwd()
  });
}

function fixModalStructure(content, filePath) {
  let modified = false;
  let newContent = content;

  // Pattern 1: Fix DialogContent without proper height
  const dialogContentRegex = /<DialogContent className="(max-w-(?:4xl|3xl|2xl)[^"]*)"([^>]*)>/g;
  
  newContent = newContent.replace(dialogContentRegex, (match, className, otherAttrs) => {
    if (!className.includes('max-h-[80vh]')) {
      console.log(`Fixing DialogContent in ${filePath}`);
      modified = true;
      const newClassName = `${className} max-h-[80vh] overflow-hidden flex flex-col`;
      return `<DialogContent className="${newClassName}"${otherAttrs}>`;
    }
    return match;
  });

  // Pattern 2: Fix DialogHeader without flex-shrink-0
  const dialogHeaderRegex = /<DialogHeader(\s+className="[^"]*")?>/g;
  newContent = newContent.replace(dialogHeaderRegex, (match, existingClass) => {
    if (existingClass) {
      if (!existingClass.includes('flex-shrink-0')) {
        const className = existingClass.replace('className="', 'className="flex-shrink-0 ');
        modified = true;
        return `<DialogHeader${className}>`;
      }
    } else {
      modified = true;
      return '<DialogHeader className="flex-shrink-0">';
    }
    return match;
  });

  // Pattern 3: Fix DialogFooter without flex-shrink-0
  const dialogFooterRegex = /<DialogFooter(\s+className="[^"]*")?>/g;
  newContent = newContent.replace(dialogFooterRegex, (match, existingClass) => {
    if (existingClass) {
      if (!existingClass.includes('flex-shrink-0')) {
        const className = existingClass.replace('className="', 'className="flex-shrink-0 ');
        modified = true;
        return `<DialogFooter${className}>`;
      }
    } else {
      modified = true;
      return '<DialogFooter className="flex-shrink-0">';
    }
    return match;
  });

  // Pattern 4: Add scrollable content wrapper
  // This is more complex and needs manual inspection

  return { content: newContent, modified };
}

function main() {
  console.log('🔍 Finding TSX files...');
  const files = findTsxFiles();
  
  let totalFixed = 0;
  const filesToManuallyCheck = [];

  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file contains DialogContent with problematic patterns
      const hasProblematicModal = PROBLEMATIC_PATTERNS.some(pattern => 
        content.includes(`DialogContent className="max-w-`) && 
        content.includes(pattern) && 
        !content.includes('max-h-[80vh]')
      );

      if (hasProblematicModal) {
        console.log(`\n📄 Checking: ${filePath}`);
        const result = fixModalStructure(content, filePath);
        
        if (result.modified) {
          // For now, just report what needs to be fixed
          console.log(`   ✅ Would fix modal structure`);
          filesToManuallyCheck.push(filePath);
          totalFixed++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files with modals needing fixes: ${totalFixed}`);
  console.log(`\n📋 Files that need manual checking:`);
  filesToManuallyCheck.forEach(file => console.log(`   - ${file}`));
  
  console.log(`\n💡 To fix these, you need to:`);
  console.log(`   1. Add 'max-h-[80vh] overflow-hidden flex flex-col' to DialogContent`);
  console.log(`   2. Add 'flex-shrink-0' to DialogHeader and DialogFooter`);
  console.log(`   3. Wrap content in 'flex-1 overflow-y-auto px-1' div`);
}

if (require.main === module) {
  main();
}

module.exports = { fixModalStructure }; 