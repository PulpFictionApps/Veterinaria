#!/bin/bash

# Script para aplicar ThemedComponents masivamente en todas las páginas

# Lista de archivos a procesar
files=(
  "src/app/dashboard/appointments/page.tsx"
  "src/app/dashboard/appointments/new/page.tsx"
  "src/app/dashboard/appointments/[id]/edit/page.tsx"
  "src/app/dashboard/appointments/[id]/consult/page.tsx"
  "src/app/dashboard/clients/[id]/page.tsx"
  "src/app/dashboard/clients/[id]/pets/[petId]/page.tsx"
  "src/app/dashboard/clients/[id]/pet/new/page.tsx"
  "src/app/dashboard/clients/[id]/pets/[petId]/records/new/page.tsx"
  "src/app/dashboard/clients/[id]/pets/[petId]/prescriptions/new/page.tsx"
  "src/app/dashboard/calendar/page.tsx"
  "src/app/dashboard/profile/page.tsx"
  "src/app/dashboard/billing/page.tsx"
  "src/app/dashboard/settings/page.tsx"
)

echo "🚀 Iniciando refactorización masiva de ThemedComponents..."

# Patrones de reemplazo más comunes
declare -A replacements=(
  # Botones básicos azules/médicos
  ["className=\".*bg-blue-600.*text-white.*px-\\d+.*py-\\d+.*rounded.*\""]="ThemedButton variant=\"medical\""
  
  # Botones de éxito/guardar
  ["className=\".*bg-green-600.*text-white.*\""]="ThemedButton variant=\"health\""
  
  # Botones de error/eliminar  
  ["className=\".*bg-red-600.*text-white.*\""]="ThemedButton variant=\"emergency\""
  
  # Botones outline/cancelar
  ["className=\".*border.*text-.*border-.*hover:bg-.*\""]="ThemedButton variant=\"outline\""
  
  # Cards básicas
  ["className=\".*bg-white.*rounded.*shadow.*border.*\""]="ThemedCard"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Procesando: $file"
    
    # Agregar imports si no existen
    if ! grep -q "import ThemedCard" "$file"; then
      sed -i "1a import ThemedCard from '../../../components/ui/ThemedCard';" "$file"
      sed -i "2a import ThemedButton from '../../../components/ui/ThemedButton';" "$file"
      sed -i "3a import ThemedInput from '../../../components/ui/ThemedInput';" "$file"
    fi
    
    echo "✅ Completado: $file"
  else
    echo "❌ No encontrado: $file"
  fi
done

echo "🎉 Refactorización masiva completada!"