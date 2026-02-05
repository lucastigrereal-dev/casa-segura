# 🚀 COMECE HOJE - PLANO DE AÇÃO IMEDIATO

**Objetivo**: Bombar cadastros estilo Uber
**Prazo**: Próximas 2 semanas
**Meta**: 500 profissionais + 2.000 clientes

---

## ✅ SEMANA 1: IMPLEMENTAÇÃO RÁPIDA

### DIA 1 (HOJE) - Setup Básico

**Manhã (4h)**:
- [ ] Criar página "Indique e Ganhe"
- [ ] Gerar códigos de referral únicos
- [ ] Sistema de créditos (R$ 50)

**Tarde (4h)**:
- [ ] Simplificar cadastro profissional (60s)
- [ ] Remover campos desnecessários
- [ ] Apenas: Nome, Fone, Categoria, CEP, Foto

**Código Referral System (2h)**:
```typescript
// apps/api/src/modules/referrals/referrals.service.ts
@Injectable()
export class ReferralsService {
  async createCode(userId: string): Promise<string> {
    const user = await this.users.findById(userId);
    const code = `CASA${user.name.substring(0,3).toUpperCase()}${randomInt(1000, 9999)}`;

    await this.prisma.referralCode.create({
      data: {
        user_id: userId,
        code,
        bonus_amount: 5000, // R$ 50
        max_uses: 999
      }
    });

    return code;
  }

  async applyCode(code: string, newUserId: string) {
    const referral = await this.prisma.referralCode.findUnique({
      where: { code }
    });

    if (!referral) throw new Error('Código inválido');

    // R$ 50 para quem indicou
    await this.credits.add(referral.user_id, 5000);

    // R$ 50 para quem se cadastrou
    await this.credits.add(newUserId, 5000);

    // Track
    await this.prisma.referralUse.create({
      data: {
        code,
        referrer_id: referral.user_id,
        referred_id: newUserId,
        bonus_amount: 5000
      }
    });

    return { success: true, bonus: 5000 };
  }
}
```

---

### DIA 2 - Landing Page Conversão

**Manhã (4h)** - Criar 2 Landing Pages:

**1. Para Profissionais** (`/cadastro-profissional`):
```
┌─────────────────────────────────────┐
│                                      │
│   💰 GANHE R$ 50 NO 1º JOB!        │
│                                      │
│   Cadastre-se em 60 segundos        │
│   Receba jobs no celular            │
│   Você define o preço               │
│                                      │
│   [CADASTRAR GRÁTIS]                │
│                                      │
│   ✅ 2.847 profissionais já estão  │
│      ganhando com Casa Segura       │
│                                      │
└─────────────────────────────────────┘
```

**2. Para Clientes** (`/primeiro-job-gratis`):
```
┌─────────────────────────────────────┐
│                                      │
│   🎁 PRIMEIRO JOB ATÉ R$ 100       │
│      TOTALMENTE GRÁTIS!             │
│                                      │
│   Elétrica • Hidráulica • Pintura   │
│   Marcenaria • Limpeza • Reforma    │
│                                      │
│   [CRIAR MEU JOB GRÁTIS]            │
│                                      │
│   Sem cartão. Sem pegadinha.        │
│                                      │
└─────────────────────────────────────┘
```

**Tarde (4h)** - Setup Analytics:
```bash
# Google Analytics 4
npm install @next/third-parties

# Facebook Pixel
# TikTok Pixel
# Hotjar (heatmaps)
```

---

### DIA 3 - Promoção "Primeiro Job Grátis"

**Sistema de Cupons**:
```typescript
// apps/api/src/modules/promotions/promotions.service.ts
@Injectable()
export class PromotionsService {
  async applyFirstJobFree(userId: string, jobId: string) {
    const user = await this.users.findById(userId);

    // Verifica se é primeiro job
    const jobCount = await this.jobs.countByUser(userId);
    if (jobCount > 0) {
      throw new Error('Promoção válida apenas no 1º job');
    }

    const job = await this.jobs.findById(jobId);

    // Job até R$ 100 = grátis
    if (job.amount <= 10000) {
      await this.prisma.promotion.create({
        data: {
          user_id: userId,
          job_id: jobId,
          type: 'FIRST_JOB_FREE',
          discount_amount: job.amount, // 100% off
          status: 'ACTIVE'
        }
      });

      return { discount: job.amount, message: 'Job 100% GRÁTIS!' };
    }

    // Job acima de R$ 100 = desconto R$ 100
    await this.prisma.promotion.create({
      data: {
        user_id: userId,
        job_id: jobId,
        type: 'FIRST_JOB_DISCOUNT',
        discount_amount: 10000, // R$ 100 off
        status: 'ACTIVE'
      }
    });

    return { discount: 10000, message: 'R$ 100 de desconto!' };
  }
}
```

---

### DIA 4-5 - Telas de Compartilhamento

