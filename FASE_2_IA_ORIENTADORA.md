# 🤖 FASE 2: IA ORIENTADORA - O DIFERENCIAL MATADOR

**Nome**: **Casa Segura AI Coach**
**Conceito**: "GPS para Profissionais" - IA que guia passo a passo durante o trabalho
**Quando**: Após atingir 5.000 profissionais e 2.000 jobs/mês (Mês 4-6)

---

## 💡 A IDEIA

### Problema Atual:
```
Profissional chega no local:
❌ "Esqueci uma ferramenta"
❌ "Não sei qual fio usar"
❌ "Quanto de material preciso?"
❌ "Como faço essa conexão?"
❌ Cliente insatisfeito = review ruim
```

### Nossa Solução:
```
IA no Celular:
✅ Checklist de ferramentas ANTES de sair
✅ IA vê a foto e diz: "Precisa de fio 2.5mm"
✅ Calcula quantidade exata de material
✅ Passo a passo em vídeo ou AR
✅ Cliente feliz = 5 estrelas
```

---

## 🎯 FUNCIONALIDADES DA IA

### 1. **PRÉ-SERVIÇO: Checklist Inteligente**

**Como Funciona**:
```
Profissional aceita job: "Instalar chuveiro"

IA ANALISA:
- Tipo de serviço
- Fotos do local (enviadas pelo cliente)
- Histórico de jobs similares

IA GERA:
📋 CHECKLIST PERSONALIZADO
```

**Exemplo Real**:
```
🔧 CHECKLIST - Instalação de Chuveiro

FERRAMENTAS:
☑ Chave de fenda phillips
☑ Alicate de corte
☑ Alicate universal
☑ Furadeira + broca 8mm
☑ Nível
☑ Fita isolante

MATERIAIS:
☑ Fio 4mm² (6 metros)
☑ Disjuntor 40A
☑ Bucha 8mm (4 unidades)
☑ Parafuso 8mm (4 unidades)
☑ Fita veda rosca

TEMPO ESTIMADO: 1h30
DIFICULDADE: ⭐⭐⭐ (Média)

⚠️ ATENÇÃO:
- Desligue energia no disjuntor principal
- Verifique voltagem (220V)
- Teste vazamentos antes de finalizar
```

**Código**:
```typescript
class AICoachService {
  async generateChecklist(jobId: string) {
    const job = await this.getJob(jobId);
    const photos = await this.getJobPhotos(jobId);
    const history = await this.getSimilarJobs(job.service_type);

    const prompt = `
      Serviço: ${job.title}
      Descrição: ${job.description}
      Fotos: [análise da IA das fotos]
      Histórico: ${history}

      Gere checklist detalhado com:
      1. Ferramentas necessárias
      2. Materiais e quantidades
      3. Tempo estimado
      4. Dificuldade (1-5)
      5. Avisos importantes
    `;

    const response = await this.openai.createCompletion({
      model: "gpt-4-vision-preview",
      messages: [{ role: "user", content: prompt }]
    });

    return this.parseChecklist(response);
  }
}
```

---

### 2. **DURANTE O SERVIÇO: Assistente em Tempo Real**

**Funcionalidade: "Tire Foto e Pergunte"**

**Como Funciona**:
```
Profissional no local:
1. Tira foto do problema
2. Fala/escreve: "Como instalo isso?"
3. IA analisa foto + pergunta
4. IA responde com passo a passo
```

**Exemplo Real**:

**Profissional**: *[Tira foto de quadro elétrico]* "Onde ligo o fio do chuveiro?"

**IA Coach**:
```
📸 Analisando foto...

Vi seu quadro elétrico Steck de 8 disjuntores.

🔌 PASSO A PASSO:

1️⃣ DESLIGUE O DISJUNTOR PRINCIPAL (topo)

2️⃣ IDENTIFIQUE O DISJUNTOR:
   - Procure disjuntor 40A (vermelho)
   - Está na posição inferior direita

3️⃣ CONECTE OS FIOS:
   - Fio PRETO (fase) → Terminal superior
   - Fio AZUL (neutro) → Barra neutra (esquerda)
   - Fio VERDE/AMARELO (terra) → Barra terra (direita)

4️⃣ APERTE BEM os parafusos (torque firme)

5️⃣ LIGUE o disjuntor e TESTE

⚠️ IMPORTANTE:
- Use luvas isoladas
- Fios devem ter 15cm de sobra
- Neutro NÃO passa pelo disjuntor

✅ Dúvidas? Tire outra foto!
```

