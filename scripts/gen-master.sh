#!/bin/bash
# Master script: runs all category generators sequentially
# Each category script handles its own retry and delay logic

SCRIPTS_DIR="/home/z/my-project/scripts"
LOGFILE="/home/z/my-project/scripts/master-gen.log"

echo "[$(date +%H:%M:%S)] ========== MASTER GENERATION STARTED ==========" >> "$LOGFILE"

# Make all scripts executable
chmod +x "$SCRIPTS_DIR"/gen-*.sh

# Wait for gaming to finish if still running
while pgrep -f "gen-all-gaming.sh" > /dev/null 2>&1; do
  echo "[$(date +%H:%M:%S)] Waiting for gaming generation to finish..." >> "$LOGFILE"
  sleep 30
done
echo "[$(date +%H:%M:%S)] Gaming generation complete, starting next categories..." >> "$LOGFILE"

# Run remaining categories sequentially
for script in gen-streaming.sh gen-accounts.sh gen-giftcards.sh gen-software.sh gen-subscriptions.sh; do
  echo "[$(date +%H:%M:%S)] Starting $script..." >> "$LOGFILE"
  bash "$SCRIPTS_DIR/$script"
  echo "[$(date +%H:%M:%S)] $script finished." >> "$LOGFILE"
  # Small break between categories
  sleep 15
done

echo "[$(date +%H:%M:%S)] ========== ALL CATEGORIES COMPLETE ==========" >> "$LOGFILE"
echo "[$(date +%H:%M:%S)] Total images generated: $(ls /home/z/my-project/public/products/gen/*.png 2>/dev/null | wc -l)" >> "$LOGFILE"
