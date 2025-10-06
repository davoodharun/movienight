#!/bin/bash

echo "🚀 Uploading config to Fly.io app..."

# Create the data directory
flyctl ssh console -C "mkdir -p /app/data"

# Upload the config file
echo "📤 Uploading config.json..."
cat src/data/config.json | flyctl ssh console -C "cat > /app/data/config.json"

echo "✅ Config uploaded successfully!"
echo "🔄 Restarting app to load new config..."
flyctl apps restart

echo "🎬 Your Halloween movie selection is now live!"
echo "Visit: https://movieschedule-davoodharun.fly.dev/"