**Código**:
```typescript
class AIAssistantService {
  async analyzePhotoAndAnswer(photo: File, question: string, jobId: string) {
    // Upload foto para análise
    const imageUrl = await this.uploadImage(photo);

    // Context do job
    const job = await this.getJobContext(jobId);

    const prompt = `
      CONTEXTO:
      Serviço: ${job.service_type}
      Job: ${job.description}

      FOTO: [imagem anexada]

      PERGUNTA DO PROFISSIONAL:
      "${question}"

      RESPONDA:
      - Analise a foto em detalhe
      - Dê passo a passo claro e numerado
      - Use emojis para facilitar leitura
      - Inclua avisos de segurança
      - Seja objetivo e prático
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }
}
```

---

### 3. **MODO AR (Realidade Aumentada)**

**Funcionalidade: "Veja Onde Furar/Conectar"**

**Como Funciona**:
```
1. Profissional aponta câmera para parede
2. IA detecta onde está o chuveiro
3. AR mostra EXATAMENTE onde:
   - Furar (círculos verdes)
   - Passar fio (linha azul)
   - Conectar (setas)
```

**Exemplo**:
```
📱 MODO AR ATIVADO

[Câmera mostrando parede do banheiro]

🟢 FURE AQUI (4 pontos marcados)
   Profundidade: 5cm
   Broca: 8mm

🔵 PASSE O FIO (linha azul animada)
   Do quadro → até aqui

🔴 CONECTE CHUVEIRO
   Fio preto → L
   Fio azul → N
   Verde → ⏚

📏 NÍVEL: +2° (ajuste à direita)
```

**Tech Stack**:
```
- AR Core (Android) / AR Kit (iOS)
- TensorFlow Lite (detecção objetos)
- OpenCV (processamento imagem)
- Three.js (renderização 3D)
```

**Código** (Simplificado):
```typescript
class ARAssistantService {
  async detectAndGuide(cameraFrame: Frame, jobType: string) {
    // Detecta objetos na cena
    const detections = await this.tensorflowModel.detect(cameraFrame);

    // Identifica pontos de instalação
    const installPoints = this.calculateInstallPoints(detections, jobType);

    // Gera overlays AR
    return {
      drillPoints: [
        { x: 150, y: 200, depth: 5, icon: '🟢' },
        { x: 350, y: 200, depth: 5, icon: '🟢' }
      ],
      wirePath: [
        { from: [100, 300], to: [250, 200], color: 'blue' }
      ],
      connections: [
        { position: [250, 150], label: 'L (Fase)', color: 'red' },
        { position: [250, 180], label: 'N (Neutro)', color: 'blue' }
      ],
      level: { angle: 2.5, direction: 'right' }
    };
  }
}
```

---

### 4. **CÁLCULO AUTOMÁTICO DE MATERIAL**

**Funcionalidade: "IA Calcula Quanto Precisa"**

**Como Funciona**:
```
Cliente posta job: "Trocar toda fiação da sala"

IA ANALISA:
- Fotos do ambiente
- Metragem (detecta na foto ou pergunta)
- Tipo de instalação

IA CALCULA:
📊 LISTA DE MATERIAIS
```

**Exemplo**:
```
📦 MATERIAIS NECESSÁRIOS

Sala de 16m² (4x4m)

FIO E CABO:
- Fio 2.5mm² VERMELHO: 25m (R$ 87,50)
- Fio 2.5mm² AZUL: 25m (R$ 87,50)
- Fio 2.5mm² VERDE/AMARELO: 20m (R$ 70,00)

ELETRODUTOS:
- Eletroduto 3/4": 15m (R$ 45,00)
- Curvas 90°: 8 unidades (R$ 16,00)
- Luvas: 10 unidades (R$ 10,00)

TOMADAS E INTERRUPTORES:
- Tomada 2P+T 10A: 6 unidades (R$ 42,00)
- Interruptor simples: 2 unidades (R$ 14,00)

EXTRAS:
- Caixa 4x2": 8 unidades (R$ 24,00)
- Fita isolante: 2 rolos (R$ 8,00)

💰 TOTAL: R$ 404,00
⏱️ TEMPO: 6-8 horas

