#!/usr/bin/env bash
set -euo pipefail

image="${1:?A built container image is required}"
secrets='RESEND_API_KEY=RESEND_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,SANITY_API_READ_TOKEN=SANITY_API_READ_TOKEN:latest,FIREBASE_ADMIN_PRIVATE_KEY=FIREBASE_ADMIN_PRIVATE_KEY:latest'

# WhatsApp is an optional runtime integration, not a website build dependency.
# Inspect version metadata only; never read credential values into build logs.
for name in WHATSAPP_ACCESS_TOKEN WHATSAPP_VERIFY_TOKEN WHATSAPP_APP_SECRET WHATSAPP_PHONE_NUMBER_ID; do
  if state="$(gcloud secrets versions describe latest --secret="$name" --format='value(state)' 2>/dev/null)" && [[ "$state" == 'ENABLED' ]]; then
    secrets+=",$name=$name:latest"
  else
    printf 'Optional secret %s unavailable; preserving its existing runtime setting.\n' "$name"
  fi
done

# --update-secrets preserves existing mappings and plain environment variables.
gcloud run deploy lionovart-next-tailwind \
  --image "$image" \
  --region us-central1 \
  --allow-unauthenticated \
  --timeout 1800 \
  --update-secrets "$secrets"
