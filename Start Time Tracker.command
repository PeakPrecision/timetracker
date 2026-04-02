#!/bin/bash
cd "$(dirname "$0")"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node &>/dev/null; then
  echo "Node.js is not installed."
  echo "Please download it from https://nodejs.org and run this file again."
  read -p "Press Enter to close..."
  exit 1
fi

echo "Installing dependencies (this may take a minute)..."
npm install

if [ $? -ne 0 ]; then
  echo ""
  echo "ERROR: npm install failed. Please check your internet connection and try again."
  read -p "Press Enter to close..."
  exit 1
fi

echo ""
echo "========================================"
echo "  Time Tracker is running!"
echo "  Open this in your browser:"
echo "  http://localhost:3001"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

node server.js