🛒 COMPRAR AGORA (link para loja parceira)
```

**Código**:
```typescript
class MaterialCalculatorService {
  async calculate(jobId: string) {
    const job = await this.getJob(jobId);
    const photos = await this.getPhotos(jobId);

    // IA analisa fotos e extrai dimensões
    const dimensions = await this.analyzeSpace(photos);

    // IA gera lista baseada em:
    // - Normas técnicas (NBR 5410)
    // - Boas práticas
    // - Histórico de jobs similares

    const prompt = `
      Serviço: ${job.service_type}
      Ambiente: ${dimensions.area}m²
      Descrição: ${job.description}

      Calcule materiais necessários seguindo NBR 5410.
      Inclua:
      - Quantidade exata
      - Margem de segurança 10%
      - Preços médios
      - Total estimado
    `;

    const materials = await this.openai.generate(prompt);

    return this.formatMaterialList(materials);
  }
}
```

---

### 5. **VÍDEOS TUTORIAIS CONTEXTUAIS**

**Funcionalidade: "Vídeo do Que Você Está Fazendo"**

**Como Funciona**:
```
IA detecta etapa do serviço
↓
Sugere vídeo específico
↓
Vídeo de 30-60s
↓
Profissional aprende e aplica
```

**Exemplo**:
```
Profissional: "Como passar fio pelo eletroduto?"

🎥 VÍDEO SUGERIDO (45s)
"Passagem de Fio em Eletroduto com Guia"

[Thumbnail do vídeo]

🎯 Neste vídeo:
- Técnica da guia de arame
- Uso de vaselina
- Truque para curvas
- Evitar rompimento

▶️ ASSISTIR (45s)

📚 MAIS VÍDEOS:
- Dobra de eletroduto
- Conexão com caixas
```

**Database de Vídeos**:
```sql
CREATE TABLE tutorial_videos (
  id UUID PRIMARY KEY,
  service_type VARCHAR,
  task_name VARCHAR,
  video_url VARCHAR,
  duration_seconds INT,
  thumbnail_url VARCHAR,
  keywords TEXT[],
  difficulty INT,
  views INT,
  rating DECIMAL
);

-- Exemplo
INSERT INTO tutorial_videos VALUES (
  uuid_generate_v4(),
  'ELETRICA',
  'Passar fio em eletroduto',
  'https://cdn.casa-segura.com/videos/passagem-fio.mp4',
  45,
  'https://cdn.casa-segura.com/thumbs/passagem-fio.jpg',
  ARRAY['fio', 'eletroduto', 'guia', 'instalação'],
  2,
  15847,
  4.8
);
```

---

## 🎯 INTERFACE DO USUÁRIO

### Tela Principal - "AI Coach"

```
┌─────────────────────────────┐
│  🤖 Casa Segura AI Coach    │
│                              │
│  Job: Instalação Chuveiro    │
│  Cliente: Maria Silva        │
│  Local: Rua ABC, 123         │
│                              │
│  ┌────────────────────────┐ │
│  │  📋 VER CHECKLIST      │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  📸 TIRAR FOTO E      │ │
│  │     PERGUNTAR          │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  📐 MODO AR           │ │
│  │     (Realidade Aumentada)│ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  📦 CALCULAR          │ │
│  │     MATERIAIS          │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  🎥 TUTORIAIS         │ │
│  └────────────────────────┘ │
│                              │
│  💬 Chat com IA            │
│  "Como posso ajudar?"      │
│  ┌─────────────────────┐  │
│  │ Digite sua dúvida... │  │
│  └─────────────────────┘  │
└─────────────────────────────┘
```

---

## 💰 MODELO DE NEGÓCIO - IA

### Precificação:

**Plano Básico** (Grátis):
- Checklist pré-serviço
- 3 perguntas/dia para IA
- Vídeos tutoriais básicos

**Plano PRO** (R$ 49,90/mês):
- ✅ TUDO do Básico
- ✅ Perguntas ILIMITADAS para IA
- ✅ Modo AR (Realidade Aumentada)
- ✅ Cálculo automático de materiais
- ✅ Todos os vídeos tutoriais
- ✅ Suporte prioritário
- ✅ Badge "AI Powered"

**Plano ELITE** (R$ 99,90/mês):
- ✅ TUDO do PRO
- ✅ Videochamada com especialista (2x/mês)
- ✅ IA aprende seu estilo de trabalho
- ✅ Relatórios de produtividade
- ✅ Acesso antecipado a novos recursos

### Receita Estimada:

```
10.000 profissionais:
- 30% aderem ao PRO = 3.000 x R$ 49,90 = R$ 149.700/mês
- 5% aderem ao ELITE = 500 x R$ 99,90 = R$ 49.950/mês

TOTAL: R$ 199.650/mês = R$ 2,4 MILHÕES/ANO

(Apenas com assinaturas IA!)
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### Mês 1-2: MVP da IA