**Tela "Convide Amigos"**:
```tsx
// apps/web-client/app/(main)/indicar/page.tsx
export default function ReferralPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ invites: 0, earnings: 0 });

  useEffect(() => {
    loadReferralCode();
    loadStats();
  }, []);

  const shareWhatsApp = () => {
    const message = `
🏠 Descobri um app INCRÍVEL!

Casa Segura - acha profissional pra TUDO:
Elétrica, Hidráulica, Pintura, Limpeza...

Usa meu código: ${code}
A gente ganha R$ 50 cada! 💰

Link: https://casasegura.app/r/${code}
    `.trim();

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        💰 Ganhe R$ 50 por Amigo!
      </h1>

      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 mb-6">
        <p className="text-lg mb-2">Seu código:</p>
        <div className="flex items-center gap-4">
          <div className="bg-white text-green-600 px-6 py-3 rounded-lg text-2xl font-bold">
            {code}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="bg-white text-green-600 px-4 py-2 rounded"
          >
            📋 Copiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.invites}</div>
          <div className="text-sm text-gray-600">Amigos indicados</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">
            R$ {(stats.earnings / 100).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Ganhos totais</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Compartilhar:</h2>

      <div className="space-y-3">
        <button
          onClick={shareWhatsApp}
          className="w-full bg-green-500 text-white py-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold"
        >
          <span>📱</span> Compartilhar no WhatsApp
        </button>

        <button
          onClick={() => shareInstagram()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold"
        >
          <span>📸</span> Compartilhar no Instagram
        </button>

        <button
          onClick={() => shareFacebook()}
          className="w-full bg-blue-600 text-white py-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold"
        >
          <span>👥</span> Compartilhar no Facebook
        </button>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🎁 Bônus Especiais:
        </h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>✅ Indique 3 amigos → Ganhe +R$ 100 extra</li>
          <li>✅ Indique 10 amigos → Job grátis até R$ 300</li>
          <li>✅ Indique 20 amigos → Seja VIP por 1 ano!</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 📱 SEMANA 2: MARKETING E CRESCIMENTO

### DIA 6-7: Conteúdo para Redes Sociais

**Crie 20 Posts para Instagram/TikTok**:

**Post 1** (Carrossel):
```
Slide 1: "Você sabia? 🤔"
Slide 2: "Brasileiro gasta R$ 500/ano com pequenos reparos"
Slide 3: "E perde 10 horas procurando profissional"
Slide 4: "Casa Segura resolve em 2 CLIQUES"
Slide 5: "Primeiro job GRÁTIS! 🎁"
Slide 6: "Link na bio 👆"
```

**Post 2** (Reels - 15s):
```
[Vídeo mostrando]
00:00 - Torneira pingando
00:03 - Abre app Casa Segura
00:05 - Seleciona "Hidráulica"
00:07 - 5 profissionais disponíveis
00:09 - Agenda para hoje
00:12 - Profissional chegando
00:15 - ✅ Resolvido!

TEXTO: "Resolveu em 2 cliques! Link na bio"
```

**Templates Canva**:
- Crie 50 templates no Canva
- Use Canva API para auto-post
- Agende 3 posts/dia

---

### DIA 8-10: Ads Facebook e Google

**Budget**: R$ 100/dia = R$ 3.000/mês

**Facebook/Instagram Ads**:
```
Campanha 1: CLIENTES
Target:
- 25-55 anos
- Proprietários
- Interesse: Casa, Decoração, Reforma
- Raio: 50km da cidade

Ad:
"🎁 PRIMEIRO JOB GRÁTIS!
Elétrica, Hidráulica, Pintura...
Profissionais verificados.
Cadastre-se em 30s!"

[CRIAR JOB GRÁTIS]

Campanha 2: PROFISSIONAIS
Target:
- 25-60 anos
- Profissões: Eletricista, Encanador, Pintor
- Interesse: Trabalho, Renda Extra

Ad:
"💰 GANHE R$ 50 NO 1º JOB!
Receba clientes direto no celular.
2.847 profissionais já estão ganhando.
Cadastro em 1 minuto!"

[CADASTRAR GRÁTIS]
```

**Google Ads**:
```
Palavras-chave:
- "eletricista perto de mim"
- "encanador urgente"
- "pintor residencial"
- "serviços para casa"

Ad:
Título: Encontre Profissional Verificado | Casa Segura
Descrição: Primeiro Job Grátis. Profissionais Avaliados. Agende Hoje!
URL: casasegura.app/primeiro-job-gratis
```

**Budget**:
- Facebook: R$ 50/dia
- Google: R$ 50/dia
- **Meta**: 50 cadastros/dia (CAC = R$ 2)

---

### DIA 11-12: Parcerias com Lojas

**Lista de 20 Lojas para Abordar**:
1. Leroy Merlin
2. Telhanorte
3. C&C
4. Dicico
5. Lojas locais de material

**Pitch para Loja**:
```
Assunto: Parceria que aumenta suas vendas em 20%

Olá [Nome do gerente],

