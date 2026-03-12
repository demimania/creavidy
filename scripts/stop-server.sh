#!/bin/bash
# Stop the Creavidy dev server

lsof -t -i:3005 | xargs kill -9 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Creavidy dev server stopped."
else
    echo "⚠️ No server was running on port 3005."
fi