**Features Mínimas**:
- [ ] Checklist pré-serviço (IA GPT-4)
- [ ] Chat "Pergunte para IA"
- [ ] Base de 50 vídeos tutoriais
- [ ] Sistema de assinaturas

**Tech Stack**:
- OpenAI API (GPT-4 Vision)
- Backend: NestJS
- Frontend: React Native
- Database: PostgreSQL

**Equipe**:
- 2 devs backend (2 meses)
- 2 devs frontend (2 meses)
- 1 AI engineer (2 meses)
- 1 produtor vídeos (1 mês)

**Custo**: ~R$ 80.000

### Mês 3-4: Features Avançadas

- [ ] Cálculo de materiais
- [ ] 200+ vídeos tutoriais
- [ ] IA personalizada por categoria
- [ ] Análise de fotos melhorada

**Custo**: ~R$ 60.000

### Mês 5-6: AR & Inovação

- [ ] Modo AR (iOS + Android)
- [ ] IA com memória (aprende com profissional)
- [ ] Integração com lojas (comprar material)
- [ ] Dashboard de analytics

**Custo**: ~R$ 100.000

**INVESTIMENTO TOTAL**: R$ 240.000

**PAYBACK**: ~12-15 meses

---

## 📊 MÉTRICAS DE SUCESSO - IA

### Mês 1 (Lançamento):
- ✅ 500 profissionais testando
- ✅ 100 assinantes PRO
- ✅ NPS > 70
- ✅ 1.000 perguntas/dia para IA

### Mês 3:
- ✅ 2.000 usuários ativos IA
- ✅ 600 assinantes PRO
- ✅ 50 assinantes ELITE
- ✅ Receita: R$ 35k/mês

### Mês 6:
- ✅ 5.000 usuários ativos IA
- ✅ 1.500 assinantes PRO
- ✅ 150 assinantes ELITE
- ✅ Receita: R$ 90k/mês

### Ano 1:
- ✅ 10.000 usuários IA
- ✅ 3.000 PRO + 500 ELITE
- ✅ Receita: R$ 200k/mês
- ✅ Feature mais amada do app

---

## 🎯 DIFERENCIAL COMPETITIVO

### Por Que Ninguém Tem Isso?

1. **Complexo**: Requer IA avançada + AR + vídeos
2. **Caro**: Investimento de R$ 240k
3. **Dados**: Precisa de milhares de jobs para treinar IA
4. **Timing**: Só faz sentido depois de ter escala

### Por Que Vamos Conseguir?

1. **Dados**: Fase 1 gera milhares de jobs = training data
2. **Capital**: Receita da Fase 1 financia Fase 2
3. **Tech**: OpenAI/GPT-4 torna possível agora
4. **Diferencial**: Único no mercado = pricing power

---

## 🏆 VISÃO DO FUTURO

**Casa Segura em 2027**:

```
📱 APP:
"Oi Clara (nossa IA), preciso instalar um chuveiro"

🤖 IA:
"Perfeito! Analisando fotos do banheiro...

✅ Job simples, você consegue!

Checklist pronto ✓
6 profissionais disponíveis hoje ✓
Material total: R$ 145 ✓

Quer que eu reserve o melhor horário?"

📱 PROFISSIONAL:
"Aceito!"

🤖 IA:
"Show! Te espero lá às 14h.

Já separei suas ferramentas e calculei material.
Tempo estimado: 1h30.

Aperte START quando chegar!"

[No local]

🤖 IA:
"Detectei a instalação. Quer modo AR?"

📱 PROFISSIONAL:
"Sim!"

[AR mostra exatamente onde furar/conectar]

🤖 IA:
"Perfeito! Cliente notificado.
Você ganhou +R$ 150!
Review 5⭐ automática!"
```

**ISSO é o futuro. E vamos criar! 🚀**

---

## ✅ PRÓXIMOS PASSOS

**Você decide**:

1. **Implementar FASE 1 agora** (Crescimento Viral)
   - Foco: Cadastros em massa
   - Prazo: 2-3 meses
   - Custo: R$ 140k

2. **Ou pular direto para FASE 2** (IA - Alto Risco)
   - Foco: Inovação
   - Prazo: 6 meses
   - Custo: R$ 240k
   - Risco: Sem usuários para usar

**Recomendação**: FASE 1 → FASE 2 (estratégia segura)

---

**Me diz: BORA COMEÇAR? 🔥**

Posso gerar:
- Código do Referral Program
- Código do AI Coach MVP
- Landing pages
- Pitch deck para investidores

**Escolhe e eu codifico! 💪**
