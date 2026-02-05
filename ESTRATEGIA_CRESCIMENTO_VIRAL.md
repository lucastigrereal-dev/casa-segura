# 🚀 ESTRATÉGIA DE CRESCIMENTO VIRAL - Casa Segura

**Modelo**: Uber/99 nos primeiros anos
**Objetivo**: 10.000 profissionais + 50.000 clientes em 6 meses
**Budget**: Growth hacking (baixo custo, alto impacto)

---

## 🎯 FASE 1: VIRALIZAÇÃO (Meses 1-6)

### Meta Principal: VOLUME DE CADASTROS

**KPIs**:
- Profissionais ativos: 10.000
- Clientes cadastrados: 50.000
- Jobs completados: 5.000/mês
- Taxa de crescimento: 40% mês a mês

---

## 🔥 AÇÃO 1: REFERRAL PROGRAM AGRESSIVO (Semana 1)

### Para Profissionais:

**Convite de Profissional**:
```
Indica outro profissional → Você ganha R$ 200 quando ele completar 5 jobs
Profissional indicado → Ganha R$ 100 no 1º job completo

BÔNUS EXPLOSIVO:
- Indica 5 profissionais = R$ 1.000 + Badge "Recrutador Ouro"
- Indica 10 profissionais = R$ 2.500 + 0% comissão por 30 dias
```

**Por que funciona**:
- Profissionais conhecem outros profissionais
- R$ 200 é muito dinheiro para uma indicação
- Cria efeito bola de neve

### Para Clientes:

**Convite de Cliente**:
```
Você indica amigo → Ambos ganham R$ 50 de crédito
Amigo completa 1º job → Você ganha +R$ 50 (total R$ 100!)

BÔNUS:
- Indica 3 amigos = +R$ 100 extra
- Indica 10 amigos = Job grátis até R$ 300
```

### Implementação Técnica:

**Backend** (1 dia):
```typescript
// apps/api/src/modules/referrals/referrals.service.ts
class ReferralsService {
  async createReferralCode(userId: string) {
    // Gera código único: CASA-LUCAS-XYZ
    const code = `CASA-${user.name.toUpperCase()}-${randomString()}`;

    return this.prisma.referralCode.create({
      data: { user_id: userId, code, credits_per_use: 5000 }
    });
  }

  async applyReferral(code: string, newUserId: string) {
    // Dá R$ 50 para ambos
    await this.giveCredits(referrer, 5000); // R$ 50
    await this.giveCredits(newUser, 5000);  // R$ 50

    // Tracking para bônus
    await this.trackReferralProgress(referrer);
  }
}
```

**Frontend** (1 dia):
```tsx
// Tela "Convide Amigos"
<ShareReferralScreen>
  <h1>Ganhe R$ 100 por amigo!</h1>
  <ReferralCode>CASA-LUCAS-ABC</ReferralCode>

  <ShareButtons>
    <WhatsAppShare /> {/* Já com mensagem pronta */}
    <InstagramShare />
    <FacebookShare />
    <CopyLink />
  </ShareButtons>

  <ReferralStats>
    Você indicou: 3 amigos
    Ganhos: R$ 150
    Faltam 2 para ganhar R$ 100 extra!
  </ReferralStats>
</ShareReferralScreen>
```

**Mensagem WhatsApp Pronta**:
```
🏠 Opa! Descobri um app INCRÍVEL pra achar profissionais!

Casa Segura - elétrica, hidráulica, reforma, etc.

Usa meu código: CASA-LUCAS-ABC
A gente GANHA R$ 50 cada! 💰

Download: [link]
```

---

## 🔥 AÇÃO 2: CADASTRO PROFISSIONAL EM 60 SEGUNDOS (Semana 1)

### Problema Uber Resolveu:
- Motorista cadastrava em 5min pelo app
- Aprovação instantânea
- Começava a trabalhar NO MESMO DIA

### Nossa Solução:

**Cadastro Super Rápido**:
```
ETAPA 1 (30s):
- Nome
- Telefone (com código SMS)
- Categoria (Eletricista, Encanador, etc.)
- CEP (define raio de atuação)

ETAPA 2 (30s):
- Foto do rosto (tira na hora)
- Foto documento (tira na hora)
- ✅ PRONTO! Já pode receber jobs!

ETAPA 3 (Depois, opcional):
- Adicionar portfólio
- Completar perfil
- Adicionar certificados
```

