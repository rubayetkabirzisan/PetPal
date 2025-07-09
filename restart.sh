#!/bin/bash
# Clear React Native and Expo cache and restart the development server

# Stop any running processes on the Metro bundler port
echo "Stopping any running Metro bundler processes..."
kill $(lsof -ti:8081) 2>/dev/null || true

# Clear cache directories
echo "Clearing cache directories..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf .expo 2>/dev/null

# Rebuild and restart
echo "Rebuilding node modules and restarting..."
npm install
npm start -- --clear

echo "App should be running with fresh cache!"
