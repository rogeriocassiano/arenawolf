#!/bin/bash
# ============================================================
# Arena Wolf — Aplicar schema no Supabase
# Uso: ./supabase/apply-schema.sh
# ============================================================

set -e

# Carrega o .env.local
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
else
  echo "❌ .env.local não encontrado. Crie-o primeiro."
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL não encontrada no .env.local"
  exit 1
fi

echo "🐺 Arena Wolf — Aplicando schema no Supabase..."
echo "📡 Projeto: $NEXT_PUBLIC_SUPABASE_URL"

# Executa via REST API do Supabase (requer psql ou supabase CLI)
# Opção 1: supabase CLI (recomendado)
if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI encontrado"
  supabase db push --db-url "$DATABASE_URL" < supabase/schema.sql
  echo "✅ Schema aplicado com sucesso!"
else
  echo "⚠️  Supabase CLI não encontrado."
  echo ""
  echo "Para aplicar o schema, use uma das opções:"
  echo ""
  echo "1. Acesse o SQL Editor do Supabase:"
  echo "   https://supabase.com/dashboard/project/uxxuspwortgwqaftcfrw/sql/new"
  echo "   Cole o conteúdo de: supabase/schema.sql"
  echo ""
  echo "2. Instale o Supabase CLI:"
  echo "   brew install supabase/tap/supabase"
  echo "   supabase login"
  echo "   supabase link --project-ref uxxuspwortgwqaftcfrw"
  echo "   supabase db push"
  echo ""
fi
