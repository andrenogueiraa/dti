# Docker Setup - PostgreSQL

Este projeto inclui um setup do Docker Compose para executar PostgreSQL e PgAdmin localmente.

## 🚀 Como usar

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=dti_db

# PgAdmin Configuration
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin

# Next.js Database URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/dti_db
```

### 2. Iniciar os serviços

```bash
# Iniciar PostgreSQL e PgAdmin
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

### 3. Acessar os serviços

- **PostgreSQL**: `localhost:5432`
- **PgAdmin**: `http://localhost:8080`
  - Email: admin@admin.com (ou o definido no .env.local)
  - Senha: admin (ou a definida no .env.local)

### 4. Conectar no PgAdmin

1. Acesse `http://localhost:8080`
2. Faça login com as credenciais configuradas
3. Adicione um novo servidor:
   - **Name**: DTI Database
   - **Host**: postgres (nome do container)
   - **Port**: 5432
   - **Username**: postgres (ou o definido no .env.local)
   - **Password**: password (ou a definida no .env.local)

## 📁 Arquivos incluídos

- `docker-compose.yml`: Configuração dos containers PostgreSQL e PgAdmin
- `init.sql`: Script de inicialização do banco com tabelas e dados de exemplo

## 🔧 Comandos úteis

```bash
# Reiniciar apenas o PostgreSQL
docker-compose restart postgres

# Acessar o terminal do PostgreSQL
docker-compose exec postgres psql -U postgres -d dti_db

# Ver containers em execução
docker-compose ps

# Remover volumes (apaga dados)
docker-compose down -v
```

## 📦 O que está incluído

- PostgreSQL 15 Alpine
- PgAdmin 4
- Volumes persistentes para dados
- Rede isolada
- Script de inicialização com extensões e tabelas de exemplo
