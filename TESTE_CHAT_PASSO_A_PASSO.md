# 🧪 Teste do Chat: Guia Passo a Passo

**Data**: 01/02/2026
**Sprint**: 4 - Chat & Notificações
**Objetivo**: Testar chat em tempo real entre Cliente e Profissional

---

## 📋 Pré-requisitos

✅ Backend rodando em: http://localhost:3333
✅ Web Client rodando em: http://localhost:3000
✅ Web Pro rodando em: http://localhost:3002
✅ Database migrada com tabelas: conversations, messages, notifications

---

## 🎯 Cenário de Teste

**Objetivo**: Cliente e Profissional trocando mensagens em tempo real.

**Fluxo**:
1. Cliente cria um job
2. Profissional vê o job e envia proposta
3. Cliente aceita a proposta
4. Chat é ativado entre os dois
5. Trocam mensagens em tempo real

---

## 🚀 PASSO 1: Preparar 2 Navegadores

### Opção A: Dois Navegadores Diferentes
- **Navegador 1**: Chrome → Cliente
- **Navegador 2**: Edge/Firefox → Profissional

### Opção B: Mesmo Navegador (Modo Anônimo)
- **Aba Normal**: Cliente
- **Aba Anônima** (Ctrl+Shift+N): Profissional

---

## 👤 PASSO 2: Login como Cliente

**URL**: http://localhost:3000

### Se você tem usuário teste:
1. Faça login com suas credenciais
2. Tipo de usuário: **CLIENT**

### Se NÃO tem usuário:
1. Vá para: http://localhost:3000/register
2. Cadastre-se como **Cliente**
3. Preencha:
   - Nome: "Cliente Teste"
   - Email: "cliente@test.com"
   - Senha: "123456"
   - Tipo: CLIENT

**Resultado esperado**: ✅ Dashboard do cliente carregado

---

## 🔧 PASSO 3: Cliente Cria um Job

1. No dashboard do cliente, clique em **"Novo Chamado"** ou vá para `/chamados/novo`

2. Preencha o formulário:
   ```
   Título: "Instalação de Luminária"
   Descrição: "Preciso instalar luminária na sala"
   Categoria: "Elétrica"
   Endereço: "Rua Teste, 123"
   Orçamento: R$ 150,00
   ```

3. Clique em **"Criar Chamado"**

**Resultado esperado**:
✅ Job criado com sucesso
✅ Redirecionado para detalhes do job
✅ Status: "AGUARDANDO_PROPOSTAS"

**O que aconteceu no backend**:
- ✅ Job criado na tabela `jobs`
- ✅ **Conversa criada automaticamente** na tabela `conversations`
- ✅ Profissionais próximos receberam notificação

---

## 👷 PASSO 4: Login como Profissional

**URL**: http://localhost:3002 (em outro navegador/aba)

### Se você tem usuário profissional:
1. Faça login
2. Tipo: **PROFESSIONAL**

### Se NÃO tem:
1. Vá para: http://localhost:3002/register
2. Cadastre-se como **Profissional**
3. Preencha:
   - Nome: "Profissional Teste"
   - Email: "pro@test.com"
   - Senha: "123456"
   - Tipo: PROFESSIONAL
   - Categoria: Elétrica

**Resultado esperado**: ✅ Dashboard do profissional carregado

---

## 📋 PASSO 5: Profissional Vê o Job

1. No dashboard do profissional, vá para **"Chamados Disponíveis"**
2. Você deve ver o job "Instalação de Luminária"
3. Clique para ver detalhes

**Resultado esperado**: ✅ Detalhes do job exibidos

---

## 💰 PASSO 6: Profissional Envia Proposta

1. Na página de detalhes do job, clique em **"Enviar Proposta"**
2. Preencha:
   ```
   Valor: R$ 140,00
   Descrição: "Posso fazer hoje mesmo. Experiência de 5 anos."
   Prazo: 2 horas
   ```
3. Clique em **"Enviar Proposta"**

**Resultado esperado**:
✅ Proposta enviada com sucesso
✅ **Cliente recebe notificação em tempo real** 🔔

**O que aconteceu no backend**:
- ✅ Quote criado na tabela `quotes`
- ✅ Notificação criada na tabela `notifications`
- ✅ **WebSocket enviou evento `new_notification` para o cliente**

**Teste WebSocket**:
- No navegador do **Cliente**, olhe o **sino 🔔** no header
- Deve aparecer **badge vermelho com número "1"**
- Clique no sino → Ver notificação "Nova Proposta"

