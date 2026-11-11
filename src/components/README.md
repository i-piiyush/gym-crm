# Components Directory (`src/components`)

Contains reusable UI primitives, layout structures, motion primitives, and shared widgets.

## Subdirectories
- `ui/`: shadcn/ui generated atomic components (Button, Dialog, Dropdown, Table, Input, etc.). Customizations must follow design tokens. Icon imports must use `react-icons/lu` exclusively (no lucide-react). Toasts must use shadcn `Sonner`.
- `layout/`: Global layout components across portals: `Sidebar`, `BottomNav`, `Topbar`, and `PageHeader`.
- `shared/`: Composite UI components used across multiple features:
  - `DataTable`: Generic paginated/sortable data table with filter toolbar.
  - `StatCard`: Standardized metric card supporting animations, icons, and trends.
  - `EmptyState`: Empty view with icon, message, and primary CTA.
  - `ConfirmDialog`: Modal confirmation for destructive operations.
  - `StatusBadge`: Semantic color-coded pill for membership, payment, and invite states.
  - `PhoneInput`: E.164 phone number input defaulting to +91.
- `motion/`: Micro-interaction wrappers powered by `motion/react`:
  - `FadeIn`: Opacity and subtle translate transition.
  - `PressableButton`: `whileTap={{ scale: 0.97 }}` interaction wrapper.
  - `StaggerList` & `StaggerItem`: Staggered list entrance animations (50ms offset).
  - `AnimatedNumber`: Count-up animation for numeric stats.
  - `CountdownRing`: SVG countdown circle for rotating QR codes.

