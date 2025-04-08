#!/bin/bash

# Script to fix case sensitivity in import paths
# Changes @/components/ui/ to @/components/UI/

# Find all TypeScript and TSX files
find /Users/EAPPLE/Desktop/NOVA\ DESIGN/nova-admin-panel/src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | xargs -0 sed -i '' 's|@/components/ui/|@/components/UI/|g'

echo "Import paths have been updated to use correct case."
