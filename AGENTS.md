# Project Development Guidelines & Rules

## 1. Language Policy
- **Conversation with User**: Always in Swahili (Kiswahili).
- **Code & Comments**: Strictly in English. All source code, types, interfaces, component names, variable names, and code comments MUST be written in English. Never use Swahili in code files.

## 2. Aesthetic & SaaS Visual Standards
- **Clean Enterprise SaaS**: No arbitrary or exaggerated drop-shadows, no glowing/neon edges, and no fuzzy blurred card effects.
- **Crisp Borders & Surfaces**: Use subtle, refined 1px borders (`border-border`), clean flat cards (`bg-card`), and deliberate contrast.
- **Banned**: Multi-layered glowing neon drop-shadows and purple-to-blue gradient clichés.

## 3. Mobile-First Responsiveness
- Prioritize mobile users without sacrificing the desktop/power-user experience.
- Touch targets must be at least 44px on mobile devices.
- Responsive grids, collapsible menus/drawers, fluid spacing, and horizontal-scroll protection on data tables.

## 4. Sophisticated Glassmorphism
- Use tasteful, subtle glassmorphism (`backdrop-blur-md bg-background/80 border-b border-border/60`) only where appropriate:
  - Sticky top navigation bars
  - Floating action toolbars / action docks
  - Modals and popovers
- Never apply heavy glassmorphism across primary data cards or general text content.

## 5. Git Status & Synchronization
- Frequently monitor repository changes via Git (`git status`) to ensure changes stay in sync and clean.

## 6. Reserved Directories
- `Kazikubwa/` is a reserved directory for receiving downloaded files prior to code integration. Do not touch or modify its contents unless explicitly asked by the user.
