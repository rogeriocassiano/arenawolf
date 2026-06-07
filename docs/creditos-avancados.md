# Sistema Avançado de Créditos — Arena Wolf

## 1. Gift Cards / Códigos Promocionais

### Casos de uso
- Distribuir em eventos ("Use o código WOLF2025 para ganhar 2h grátis")
- Recuperar cliente inativo (email com código de volta)
- Parcerias (código exclusivo para alunos de escola parceira)

### Implementação
```sql
-- Nova tabela
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,           -- ex: "WOLF2025"
  type TEXT NOT NULL,                  -- 'fixed' | 'percentage' | 'bonus_hours'
  value INTEGER NOT NULL,              -- minutos ou %
  max_uses INTEGER DEFAULT 1,          -- NULL = ilimitado
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,             -- NULL = não expira
  created_by UUID REFERENCES profiles(id),
  active BOOLEAN DEFAULT TRUE
);

-- Uso por usuário (evitar mesmo usuário usar 2x)
CREATE TABLE promo_code_uses (
  code_id UUID REFERENCES promo_codes(id),
  user_id UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (code_id, user_id)
);
```

### Admin UI
- `/admin/promocodes` — gerar, ativar/desativar, ver estatísticas de uso
- Botão "Gerar código" → copiar para clipboard

---

## 2. Assinaturas / Planos Recorrentes

### Modelo
| Plano | Mensalidade | Créditos incluídos | Economia vs avulso |
|-------|-------------|-------------------|-------------------|
| Wolf Básico | R$ 49,90 | 20h (1200min) | ~15% |
| Wolf Gamer | R$ 89,90 | 40h (2400min) | ~25% |
| Wolf Pro | R$ 149,90 | 80h (4800min) | ~35% |

### Funcionalidades
- Renovação automática (Stripe/Pagar.me)
- Créditos adicionados no 1º dia de cada mês
- Upgrade/downgrade de plano (prorata)
- Freeze: pausar por 1 mês (férias)

### SQL
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_id TEXT NOT NULL,               -- 'basic' | 'gamer' | 'pro'
  status TEXT DEFAULT 'active',        -- 'active' | 'paused' | 'cancelled'
  credits_per_cycle INTEGER NOT NULL,
  next_credit_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);

-- Cron job diário adiciona créditos quando next_credit_at <= now()
```

---

## 3. Cashback na Loja

### Regra
- 10% do valor gasto em **produtos** volta como créditos
- Ex: Compra R$ 10,00 de energético → ganha 60 minutos

### Implementação
```typescript
// Em purchaseProduct()
const cashbackMinutes = Math.floor(product.price * 0.10 * 6); // 10% em minutos
await addCredits(userId, cashbackMinutes, 'cashback', `Cashback: ${product.name}`);
```

---

## 4. Programa de Indicação

### Fluxo
1. Usuário recebe link único: `/r/ABC123`
2. Amigo se cadastra via link
3. Quando amigo faz 1ª compra de créditos:
   - Amigo ganha: 30 min bônus
   - Indicador ganha: 10% do valor em créditos

### SQL
```sql
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  reward_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',       -- 'pending' | 'credited'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Créditos Expiráveis (Urgência)

### Conceito
- Créditos "bônus" (promoção/indicação) expiram em 30 dias
- Créditos "pagos" (compra) não expiram
- Visualização: cores diferentes (amarelo = expira em 7 dias)

### SQL
```sql
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,                  -- 'paid' | 'bonus' | 'promo'
  expires_at TIMESTAMPTZ,              -- NULL = não expira
  created_at TIMESTAMPTZ DEFAULT now()
);

-- View consolidada
CREATE VIEW user_credits_summary AS
SELECT 
  user_id,
  SUM(CASE WHEN expires_at IS NULL OR expires_at > now() THEN amount ELSE 0 END) as available,
  SUM(CASE WHEN expires_at <= now() + interval '7 days' THEN amount ELSE 0 END) as expiring_soon
FROM credit_balances
GROUP BY user_id;
```

---

## 6. Preço Dinâmico (Yield Management)

### Ideia
- Horários de pico (19h-23h, sábado): preço normal
- Horários vazios (06h-12h, domingo manhã): 30% OFF

### Implementação
```typescript
const dynamicPricing = {
  '06:00-12:00': 0.70,  // 30% off
  '12:00-19:00': 1.00,  // normal
  '19:00-23:00': 1.00,  // normal
  '23:00-06:00': 0.80,  // 20% off
  'sunday': 0.60,       // 40% off
};

// Mostrar no painel: "Agora: 40% OFF — aproveite!"
```

---

## 7. Reserva com Hold de Créditos

### Problema atual
- Usuário reserva mas não aparece → PC ficou bloqueado, créditos intactos

### Solução
- Reserva **consome** créditos antecipadamente (hold)
- Se não comparecer em 15 min → cancela e devolve créditos (menos taxa de 10%)
- Garante comprometimento

```sql
-- Novo campo em reservations
ALTER TABLE reservations ADD COLUMN credits_held INTEGER;
ALTER TABLE reservations ADD COLUMN no_show BOOLEAN DEFAULT FALSE;
```

---

## 8. Dashboard de Créditos para Usuário

### O que mostrar
```
┌─────────────────────────────────────┐
│  Seus Créditos: 1.240 minutos       │
│  💰 Pagos: 1.000 (nunca expiram)    │
│  🎁 Bônus: 240 (expira em 5 dias)   │
├─────────────────────────────────────┤
│  Histórico:                         │
│  • +60min — Compra Pacote 1h        │
│  • -45min — Sessão Wolf-01          │
│  • +30min — Indicação (João)        │
│  • +60min — Cashback Monster        │
└─────────────────────────────────────┘
```

### API necessária
```typescript
GET /api/credits/history     // lista transações
GET /api/credits/balance     // saldo detalhado por tipo
POST /api/credits/transfer   // transferir para amigo (com taxa 5%)
```

---

## Prioridade de Implementação

| # | Feature | Impacto Receita | Esforço | Prioridade |
|---|---------|-----------------|---------|------------|
| 1 | Gift Cards | ⭐⭐⭐⭐⭐ | Médio | 🔥 P1 |
| 2 | Assinaturas | ⭐⭐⭐⭐⭐ | Alto | 🔥 P1 |
| 3 | Preço Dinâmico | ⭐⭐⭐⭐ | Baixo | ⚡ P2 |
| 4 | Cashback | ⭐⭐⭐ | Baixo | ⚡ P2 |
| 5 | Indicação | ⭐⭐⭐⭐ | Médio | ⚡ P2 |
| 6 | Hold em Reservas | ⭐⭐⭐ | Médio | 📋 P3 |
| 7 | Créditos Expiráveis | ⭐⭐ | Alto | 📋 P3 |
| 8 | Transferência | ⭐ | Médio | 📋 P3 |

---

## Próximo passo recomendado

**Implementar Gift Cards** — mais ROI rápido:
1. Gerar código promocional
2. Usuário digita no site → créditos adicionados
3. Marketing pode distribuir em eventos

Quer que eu implemente algum desses agora?
