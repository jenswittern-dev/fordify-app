#!/bin/bash
# Telegram Webhook bei fordify Bot registrieren
# Aufruf: bash scripts/n8n-register-webhook.sh

BOT_TOKEN=$(grep -m1 "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
WEBHOOK_URL="https://n8n.srv1063720.hstgr.cloud/webhook/fordify-telegram"

echo "Registriere Webhook: $WEBHOOK_URL"
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"

echo ""
echo "--- Status ---"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
