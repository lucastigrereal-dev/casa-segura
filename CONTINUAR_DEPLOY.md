# PROMPT PARA CONTINUAR O DEPLOY DO CASA SEGURA

Cole este prompt inteiro no Claude Code para continuar de onde parou:

---

## CONTEXTO

Estou fazendo deploy do projeto Casa Segura no Railway. O projeto e um marketplace de servicos residenciais.

### Status Atual:
- Railway projeto: "delightful-kindness"
- PostgreSQL e Redis: Rodando
- Variaveis DATABASE_URL e REDIS_URL: Configuradas
- URLs publicas: Geradas

### Problema Atual:
O Railway nao esta sincronizando com o commit mais recente do GitHub.
- Commit correto: `3e48c1f`
- Erro atual: `SyntaxError: Unexpected token 'export'` no arquivo `/app/packages/shared/src/index.ts`

### O que precisa ser feito:
1. Forcar Railway a usar o commit `3e48c1f` do GitHub
2. Fazer redeploy da API
3. Verificar se o build compila corretamente (deve mostrar "@casa-segura/shared > tsc")
4. Se funcionar, rodar migrations e seed
5. Configurar os frontends (web-client e web-admin)

### URLs do Projeto:
- API: https://casa-seguraapi-production.up.railway.app
- Cliente: https://casa-segurawebl-client-production.up.railway.app
- Admin: https://casa-segurawebl-admin-production.up.railway.app
- Railway: https://railway.app/project/929444d7-53b6-4c58-8cad-e60e146d9bdc
- GitHub: https://github.com/lucastigrereal-dev/casa-segura

### Credenciais Admin:
- Email: admin@casasegura.com
- Senha: admin123

---

## PROMPT PARA O COMET (Agente de Navegador)

Se estiver usando o Comet para navegar no Railway, use este prompt:

```
# TAREFA: SINCRONIZAR RAILWAY COM GITHUB - CASA SEGURA

Projeto Railway: "delightful-kindness" (Casa Segura)
NAO E: GPT Forja, n8n, ou outro projeto!

## PASSOS:

1. Abra: https://railway.app/dashboard
2. Clique em "delightful-kindness"
3. Clique no servico "casa-segura-api"
4. Va em "Settings"
5. Na secao "Source", procure opcao de "Sync" ou "Refresh"
6. Se nao tiver, va em "Deployments" e faca novo deploy
7. O commit DEVE ser: 3e48c1f

## VERIFICACAO:

Apos deploy, os logs devem mostrar:
- "@casa-segura/shared > tsc" (NAO "No build needed")
- "node apps/api/dist/main.js"
- "Listening on port 3333"

## SE FUNCIONAR:

Teste: https://casa-seguraapi-production.up.railway.app/api/health
Deve retornar: {"status":"ok"}
```

---

## COMANDOS LOCAIS

Se precisar testar localmente:

```bash
cd C:\Users\lucas\casa-segura

# Subir banco local
npm run docker:up

# Buildar tudo
npm run build --workspace=@casa-segura/database
npm run build --workspace=@casa-segura/shared
npm run build --workspace=@casa-segura/api

# Iniciar dev
npm run dev
```

---

## ARQUIVOS IMPORTANTES

- `apps/api/Dockerfile` - Build da API
- `packages/database/package.json` - Build do database
- `packages/shared/package.json` - Build do shared
- `docs/DEPLOY_STATUS.md` - Status atual do deploy

---

*Criado em 05/01/2026*
