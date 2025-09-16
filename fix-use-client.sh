#!/bin/bash

# Remove all "use client" directives from React Native files
echo "🔧 Removing 'use client' directives from React Native files..."

# Find all TypeScript/JavaScript files and remove "use client" directive
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' '1s/^"use client"$//' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' '/^"use client"$/d' {} \;

# Also remove empty lines at the beginning that might be left behind
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' '/./,$!d' {} \;

echo "✅ Removed 'use client' directives from all React Native files"
echo "🔄 Please restart your development server"