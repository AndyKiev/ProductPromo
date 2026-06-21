#!/bin/bash
set -e
KEYS_DIR="$(dirname "$0")/backend/auth/keys"
mkdir -p "$KEYS_DIR"
if [ ! -f "$KEYS_DIR/jwt-private.pem" ] || [ ! -f "$KEYS_DIR/jwt-public.pem" ]; then
    echo "Generating JWT keys..."
    openssl genrsa -out "$KEYS_DIR/jwt-private.pem" 2048
    openssl rsa -in "$KEYS_DIR/jwt-private.pem" -outform PEM -pubout -out "$KEYS_DIR/jwt-public.pem"
    chmod 644 "$KEYS_DIR/jwt-private.pem" "$KEYS_DIR/jwt-public.pem"
else
    echo "JWT keys already exist."
fi
