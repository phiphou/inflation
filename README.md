# inflation

A modern web application built with Vite.

## Tech Stack

- **Build Tool:** Vite
- **Framework:** React
- **Language:** TypeScript
- **CSS:** Tailwind CSS v4
- **UI Components:** Shadcn UI
- **State Management:** Zustand
- **Router:** TanStack Router
- **Testing:** Vitest
- **E2E Testing:** Playwright
- **Linter/Formatter:** Biome
- **Package Manager:** pnpm

## Getting Started

### Installation

```bash
pnpm install
```

### UI Components Setup

Install the base UI components:

```bash
pnpm setup-ui
```

Add more Shadcn UI components:

```bash
pnpm dlx shadcn@latest add dialog sheet table
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Testing

### Unit Tests (Vitest)

Run tests in watch mode:

```bash
pnpm test
```

Run tests once:

```bash
pnpm test:run
```

Run tests with UI:

```bash
pnpm test:ui
```

Run tests with coverage:

```bash
pnpm test:coverage
```

### E2E Tests (Playwright)

Install Playwright browsers (first time only):

```bash
pnpm playwright:install
```

Run E2E tests:

```bash
pnpm test:e2e
```

Run E2E tests with UI:

```bash
pnpm test:e2e:ui
```

## Code Quality

### Linting and Formatting (Biome)

Check for issues:

```bash
pnpm lint
```

Format code:

```bash
pnpm format
```

Check and fix issues:

```bash
pnpm check
```

## Docker

Preview production build with Docker:

```bash
pnpm docker-preview
```

The application will be available at `http://localhost:8080`

## Project Structure

```
.
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   ├── styles/        # CSS styles
│   ├── store/         # State management
│   ├── routes/        # Route files (TanStack Router)
│   ├── test-setup.ts  # Test configuration
│   └── main.tsx        # Application entry point
├── e2e/               # E2E tests
├── nginx/             # Nginx configuration
├── Dockerfile
├── docker-compose.yml
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── biome.json
└── package.json
```

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Biome Documentation](https://biomejs.dev/)

## License

MIT