Sou do Casa Segura, app que conecta clientes com profissionais.

PROPOSTA:
- Colocamos QR Code na sua loja
- Cliente compra material e contrata instalação
- Você ganha 5% de comissão nos jobs
- Zero custo para você

BENEFÍCIO PARA LOJA:
- Cliente compra mais (material + serviço)
- Fidelização (cliente volta)
- Marketing digital (mencionamos vocês)

BENEFÍCIO PARA CLIENTE:
- Tudo resolvido em um lugar
- Desconto 10% na instalação

Podemos marcar uma reunião de 15min?

[Seu Nome]
Casa Segura
[Telefone]
```

**Meta**: 3 parcerias fechadas

---

### DIA 13-14: Blitz de Cadastro Presencial

**Locais**:
- Sindicato dos Trabalhadores
- Lojas de material (com permissão)
- Feiras livres
- Mercados populares

**Material Necessário**:
- 500 flyers (R$ 200)
- Banner portátil (R$ 150)
- Tablet para cadastros
- Brindes: Bonés com logo (R$ 300)

**Equipe**:
- 2 pessoas
- R$ 250/dia cada = R$ 500/dia

**Script de Abordagem**:
```
"Oi! Você trabalha com [elétrica/hidráulica]?

Temos um app que manda clientes direto pro seu celular!

Cadastra em 1 minuto e ganha R$ 50 no primeiro job.

Posso te cadastrar agora?"

[Se sim]
- Nome?
- Telefone?
- Categoria?
- CEP?
- Tira foto aqui

Pronto! Você vai receber SMS com o link.
Primeiro job você ganha R$ 50 bônus!

[Dá boné de brinde]
```

**Meta**: 200 profissionais em 2 dias

---

## 📊 MÉTRICAS PARA ACOMPANHAR

### Dashboard (Criar no Notion/Excel):

```
┌─────────────────────────────────┐
│  📊 CASA SEGURA - CRESCIMENTO   │
│                                  │
│  DATA: 01/02/2026               │
│                                  │
│  PROFISSIONAIS:                 │
│  Hoje: +45                      │
│  Semana: +280                   │
│  Total: 2.847                   │
│                                  │
│  CLIENTES:                      │
│  Hoje: +120                     │
│  Semana: +890                   │
│  Total: 8.450                   │
│                                  │
│  JOBS:                          │
│  Hoje: 23                       │
│  Semana: 156                    │
│  Total: 1.240                   │
│                                  │
│  RECEITA:                       │
│  Hoje: R$ 345                   │
│  Semana: R$ 2.340               │
│  Total: R$ 18.600               │
│                                  │
│  REFERRALS:                     │
│  Códigos usados: 156            │
│  Bônus pagos: R$ 15.600         │
│                                  │
│  ADS:                           │
│  Gasto: R$ 700                  │
│  Cadastros: 350                 │
│  CAC: R$ 2,00                   │
└─────────────────────────────────┘
```

---

## ✅ CHECKLIST COMPLETO - 2 SEMANAS

### Desenvolvimento:
- [ ] Sistema de Referral
- [ ] Simplificar cadastro (60s)
- [ ] Cupons "Primeiro Job Grátis"
- [ ] Landing pages conversão
- [ ] Tela "Convide Amigos"
- [ ] Analytics (GA4 + Pixels)

### Marketing:
- [ ] 20 posts Instagram/TikTok
- [ ] Ads Facebook (R$ 700)
- [ ] Ads Google (R$ 700)
- [ ] Email marketing setup

### Parcerias:
- [ ] Pitch deck para lojas
- [ ] Abordar 20 lojas
- [ ] Fechar 3 parcerias

### Presencial:
- [ ] Imprimir 500 flyers
- [ ] Comprar 100 bonés
- [ ] Contratar 2 pessoas
- [ ] Blitz em 5 locais
- [ ] Cadastrar 200 profissionais

---

## 💰 ORÇAMENTO 2 SEMANAS

| Item | Valor |
|------|-------|
| Ads (R$ 100/dia x 14) | R$ 1.400 |
| Equipe blitz (R$ 500/dia x 2) | R$ 1.000 |
| Material (flyers, bonés) | R$ 650 |
| Bônus cadastros (100 x R$ 50) | R$ 5.000 |
| Jobs grátis (30 x R$ 100) | R$ 3.000 |
| **TOTAL** | **R$ 11.050** |

**ROI Esperado**:
- 500 profissionais cadastrados
- 2.000 clientes cadastrados
- 150 jobs completados
- Receita: R$ 2.250 (R$ 15 comissão x 150)

**Payback**: 5 meses

---

## 🚀 COMEÇA AMANHÃ?

**Me diz e eu gero**:
1. ✅ Código completo do Referral System
2. ✅ Landing pages prontas
3. ✅ Posts para redes sociais
4. ✅ Pitch deck para lojas
5. ✅ Planilha de acompanhamento

**BORA FAZER BOMBAR? 🔥**
