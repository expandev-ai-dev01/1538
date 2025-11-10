# TODO List - Backend API

Sistema de gerenciamento de tarefas - API REST

## Tecnologias

- Node.js
- TypeScript
- Express.js
- MS SQL Server
- Zod (validação)

## Estrutura do Projeto

```
src/
├── api/              # Controladores de API
├── routes/           # Definições de rotas
├── middleware/       # Middlewares Express
├── services/         # Lógica de negócio
├── utils/            # Funções utilitárias
├── instances/        # Instâncias de serviços
├── config/           # Configurações
└── server.ts         # Ponto de entrada
```

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
npm start
```

## Endpoints da API

### Health Check
- `GET /health` - Verifica status da API

### API v1
- Base URL: `/api/v1`
- External (público): `/api/v1/external`
- Internal (autenticado): `/api/v1/internal`

## Variáveis de Ambiente

Ver arquivo `.env.example` para lista completa de variáveis necessárias.

## Desenvolvimento

- Seguir padrões definidos em `backend_architecture_rest.md`
- Usar TypeScript strict mode
- Implementar validação com Zod
- Documentar com TSDoc
- Testes colocados junto aos arquivos fonte

## Licença

ISC