**Gamificação do Perfil**:
```
Perfil: 40% completo

Complete para desbloquear:
□ 60% → Aparecer em destaque (+30% jobs)
□ 80% → Badge "Perfil Verificado"
□ 100% → R$ 50 de bônus + Selo Ouro
```

### Código (2 dias):

```typescript
// Cadastro em etapas
const ONBOARDING_STEPS = [
  { id: 1, required: true,  fields: ['name', 'phone', 'category', 'cep'] },
  { id: 2, required: true,  fields: ['photo', 'document'] },
  { id: 3, required: false, fields: ['bio', 'portfolio', 'certificates'] }
];

// Profissional pode trabalhar após step 2
if (professional.onboarding_step >= 2) {
  professional.can_receive_jobs = true;
}
```

---

## 🔥 AÇÃO 3: PRIMEIRO JOB GRÁTIS (Semana 2)

### Estratégia Uber:
- Primeira corrida grátis (até R$ 20)
- Cliente experimenta sem risco
- Viciam no app

### Nossa Versão:

**Para Clientes**:
```
🎁 PRIMEIRO JOB ATÉ R$ 100 - GRÁTIS!

Como funciona:
1. Crie seu primeiro chamado
2. Aceite proposta (até R$ 100)
3. Job concluído = 100% grátis!

Sem pegadinha. Sem cartão de crédito.
```

**Para Profissionais** (absorvemos o custo):
```
🚀 PRIMEIROS 3 JOBS - ZERO COMISSÃO!

Seus primeiros 3 jobs completos:
- Você recebe 100% do valor
- Casa Segura assume o custo
- Depois: comissão normal de 15%

BÔNUS: Complete os 3 jobs em 7 dias → +R$ 100!
```

### Matemática:

**Custo de Aquisição**:
- Job grátis R$ 100 + Comissão zero (R$ 45) = R$ 145 por cliente
- LTV (Lifetime Value) esperado: R$ 800 (10 jobs x R$ 80 comissão média)
- ROI: 5.5x

### Implementação (2 dias):

```typescript
class PromotionsService {
  async applyFirstJobFree(jobId: string, userId: string) {
    const user = await this.findUser(userId);

    if (user.total_jobs === 0 && job.amount <= 10000) {
      // Primeiro job até R$ 100 = grátis
      await this.createPromotion({
        user_id: userId,
        job_id: jobId,
        type: 'FIRST_JOB_FREE',
        discount_amount: job.amount, // 100% desconto
        max_value: 10000 // R$ 100
      });
    }
  }
}
```

---

## 🔥 AÇÃO 4: BLITZ DE CADASTRO PRESENCIAL (Semana 3-4)

### Estratégia Uber:
- Equipes nas ruas cadastrando motoristas
- Stands em estacionamentos, postos
- Bônus para cadastrar na hora

### Nossa Versão:

**"Mutirão Casa Segura"**:

**Locais**:
```
📍 Lojas de Material de Construção
📍 Sindicatos de Trabalhadores
📍 Cursos Técnicos (SENAI, SENAC)
📍 Feiras de Construção
📍 Mercados Populares
```

**Equipe no Local**:
```
2 pessoas com:
- Tablet/Celular para cadastrar
- Banner chamativo
- Flyers com QR Code
- Brindes (bonés, camisetas)

Oferta:
"Cadastre AGORA e ganhe R$ 50 no 1º job!"
```

**Script de Abordagem**:
```
"Oi, você trabalha com [elétrica/hidráulica]?

Temos um APP que conecta você com clientes.
Você recebe jobs DIRETO no celular!

Cadastro leva 1 minuto.
Ganhe R$ 50 no primeiro job!

Vamos cadastrar agora?"
```

**Meta**: 100 profissionais/dia = 1.400 em 2 semanas

### Custo por Profissional:
- Equipe: R$ 500/dia (2 pessoas)
- Brindes: R$ 300/dia
- Bônus R$ 50 x 100 = R$ 5.000/dia
- **Total**: R$ 5.800/dia ÷ 100 = R$ 58 por profissional

---

## 🔥 AÇÃO 5: PARCERIAS ESTRATÉGICAS (Semana 3+)

### Parceria com Lojas de Material:

**Proposta para Loja**:
```
🤝 Parceria Leroy Merlin / Telhanorte

PARA LOJA:
- QR Code do Casa Segura na saída
- "Comprou material? Precisa de instalador?"
- Loja ganha 5% de comissão em jobs gerados
- Branding: "Parceiro Casa Segura"

PARA CLIENTES:
- Desconto 10% no material + instalação
- Tudo integrado no app
```

