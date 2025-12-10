#!/bin/bash
# Script para configurar webhooks de Stripe
# Uso: bash setup-stripe-webhooks.sh

echo "========================================="
echo "  Configurador de Webhooks - Stripe"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Paso 1: Obtener tus Keys de Stripe${NC}"
echo "========================================="
echo ""
echo "1. Abre https://dashboard.stripe.com"
echo "2. Click en 'Developers' en el menú superior"
echo "3. Click en 'API keys'"
echo ""
read -p "¿Ya copiaste tu STRIPE_SECRET_KEY? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Por favor, copia tu Secret Key primero${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Paso 2: Determinar tu URL de Webhook${NC}"
echo "========================================="
echo ""
echo "¿Dónde vas a deployar?"
echo "1. Railway.app"
echo "2. Vercel"
echo "3. Heroku"
echo "4. Otra (ingresaré manualmente)"
echo ""
read -p "Selecciona (1-4): " deploy_choice

case $deploy_choice in
    1)
        echo -e "${YELLOW}Has seleccionado Railway.app${NC}"
        echo ""
        echo "Tu URL será algo como: https://crepa-urbana-backend-prod.railway.app"
        echo "El webhook debe estar en: https://crepa-urbana-backend-prod.railway.app/api/webhooks/stripe"
        echo ""
        read -p "Ingresa tu URL base de Railway: " webhook_base_url
        webhook_url="${webhook_base_url}/api/webhooks/stripe"
        ;;
    2)
        echo -e "${YELLOW}Has seleccionado Vercel${NC}"
        read -p "Ingresa tu URL base de Vercel: " webhook_base_url
        webhook_url="${webhook_base_url}/api/webhooks/stripe"
        ;;
    3)
        echo -e "${YELLOW}Has seleccionado Heroku${NC}"
        read -p "Ingresa tu URL base de Heroku: " webhook_base_url
        webhook_url="${webhook_base_url}/api/webhooks/stripe"
        ;;
    4)
        read -p "Ingresa la URL completa del webhook: " webhook_url
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Paso 3: Configurar Webhook en Stripe${NC}"
echo "========================================="
echo ""
echo "1. Abre https://dashboard.stripe.com/webhooks"
echo "2. Click en botón azul 'Add endpoint'"
echo ""
echo -e "${GREEN}URL a ingresar:${NC}"
echo -e "${YELLOW}${webhook_url}${NC}"
echo ""
echo "3. En 'Events to send', selecciona estos eventos:"
echo "   ✓ payment_intent.succeeded"
echo "   ✓ payment_intent.payment_failed"
echo "   ✓ charge.refunded"
echo "   ✓ payment_intent.canceled"
echo ""
echo "4. Click en 'Add endpoint'"
echo ""

read -p "¿Ya creaste el endpoint? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Por favor, crea el endpoint en Stripe primero${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Paso 4: Obtener Webhook Signing Secret${NC}"
echo "========================================="
echo ""
echo "1. En la lista de webhooks, click en el que acabas de crear"
echo "2. Busca 'Signing secret' cerca del final de la página"
echo "3. Click en 'Reveal' para mostrar la clave"
echo ""
read -p "Copia el Signing secret y pégalo aquí: " webhook_secret

if [ -z "$webhook_secret" ]; then
    echo -e "${RED}El webhook secret no puede estar vacío${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Paso 5: Guardar en .env${NC}"
echo "========================================="
echo ""
echo "Ahora necesitas agregar estas variables a tu archivo .env:"
echo ""
echo -e "${YELLOW}STRIPE_WEBHOOK_SECRET=${webhook_secret}${NC}"
echo ""

# Verificar si existe .env
if [ -f ".env" ]; then
    echo -e "${GREEN}Archivo .env encontrado${NC}"
    echo ""
    
    # Verificar si la variable ya existe
    if grep -q "STRIPE_WEBHOOK_SECRET" .env; then
        echo "La variable STRIPE_WEBHOOK_SECRET ya existe en .env"
        read -p "¿Deseas reemplazarla? (s/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            sed -i.bak "s/^STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=${webhook_secret}/" .env
            echo -e "${GREEN}Variable actualizada en .env${NC}"
        fi
    else
        echo "STRIPE_WEBHOOK_SECRET=${webhook_secret}" >> .env
        echo -e "${GREEN}Variable agregada a .env${NC}"
    fi
else
    echo -e "${RED}No se encontró archivo .env${NC}"
    echo "Por favor, copia esta línea en tu archivo .env:"
    echo "STRIPE_WEBHOOK_SECRET=${webhook_secret}"
fi

echo ""
echo -e "${BLUE}Paso 6: Verificar en Railway${NC}"
echo "========================================="
echo ""
echo "Si estás usando Railway:"
echo "1. Abre https://railway.app"
echo "2. Selecciona tu proyecto 'crepa-urbana-backend'"
echo "3. Click en 'Variables'"
echo "4. Agrega estas variables:"
echo ""
echo -e "${YELLOW}STRIPE_PUBLIC_KEY${NC}=pk_test_xxxxxxxxxxxxxxxxxxxxx"
echo -e "${YELLOW}STRIPE_SECRET_KEY${NC}=sk_test_xxxxxxxxxxxxxxxxxxxxx"
echo -e "${YELLOW}STRIPE_WEBHOOK_SECRET${NC}=${webhook_secret}"
echo ""

echo ""
echo -e "${GREEN}✓ Configuración completada!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Reinicia tu servidor (o redeploy en Railway)"
echo "2. Prueba los webhooks con Stripe CLI (ver STRIPE_GUIDE.md)"
echo "3. Realiza un pago de prueba"
echo ""
echo "Para más información, ver: STRIPE_GUIDE.md"
