#!/bin/bash
# Creavidy Dev Server Start Script
# This script starts the development server in the background
# and allows it to keep running even after you close the terminal.

cd /Users/demi/Documents/Creavidy

# Kill any existing process on port 3005
lsof -t -i:3005 | xargs kill -9 2>/dev/null || true

# Start the server with nohup (keeps running after terminal closes)
nohup npm run dev -- -p 3005 > /tmp/creavidy_server.log 2>&1 &

echo "✅ Creavidy dev server started on http://localhost:3005"
echo "📋 Logs are being written to /tmp/creavidy_server.log"
echo "🛑 To stop the server, run: lsof -t -i:3005 | xargs kill -9"
