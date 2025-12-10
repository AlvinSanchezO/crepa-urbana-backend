#!/bin/bash
# Verificador de Configuración de Stripe
# Uso: bash verify-stripe-config.sh

echo "========================================="
echo "  Verificador de Configuración Stripe"
echo "========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

errors=0
warnings=0

echo -e "${BLUE}Verificando archivos...${NC}"
echo ""

# 1. Verificar .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Archivo .env encontrado"
    
    if grep -q "STRIPE_PUBLIC_KEY" .env; then
        echo -e "${GREEN}  ✓${NC} STRIPE_PUBLIC_KEY definida"
    else
        echo -e "${YELLOW}  ⚠${NC} STRIPE_PUBLIC_KEY NO está definida"
        ((warnings++))
    fi
    
    if grep -q "STRIPE_SECRET_KEY" .env; then
        echo -e "${GREEN}  ✓${NC} STRIPE_SECRET_KEY definida"
    else
        echo -e "${YELLOW}  ⚠${NC} STRIPE_SECRET_KEY NO está definida"
        ((warnings++))
    fi
    
    if grep -q "STRIPE_WEBHOOK_SECRET" .env; then
        echo -e "${GREEN}  ✓${NC} STRIPE_WEBHOOK_SECRET definida"
    else
        echo -e "${YELLOW}  ⚠${NC} STRIPE_WEBHOOK_SECRET NO está definida"
        ((warnings++))
    fi
else
    echo -e "${RED}✗${NC} Archivo .env NO encontrado"
    echo "  Copia .env.example a .env y completa las variables"
    ((errors++))
fi

echo ""
echo -e "${BLUE}Verificando código...${NC}"
echo ""

# 2. Verificar modelo Transaction
if [ -f "src/models/Transaction.js" ]; then
    echo -e "${GREEN}✓${NC} Modelo Transaction.js existe"
else
    echo -e "${RED}✗${NC} Modelo Transaction.js NO existe"
    ((errors++))
fi

# 3. Verificar servicio de pagos
if [ -f "src/services/paymentService.js" ]; then
    echo -e "${GREEN}✓${NC} Servicio paymentService.js existe"
    
    if grep -q "createPaymentIntent" src/services/paymentService.js; then
        echo -e "${GREEN}  ✓${NC} Método createPaymentIntent definido"
    else
        echo -e "${RED}  ✗${NC} Método createPaymentIntent NO definido"
        ((errors++))
    fi
else
    echo -e "${RED}✗${NC} Servicio paymentService.js NO existe"
    ((errors++))
fi

# 4. Verificar controlador de pagos
if [ -f "src/controllers/paymentController.js" ]; then
    echo -e "${GREEN}✓${NC} Controlador paymentController.js existe"
else
    echo -e "${RED}✗${NC} Controlador paymentController.js NO existe"
    ((errors++))
fi

# 5. Verificar rutas de pagos
if [ -f "src/routes/paymentRoutes.js" ]; then
    echo -e "${GREEN}✓${NC} Rutas paymentRoutes.js existe"
else
    echo -e "${RED}✗${NC} Rutas paymentRoutes.js NO existe"
    ((errors++))
fi

# 6. Verificar webhook middleware
if [ -f "src/middlewares/webhookMiddleware.js" ]; then
    echo -e "${GREEN}✓${NC} Middleware webhookMiddleware.js existe"
else
    echo -e "${RED}✗${NC} Middleware webhookMiddleware.js NO existe"
    ((errors++))
fi

# 7. Verificar que app.js importa payment routes
if grep -q "paymentRoutes" src/app.js; then
    echo -e "${GREEN}✓${NC} Payment routes importadas en app.js"
else
    echo -e "${YELLOW}⚠${NC} Payment routes NO importadas en app.js"
    ((warnings++))
fi

# 8. Verificar tabla en BD
if grep -q "CREATE TABLE transactions" db/init_db.sql; then
    echo -e "${GREEN}✓${NC} Tabla transactions en init_db.sql"
else
    echo -e "${YELLOW}⚠${NC} Tabla transactions NO en init_db.sql"
    ((warnings++))
fi

echo ""
echo -e "${BLUE}Verificando documentación...${NC}"
echo ""

# 9. Verificar documentación
docs=("STRIPE_README.md" "STRIPE_GUIDE.md" "STRIPE_CONFIG_CHECKLIST.md" "STRIPE_WEBHOOKS_RAILWAY.md")

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc existe"
    else
        echo -e "${YELLOW}⚠${NC} $doc NO existe"
        ((warnings++))
    fi
done

echo ""
echo "========================================="
echo -e "${BLUE}Resumen:${NC}"
echo "========================================="
echo -e "${GREEN}Errores:${NC} $errors"
echo -e "${YELLOW}Advertencias:${NC} $warnings"

if [ $errors -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Configuración completa y lista para usar${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Obtener keys de Stripe en https://dashboard.stripe.com"
    echo "2. Configurar variables de entorno"
    echo "3. Crear webhook en Stripe Dashboard"
    echo "4. Hacer test con tarjeta de prueba"
    echo ""
    echo "Ver: STRIPE_CONFIG_CHECKLIST.md"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Hay errores que necesitan ser corregidos${NC}"
    echo ""
    echo "Revisa la instalación y asegúrate de que todos los archivos están en su lugar."
    exit 1
fi
