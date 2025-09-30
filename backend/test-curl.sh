#!/bin/bash
# Test de recordatorios con cURL

echo "🧪 Test de Recordatorios - cURL"
echo "================================"
echo ""

# Verificar que el backend esté ejecutándose
echo "📡 Verificando backend..."
curl -s http://localhost:4000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend funcionando en http://localhost:4000"
else
    echo "❌ Backend no está ejecutándose. Ejecuta: npm start"
    exit 1
fi

echo ""
echo "📧 Ejecutando procesamiento manual de recordatorios..."

# Ejecutar procesamiento de recordatorios
curl -X POST http://localhost:4000/api/reminders/process \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Procesamiento completado!"
echo "📋 Revisa los logs del backend para ver detalles"
echo "📧 Si hay citas próximas, se enviarán emails automáticamente"