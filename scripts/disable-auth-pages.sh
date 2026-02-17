#!/bin/bash

# Script to disable all pages with auth issues for deployment

echo "Disabling pages with auth issues..."

# Find and disable all pages that use useSession or useAuth
find app -name "*.tsx" -not -name "*.bak*" -exec grep -l "useSession\|useAuth" {} \; | while read file; do
    if [ -f "$file" ]; then
        echo "Disabling: $file"
        mv "$file" "$file.bak"
    fi
done

echo "Done! All auth pages have been disabled."
