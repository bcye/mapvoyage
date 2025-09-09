# Mapvoyage Development Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup
- Install pnpm globally: `npm install -g pnpm` (takes ~2 seconds)
- Install Deno: `wget -q https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip && unzip -q deno-x86_64-unknown-linux-gnu.zip && sudo mv deno /usr/local/bin/`
- Install dependencies:
  - Root: `pnpm install` (takes ~1 second)
  - App: `pnpm --dir app install` (takes ~57 seconds, NEVER CANCEL)
  - Server: `pnpm --dir server install` (takes ~11 seconds)

### Build and Test Process
- **NEVER CANCEL builds or dependency installations** - they may take up to 60 seconds
- Lint app code: `pnpm --dir app run lint` (takes ~5 seconds)
- Type check app: `pnpm --dir app run type-check` (takes ~5 seconds)
- Format check (will fail due to existing issues): `pnpm run format-check` (takes ~2 seconds)
- Build server: `pnpm --dir server run bundle` (builds to dist/index.cjs)

### Development Workflow

#### Running the Server
- Development server: `cd server && deno run -A --watch --unstable-sloppy-imports dev.ts`
- Built server: `cd server && node dist/index.cjs` (after running `pnpm run bundle`)
- Server runs on port 3000 by default
- Server uses tRPC for API endpoints

#### Running the Mobile App
- Web development: `cd app && npx expo start --web --port 8080` 
  - NEVER CANCEL: Takes ~25 seconds to bundle 3648 modules. Set timeout to 60+ minutes.
  - **Known Issue**: Web version has JavaScript module errors that prevent proper rendering
- Mobile development: `cd app && npx expo start` (for iOS/Android with Expo Go or development build)

#### Full Development Environment
- Use tmux-based workflow: `./start-dev.sh` (requires ngrok authentication for tunnel)
- Stop development: `./kill-dev.sh`
- **Note**: The tunnel requires ngrok setup and authentication

## Project Structure and Navigation

### Key Directories
- `/app/` - React Native mobile application (Expo-based)
- `/server/` - tRPC backend server (Deno runtime)
- `/.github/workflows/` - CI/CD pipelines

### Important Files
- `/package.json` - Root workspace configuration
- `/app/package.json` - Mobile app dependencies and scripts
- `/server/package.json` - Server dependencies and scripts
- `/app/.env.example` - Environment variables template
- `/app/app.config.ts` - Expo configuration
- `/server/dev.ts` - Development server entry point

### Technology Stack
- **Frontend**: React Native with Expo, TypeScript, NativeWind (Tailwind for RN)
- **Backend**: tRPC server running on Deno
- **Package Manager**: pnpm (workspace configuration)
- **Mapping**: MapLibre React Native
- **State Management**: Jotai, Zustand
- **Navigation**: Expo Router (file-based routing)

## Validation and Testing

### Manual Validation Steps
- Always run linting and type checking before committing: `pnpm --dir app run lint && pnpm --dir app run type-check`
- Test server functionality by starting it and making HTTP requests to http://localhost:3000
- **Web App Testing**: Web version currently has module import errors - focus on mobile development
- **No Tests**: Project currently has no test files - Jest is configured but unused

### CI/CD Validation
- All PRs run through GitHub Actions checking:
  - ESLint (`pnpm --dir app run lint`)
  - TypeScript (`pnpm --dir app run type-check`) 
  - Prettier formatting (`pnpm run format-check`)
- Mobile builds use EAS (Expo Application Services) for iOS/Android

### Environment Variables Required
```
EXPO_PUBLIC_MAPTILER_KEY=
EXPO_PUBLIC_MEILISEARCH_KEY=
EXPO_PUBLIC_TRPC_BASE_URL=
VARIANT="development | production"
```

## Known Issues and Limitations

### Development Issues
- **Web version does not render properly** due to "Cannot use 'import.meta' outside a module" error
- Format checking fails due to existing formatting issues in codebase
- Server requires specific Deno flags: `--unstable-sloppy-imports`
- Tunnel functionality requires ngrok authentication

### Timeouts and Performance
- App dependency installation: 57 seconds (NEVER CANCEL, set 90+ second timeout)
- Web app bundling: 25 seconds for 3648 modules (NEVER CANCEL, set 60+ minute timeout)
- Server dependency installation: 11 seconds
- Linting and type checking: ~5 seconds each

## Common Tasks

### Adding New Features
1. Always work in the `/app/` directory for mobile features
2. Use Expo Router for navigation (file-based routing in `/app/app/` directory)
3. Follow existing patterns using Jotai for state management
4. Use NativeWind for styling (Tailwind CSS classes)

### Server Development
1. Work in `/server/` directory
2. Use tRPC for type-safe API development
3. Test with `deno run -A --watch --unstable-sloppy-imports dev.ts`
4. Build for production with `pnpm run bundle`

### Pre-commit Checklist
- Run `pnpm --dir app run lint` - must pass
- Run `pnpm --dir app run type-check` - must pass
- Test server starts without errors
- **Skip format-check** - known to fail due to existing issues

## Build Information

### Mobile Builds
- Use EAS for production builds: `eas build --platform [ios|android] --profile production`
- Local builds: `eas build --platform [ios|android] --profile preview --local`
- Requires EAS CLI: `npm install -g eas-cli`

### Dependencies Summary
- **Node.js**: v20.19.4+ required
- **pnpm**: v10.15.0+ (workspace package manager)
- **Deno**: Latest version for server development
- **Expo CLI**: For mobile development (`npx expo` or global install)