**Potencial**:
- 1 loja grande = 500 clientes/mês
- 10 lojas = 5.000 novos clientes/mês

### Parceria com Imobiliárias:

```
🏢 Parceria Imobiliárias

PARA IMOBILIÁRIA:
- Cliente alugou/comprou? Precisa de reparos?
- Imobiliária indica Casa Segura
- Comissão 10% em jobs
- Branding conjunto

PARA CLIENTES:
- "Recomendado pela [Imobiliária]"
- Primeiro job com desconto
```

### Parceria com Condomínios:

```
🏘️ Programa "Condomínio Seguro"

PARA SÍNDICO:
- Lista de profissionais verificados
- Preços tabelados
- Relatórios mensais
- Síndico ganha cashback

PARA MORADORES:
- Profissionais já aprovados pelo condomínio
- Confiança total
```

---

## 📊 CRONOGRAMA DE IMPLEMENTAÇÃO

### Semana 1:
- [ ] Implementar Referral Program (2 devs, 3 dias)
- [ ] Simplificar cadastro para 60s (1 dev, 2 dias)
- [ ] Setup analytics (1 dev, 1 dia)

### Semana 2:
- [ ] Lançar "Primeiro Job Grátis" (2 devs, 2 dias)
- [ ] Criar landing pages de conversão (1 designer, 3 dias)
- [ ] Setup email marketing (1 pessoa, 1 dia)

### Semana 3-4:
- [ ] Contratar equipe de campo (2 pessoas)
- [ ] Preparar material (flyers, banners)
- [ ] Mutirão em 10 locais (2 semanas)

### Semana 5-6:
- [ ] Fechar 3 parcerias com lojas
- [ ] Fechar 5 parcerias com imobiliárias
- [ ] Implementar sistema de parceiros (1 dev, 1 semana)

---

## 💰 ORÇAMENTO FASE 1 (Primeiros 2 meses)

| Item | Custo Mensal | Total 2 meses |
|------|--------------|---------------|
| **Referral Program** | R$ 10.000 | R$ 20.000 |
| Bônus cadastro (500 x R$ 50) | R$ 25.000 | R$ 50.000 |
| Jobs grátis (200 x R$ 100) | R$ 20.000 | R$ 40.000 |
| Equipe de campo (2 pessoas) | R$ 8.000 | R$ 16.000 |
| Material marketing | R$ 2.000 | R$ 4.000 |
| Ads Facebook/Google | R$ 5.000 | R$ 10.000 |
| **TOTAL** | **R$ 70.000** | **R$ 140.000** |

**ROI Esperado**:
- 2.000 profissionais ativos
- 10.000 clientes cadastrados
- 1.000 jobs/mês (R$ 15 comissão média) = R$ 15.000/mês
- Payback: ~10 meses
- Após payback: R$ 15k/mês → R$ 180k/ano

---

## 📈 MÉTRICAS DE SUCESSO

### Mês 1:
- ✅ 500 profissionais cadastrados
- ✅ 2.000 clientes cadastrados
- ✅ 100 jobs completados
- ✅ NPS > 50

### Mês 3:
- ✅ 2.000 profissionais
- ✅ 10.000 clientes
- ✅ 500 jobs/mês
- ✅ NPS > 60

### Mês 6:
- ✅ 10.000 profissionais
- ✅ 50.000 clientes
- ✅ 5.000 jobs/mês
- ✅ NPS > 70
- ✅ Break-even

---

## 🚦 GATILHO PARA FASE 2

**Quando ativar a IA Orientadora**:

✅ 5.000+ profissionais ativos
✅ 2.000+ jobs/mês
✅ NPS > 65
✅ Taxa de conclusão > 85%
✅ Receita > R$ 50k/mês

**Estimativa**: Mês 4-6

---

## 🎯 CHECKLIST SEMANAL

### Toda Segunda:
- [ ] Revisar métricas da semana anterior
- [ ] Definir meta da semana
- [ ] Alocar budget

### Toda Quarta:
- [ ] Check-in com equipe de campo
- [ ] Analisar conversão de cadastros
- [ ] Ajustar campanhas

### Toda Sexta:
- [ ] Report semanal (cadastros, jobs, receita)
- [ ] Celebrar wins
- [ ] Planejar semana seguinte

---

**Pronto para COMEÇAR? Me diz e eu gero os códigos! 🚀**
