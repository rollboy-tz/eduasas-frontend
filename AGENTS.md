# Project Development Guidelines & Rules

## 1. Language Policy
- **Conversation with User**: Always in Swahili (Kiswahili).
- **Code & Comments**: Strictly in English. All source code, types, interfaces, component names, variable names, and code comments MUST be written in English. Never use Swahili in code files.

## 2. Aesthetic & SaaS Visual Standards
- **Clean Enterprise SaaS**: No arbitrary or exaggerated drop-shadows, no glowing/neon edges, and no fuzzy blurred card effects.
- **Crisp Borders & Surfaces**: Use subtle, refined 1px borders (`border-border`), clean flat cards (`bg-card`), and deliberate contrast.
- **Refined Border Radii**: Avoid exaggerated or oversized border radii (e.g., avoid `rounded-2xl` or `rounded-3xl` on standard cards and containers). Keep them crisp and subtle: `rounded-md` (6px) or `rounded-lg` (8px), with `rounded-xl` (12px) as the ceiling for outer cards.
- **Banned**: Multi-layered glowing neon drop-shadows and purple-to-blue gradient clichés.

## 3. Internal Components & Architectural Rules
- **Input Fields**: Always use the project's internal field components (`EduInput`, `EduDateInput`, `EduSelect`, `EduTimeInput` from `@/components/fields`). Thoroughly leverage their validation, formatting, and masking capabilities instead of writing raw HTML `<input>` tags.
- **Buttons**: Consistently use `EduButton` (or `Button`) from `@/components/elements` / `@/components/atoms` to maintain uniform sizes, loading states, and icon positions.
- **Public Assets & Logo Branding**: Make proper use of assets in `/public/icons/` (e.g. `EduAsasLogo`, `logo-256.png`, `logo-1024-transparent.png`, `app-icon.png`). Never replace the official logo with generic placeholder icons.
- **Modals & Dialogs**: Utilize internal modal systems (`EduMainModal`, `AppConfirmModal`, `AppFeedbackModal`, `Dialog` from `@/components/modals`) for interactions, confirmations, and feedback.
- **Data Fetching & Mutations**: Always use `apiFetch` (for GET queries, unwraps data directly) and `apiMutation` (for POST, PUT, PATCH, DELETE operations) from `@/lib/api`. These ensure standard `ApiResponse` envelope parsing and canonical `ApiError` propagation compatible with TanStack Query.
- **Toasts**: Keep toast notifications intentional, minimal, and non-repetitive. Avoid spamming unneeded toasts on benign user actions.

## 4. Mobile-First Responsiveness
- Prioritize mobile users without sacrificing the desktop/power-user experience.
- Touch targets must be at least 44px on mobile devices.
- Responsive grids, collapsible menus/drawers, fluid spacing, and horizontal-scroll protection on data tables.

## 5. Sophisticated Glassmorphism
- Use tasteful, subtle glassmorphism (`backdrop-blur-md bg-background/80 border-b border-border/60`) only where appropriate:
  - Sticky top navigation bars
  - Floating action toolbars / action docks
  - Modals and popovers
- Never apply heavy glassmorphism across primary data cards or general text content.

## 6. Git Status & Synchronization
- Frequently monitor repository changes via Git (`git status`) to ensure changes stay in sync and clean.

## 7. Reserved Directories
- `Kazikubwa/` is a reserved directory for receiving downloaded files prior to code integration. Do not touch or modify its contents unless explicitly asked by the user.
