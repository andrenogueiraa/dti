# Integração: Sistema de Chamados → DTI

## Visão Geral

Esta documentação descreve a integração entre o sistema de chamados e o sistema DTI, onde chamados fechados/resolvidos são automaticamente convertidos em tasks no DTI.

## Contexto dos Sistemas

### Sistema de Chamados
- **Tecnologia**: Next.js
- **Banco de Dados**: PostgreSQL
- **Servidor**: Separado do DTI
- **Banco**: Separado do DTI

### Sistema DTI
- **Tecnologia**: Next.js
- **Banco de Dados**: PostgreSQL
- **Servidor**: Separado do sistema de chamados
- **Banco**: Separado do sistema de chamados

## Decisões de Arquitetura

### Responsabilidade
- **Sistema responsável**: DTI
- **Abordagem**: Simples, sem alta complexidade
- **Cache**: Implementado para evitar sobrecarga no banco de dados

### Trigger de Integração
- **Condição**: Chamado com `status` = fechado/resolvido
- **Tabela**: `chamados_chamado`
- **Campo**: `status` (varchar(1))

## Estrutura de Dados

### Tabela de Chamados (Sistema de Chamados)

```typescript
chamados_chamado {
  id: bigserial
  titulo: varchar(150)
  descricao: text
  urgencia: varchar(2)
  status: varchar(1)  // Valor que indica fechado/resolvido
  atribuidoAId: bigint  // Referência para accounts_user.pessoafisica_ptr_id
  // ... outros campos
}
```

### Relação para Obter CPF do Desenvolvedor

```
chamados_chamado
    ├── atribuidoAId (bigint)
    │       ↓
    │   accounts_user.pessoafisicaPtrId
    │       ↓
    │   core_pessoafisica.pessoaPtrId
    │       ↓
    │   core_pessoafisica.cpf (varchar(14))
    │
    └── status (varchar(1)) → Status atual do chamado
```

## Mapeamento de Dados

### Campos Importados

| Campo do Chamado | Campo da Task DTI | Tipo |
|------------------|-------------------|------|
| `titulo` | `name` | varchar(255) |
| `descricao` | `description` | varchar(1000) |
| `urgencia` | `urgency` | varchar(255) |
| `id` | `chamadoId` (FK) | bigint → uuid |

### Mapeamento de Usuário

- **Chave de ligação**: CPF
- **Fluxo**: 
  1. Obter `atribuidoAId` do chamado
  2. Buscar CPF via: `accounts_user` → `core_pessoafisica`
  3. Encontrar usuário no DTI pelo CPF
  4. Atribuir task ao `responsibleUserId` correspondente

### Requisito: Coluna CPF no DTI

- **Ação necessária**: Adicionar coluna `cpf` na tabela `user` do DTI
- **Tipo**: varchar(14) (formato compatível com o sistema de chamados)
- **Finalidade**: Permitir o mapeamento entre usuários dos dois sistemas

## Estrutura da Task no DTI

### Campos Obrigatórios
- `sprintId`: UUID (NOT NULL) - Sprint de destino
- `name`: varchar(255) - Título do chamado
- `description`: varchar(1000) - Descrição do chamado
- `status`: TaskStatus - Status inicial da task
- `urgency`: varchar(255) - Urgência do chamado

### Campos Opcionais
- `responsibleUserId`: text - ID do usuário responsável (mapeado via CPF)
- `chamadoId`: bigint - ID do chamado original (chave estrangeira)
- `tags`: text[] - Tags adicionais (se necessário)

## Considerações Técnicas

### Cache
- **Finalidade**: Evitar sobrecarga no banco de dados
- **Uso**: Armazenar IDs de chamados já processados para evitar reprocessamento

### Idempotência
- **Requisito**: Garantir que o mesmo chamado não gere múltiplas tasks
- **Solução**: Implementar controle de chamados já importados (via cache ou tabela de controle)

### Tratamento de Erros
- **Cenário**: CPF do desenvolvedor não encontrado no DTI
- **Ação**: Definir comportamento (criar task sem responsável, ignorar, ou logar erro)

### Transações
- **Requisito**: Importação deve ser atômica
- **Garantia**: Se falhar no meio do processo, não deixar dados inconsistentes

## Próximos Passos (Pendentes de Decisão)

1. **Conexão com banco de chamados**: Direta (segunda conexão PostgreSQL) ou via API?
2. **Valor de status fechado**: Qual valor específico de `status` indica chamado fechado?
3. **Sprint de destino**: Para qual projeto/sprint as tasks serão criadas?
4. **Tipo de cache**: Redis, tabela no banco, ou memória?
5. **Frequência de sincronização**: Intervalo de polling (ex: 5min, 15min)?
