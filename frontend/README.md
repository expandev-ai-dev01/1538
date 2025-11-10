# TODO List App

Sistema de gerenciamento de tarefas

## Features

- Criação de Tarefas
- Categorização de Tarefas
- Definição de Prioridades
- Estabelecimento de Prazos
- Marcação de Conclusão
- Busca de Tarefas
- Notificações e Lembretes
- Compartilhamento de Tarefas
- Visualização em Calendário
- Sincronização Multiplataforma

## Tech Stack

- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.11
- React Router DOM 6.26.2
- TanStack Query 5.59.20
- Zustand 5.0.1
- React Hook Form 7.53.1
- Zod 3.23.8
- Tailwind CSS 3.4.14
- Axios 1.7.7

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Application configuration
│   ├── App.tsx            # Root component
│   └── router.tsx         # Routing configuration
├── assets/                # Static assets
│   └── styles/           # Global styles
├── core/                  # Core functionality
│   ├── components/       # Shared components
│   ├── lib/              # Library configurations
│   ├── utils/            # Utility functions
│   ├── types/            # Global types
│   └── constants/        # Global constants
├── domain/               # Business domains
├── pages/                # Page components
│   ├── layouts/         # Layout components
│   ├── Home/            # Home page
│   └── NotFound/        # 404 page
└── main.tsx             # Application entry point
```

## API Configuration

The application is configured to work with a REST API backend:

- Public endpoints: `/api/v1/external/*`
- Authenticated endpoints: `/api/v1/internal/*`

Configure the API URL in your `.env` file:

```
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
```

## License

Private project