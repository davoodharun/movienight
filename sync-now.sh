#!/bin/bash
echo "🎬 Syncing Halloween movies to live app..."

# Create a simple sync using flyctl
flyctl ssh console -C "rm -f /app/data/config.json"
echo "Uploading your Halloween movie config..."

# Use base64 to transfer the file safely
base64 -w 0 src/data/config.json > /tmp/config_b64.txt
flyctl ssh console -C "base64 -d > /app/data/config.json" < /tmp/config_b64.txt
rm /tmp/config_b64.txt

echo "Restarting app to load new config..."
flyctl restart

echo "✅ Done! Your Halloween movies should now be live!"
echo "🌐 Check your app at: https://movieschedule-davoodharun.fly.dev"
