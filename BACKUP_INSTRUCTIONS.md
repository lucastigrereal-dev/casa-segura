# Sprint 2 Backup & Upload Instructions

## 📦 Backup Files Created

- **Arquivo**: `casa-segura-sprint2-backup.tar.gz` (209 KB)
- **Data**: 2026-01-20
- **Localização**: `C:\Users\lucas\`
- **Conteúdo**: Projeto completo sem node_modules, .next, .git

---

## 🗂️ Google Drive Upload

### Opção 1: Upload Manual (Recomendado)

1. Acesse: https://drive.google.com
2. Clique em "+ Novo" → "Upload de arquivos"
3. Selecione: `C:\Users\lucas\casa-segura-sprint2-backup.tar.gz`
4. Crie uma pasta: `Casa Segura Backups`
5. Mova o arquivo para lá

### Opção 2: Instalar Google Drive CLI

```bash
# Instalar rclone (melhor alternativa)
choco install rclone -y

# Configurar
rclone config

# Upload
rclone copy C:\Users\lucas\casa-segura-sprint2-backup.tar.gz gdrive:Casa\ Segura\ Backups
```

### Opção 3: Usar PowerShell

```powershell
# Instalar módulo Google Drive
Install-Module GoogleDrive -Force

# Fazer login
Connect-GoogleDrive

# Upload
Add-GDriveItem -Path "C:\Users\lucas\casa-segura-sprint2-backup.tar.gz" -ParentID "sua_pasta_id"
```

---

## 📋 Conteúdo do Backup

### Incluído:
✅ Código-fonte completo
✅ Database schema (Prisma)
✅ API modules
✅ Web-pro app
✅ Configurações
✅ Documentação
✅ Git history (.git)

### Excluído:
❌ node_modules (instalar com `npm install`)
❌ .next (build com `npm run build`)
❌ .turbo (cache)
❌ .vercel (deployment config)

---

## 🔐 Restaurar Backup

```bash
# Extrair
tar -xzf casa-segura-sprint2-backup.tar.gz

# Instalar dependências
cd casa-segura
npm install

# Gerar Prisma Client
npm run db:generate

# Pronto!
npm run dev
```

---

## 📊 Arquivos Importantes

```
casa-segura/
├── apps/
│   ├── api/
│   │   ├── src/modules/
│   │   │   ├── quotes/ ✨ NOVO
│   │   │   ├── professional-services/ ✨ NOVO
│   ├── web-pro/ ✨ NOVO
│   │   ├── app/
│   │   ├── package.json
│   │   └── ...
├── packages/
│   ├── shared/
│   │   └── src/constants/ ✨ ATUALIZADO
├── package.json ✨ ATUALIZADO
├── DEPLOY.md ✨ NOVO
└── README.md
```

---

## 🔗 Links

- **GitHub**: https://github.com/lucastigrereal-dev/casa-segura
- **Commits**:
  - 0fa7d3c - docs: add comprehensive deployment guide
  - 2a8c4fe - chore: add Vercel configuration
  - 0874d61 - feat: implement Sprint 2

---

## 💾 Backup Schedule

Recomendação:
- **Diário**: Usar Git + GitHub (automático)
- **Semanal**: Upload para Google Drive
- **Mensal**: Archive em servidor externo