---

## ✅ PASSO 7: Cliente Aceita a Proposta

**Volte para o navegador do Cliente**

1. Clique no **sino 🔔** e veja a notificação
2. Clique na notificação → Vai para detalhes do job
3. Na lista de propostas, clique em **"Aceitar"** na proposta do profissional

**Resultado esperado**:
✅ Proposta aceita
✅ Status do job mudou para "ACEITO"
✅ **Profissional adicionado à conversa**
✅ **Profissional recebe notificação "Proposta Aceita"** 🔔

**O que aconteceu no backend**:
- ✅ Quote.status = ACCEPTED
- ✅ Job.pro_id = profissional ID
- ✅ **Conversation.professional_id = profissional ID** (chat ativado!)
- ✅ Notificação enviada ao profissional

---

## 💬 PASSO 8: Abrir o Chat (MOMENTO PRINCIPAL!)

### No Cliente:
1. Na página de detalhes do job, procure o botão **"💬 Chat"** ou "Conversar com Profissional"
2. Clique no botão
3. **Chat window deve abrir**

### No Profissional:
1. Clique na notificação "Proposta Aceita"
2. Vai para detalhes do job
3. Procure botão **"💬 Chat"** ou "Conversar com Cliente"
4. Clique no botão
5. **Chat window deve abrir**

**Resultado esperado**:
✅ Chat window aberto em ambos os navegadores
✅ Interface de chat aparece
✅ Campo de mensagem disponível
✅ No console do navegador: "Connected to WebSocket" ou "WebSocket connected"

---

## 🚀 PASSO 9: Testar Mensagens em Tempo Real

### Teste 1: Cliente envia mensagem
1. **No navegador do Cliente**, digite: "Olá! Quando você pode vir?"
2. Pressione **Enter** ou clique em **"Enviar"**

**Resultado esperado**:
- ✅ Mensagem aparece instantaneamente no chat do **Cliente** (bolha azul à direita)
- ✅ **MENSAGEM APARECE EM TEMPO REAL NO CHAT DO PROFISSIONAL** (bolha cinza à esquerda)
- ✅ Sem precisar dar refresh!

### Teste 2: Profissional responde
1. **No navegador do Profissional**, digite: "Posso ir hoje às 15h!"
2. Pressione **Enter**

**Resultado esperado**:
- ✅ Mensagem aparece instantaneamente nos dois chats
- ✅ **Cliente vê a resposta em tempo real**

### Teste 3: Conversa completa
Continue conversando:
```
Cliente: "Perfeito! Te espero."
Profissional: "Ok, vou levar as ferramentas."
Cliente: "Precisa de escada?"
Profissional: "Sim, se possível!"
```

**Resultado esperado**:
✅ Todas as mensagens aparecem instantaneamente
✅ Cada mensagem tem timestamp
✅ Layout correto (suas mensagens à direita, do outro à esquerda)

---

## ⌨️ PASSO 10: Testar Typing Indicators

1. **No chat do Cliente**, comece a digitar (não envie)
2. **Olhe o chat do Profissional**

**Resultado esperado**:
✅ Deve aparecer "Digitando..." ou "..." no chat do profissional
✅ Quando parar de digitar, o indicador some após 2 segundos

---

## ✓ PASSO 11: Testar Read Receipts (Confirmação de Leitura)

1. **Cliente** envia: "Mensagem teste"
2. **Profissional** abre o chat (ou já está aberto)
3. Mensagem é marcada como lida automaticamente

**Resultado esperado**:
✅ No chat do **Cliente**, as mensagens mostram ✓✓ (lidas)
✅ Ou cor diferente indicando leitura

---

## 🔔 PASSO 12: Testar Notificação de Nova Mensagem

1. **Profissional** FECHA o chat
2. **Cliente** envia mensagem: "Você viu minha mensagem?"
3. **Olhe o sino 🔔 do Profissional**

**Resultado esperado**:
✅ Badge com número aumenta
✅ Nova notificação "Nova mensagem de Cliente Teste"
✅ Clicando na notificação, abre o chat

---

## 🔄 PASSO 13: Testar Reconexão WebSocket

1. **No navegador do Cliente**, abra o **Console** (F12)
2. No console, digite: `location.reload()`
3. Página recarrega
4. Faça login novamente
5. Abra o chat

**Resultado esperado**:
✅ WebSocket reconecta automaticamente
✅ Mensagens antigas são carregadas
✅ Chat funciona normalmente
✅ No console: "Connected to WebSocket"

