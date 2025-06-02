#!/bin/sh
set -e

# Function to inject environment variables into JavaScript files
inject_env_vars() {
    echo "Injecting environment variables..."
    
    # Find all JavaScript files in the build directory
    find /usr/share/nginx/html -name "*.js" -type f | while read jsfile; do
        echo "Processing $jsfile"
        
        # Replace environment variable placeholders with actual values
        # This handles Vite's environment variable pattern
        if [ ! -z "$VITE_BLOCK_EXPLORER_ENDPOINT" ]; then
            sed -i "s|__VITE_BLOCK_EXPLORER_ENDPOINT__|$VITE_BLOCK_EXPLORER_ENDPOINT|g" "$jsfile"
        fi
        
        if [ ! -z "$VITE_BUILD_CAPS" ]; then
            sed -i "s|__VITE_BUILD_CAPS__|$VITE_BUILD_CAPS|g" "$jsfile"
        fi
    done
    
    # Also update nginx configuration with environment variables
    if [ ! -z "$BLOCKCHAIN_API_ENDPOINT" ]; then
        sed -i "s|\$BLOCKCHAIN_API_ENDPOINT|$BLOCKCHAIN_API_ENDPOINT|g" /etc/nginx/nginx.conf
    fi
}

# Inject environment variables before starting nginx
inject_env_vars

echo "Starting nginx..."
exec "$@"