---

## 📊 PASSO 14: Verificar no Banco de Dados

Abra o terminal e execute:

```bash
cd C:\Users\lucas\casa-segura\packages\database
npx prisma studio
```

**No Prisma Studio** (http://localhost:5555):

### Tabela: conversations
- ✅ Deve ter 1 conversa criada
- ✅ `client_id` preenchido
- ✅ `professional_id` preenchido (após aceitar proposta)
- ✅ `job_id` vinculado ao job
- ✅ `last_message_at` atualizado
- ✅ `last_message_preview` com preview da última mensagem

### Tabela: messages
- ✅ Todas as mensagens enviadas aparecendo
- ✅ `sender_id` correto (ora cliente, ora profissional)
- ✅ `type` = TEXT
- ✅ `content` com texto das mensagens
- ✅ `read_at` preenchido nas mensagens lidas

### Tabela: notifications
- ✅ Notificação "Nova Proposta" (type: NEW_QUOTE)
- ✅ Notificação "Proposta Aceita" (type: QUOTE_ACCEPTED)
- ✅ Notificações de mensagens (type: NEW_MESSAGE)
- ✅ `read_at` preenchido nas notificações lidas

---

## ✅ Checklist de Sucesso

Marque conforme for testando:

### Backend:
- [ ] API respondendo em localhost:3333
- [ ] WebSocket namespace /chat ativo
- [ ] Database com 3 novas tabelas

### Fluxo de Job:
- [ ] Cliente criou job
- [ ] Conversa criada automaticamente
- [ ] Profissional viu job
- [ ] Profissional enviou proposta
- [ ] Cliente recebeu notificação em tempo real
- [ ] Cliente aceitou proposta
- [ ] Profissional recebeu notificação

### Chat:
- [ ] Chat window abre para Cliente
- [ ] Chat window abre para Profissional
- [ ] WebSocket conectado (verificar console)
- [ ] Cliente envia mensagem → Profissional vê em tempo real
- [ ] Profissional responde → Cliente vê em tempo real
- [ ] Mensagens aparecem instantaneamente (< 1 segundo)
- [ ] Layout correto (suas msgs à direita, outras à esquerda)
- [ ] Timestamps aparecem

### Features Avançadas:
- [ ] Typing indicators funcionando
- [ ] Read receipts funcionando
- [ ] Notificações de mensagem funcionando
- [ ] Badge counter atualizando
- [ ] Reconexão WebSocket funcionando

### Database:
- [ ] Conversations criada com IDs corretos
- [ ] Messages salvando todas as msgs
- [ ] Notifications criadas corretamente

---

## 🐛 Troubleshooting

### Problema: "WebSocket não conecta"
**Solução**:
1. Verifique console do navegador (F12)
2. Procure erros de conexão
3. Verifique se backend está rodando: http://localhost:3333
4. Verifique token JWT no localStorage

### Problema: "Mensagem não aparece em tempo real"
**Solução**:
1. Verifique ambos os chats estão abertos
2. Verifique console por erros
3. Teste reconectar (dar refresh na página)
4. Verifique se ambos estão na mesma conversa

### Problema: "Chat não abre"
**Solução**:
1. Verifique se proposta foi aceita
2. Verifique se conversation existe no banco
3. Verifique se `professional_id` foi atribuído à conversa
4. Veja console do navegador por erros

### Problema: "Notificações não aparecem"
**Solução**:
1. Verifique WebSocket conectado
2. Verifique backend logs
3. Teste criar outra ação (enviar mensagem, criar job)
4. Verifique se sino 🔔 está visível no header

---

## 📸 Capturas de Tela Sugeridas

Durante o teste, tire prints de:
1. Chat funcionando com mensagens
2. Typing indicator
3. Notificações no dropdown
4. Badge com contador
5. Prisma Studio mostrando messages

---

## 🎉 Teste Concluído!

Se todos os itens do checklist passaram: **CHAT FUNCIONANDO 100%!** 🚀

### Próximos testes sugeridos:
- [ ] Testar com múltiplas conversas
- [ ] Testar file upload (se implementado)
- [ ] Testar em diferentes browsers
- [ ] Testar em mobile
- [ ] Load test com muitas mensagens

---

**Documentação**: Ver `docs/API_CHAT_NOTIFICATIONS.md` para referência técnica
**Suporte**: Ver `docs/SPRINT_4_TESTING_GUIDE.md` para mais cenários

**Boa sorte com os testes! 🎯**
