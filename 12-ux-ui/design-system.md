# Design system - Guardian Escolar

> Visual system for the Guardian Escolar Angular web frontend frontend. This document defines the tokens and patterns for the screens described in [navigation-map-guardian-escolar.md](navigation-map.md).
>
> **Rule:** reuse shared project components first. Create a new variant only when no equivalent pattern exists here.

---

## Technology scope

| Area | Implementation |
|------|----------------|
| Framework | Angular 21, standalone components |
| Base components | Angular Material 3: `mat-toolbar`, `mat-button`, `mat-icon`, `mat-sidenav`, `mat-dialog` |
| Icons | Phosphor Icons and Angular Material Icons |
| Styling | Component-level CSS/SCSS and global `src/styles.css` |
| Translations | `@ngx-translate/core` |
| Themes | Light and dark themes for blue, green, yellow, and red |
| Material density | `0` |

Visual contexts:

- **Public:** `/home`, `/auth/*`, and `/contact`.
- **Administration:** `/dashboard-admin` and `/admin/*`.
- **Super administration:** `/dashboard-superadmin` and `/superadmin/*`.
- `ADMIN` and `SUPER_ADMIN` share the profile and email, password, and contact change flows under `/admin`.

## Design tokens

Tokens are defined in web frontend application. New components must consume CSS variables to support theme switching.

### Base colors

```css
/* Blue light theme */
--bg-color: #F0F4F8;
--card-bg: #FFFFFF;
--card-secondary-bg: #F8FAFC;
--text-color: #111827;
--title-color: #1A2E4A;
--text-secondary: #64748B;
--border-color: #E2E8F0;

/* Navigation and actions */
--color-navbar: #1A56DB;
--accent-color: #003AB8;
--hover-color: #2061EC;
--button-apply: #1A56DB;
--button-cancel: #FFFFFF;

/* Errors */
--alert-bg: #FEF2F2;
--alert-title: #7F1D1D;
--alert-text: #374151;
--alert-icon: #DC2626;

/* Inputs and modals */
--input-bg: #FFFFFF;
--input-border: #CBD5E1;
--modal-bg: #FFFFFF;
--mat-sys-surface: #FFFFFF;
```

### Themes

| Theme | `--color-navbar` | `--button-apply` |
|-------|------------------|------------------|
| `light-theme-blue` | `#1A56DB` | `#1A56DB` |
| `light-theme-green` | `#16A34A` | `#16A34A` |
| `light-theme-yellow` | `#D4A017` | `#D4A017` |
| `light-theme-red` | `#B42318` | `#B42318` |
| `dark-theme-blue` | `#0F2E6B` | `#3B82F6` |
| `dark-theme-green` | `#0B4A24` | `#22C55E` |
| `dark-theme-yellow` | `#B8860B` | `#FACC15` |
| `dark-theme-red` | `#5B1215` | `#DC2626` |

Themes also define `--navbar-gradient`, `--card-shadow`, `--hover-card`, `--color-icon`, `--border-icon`, `--input-border`, and modal surfaces.

### Angular Material

`material-theme.scss` configures Material 3 with Blue as the primary palette, Indigo as the tertiary palette, Roboto typography, and density `0`. Do not introduce a parallel global palette without coordinating it with `styles.css`.

### Typography

| Use | Value |
|-----|-------|
| Base | `"Segoe UI", Arial, sans-serif` |
| Material | `Roboto` |
| Navbar title | `20px`, weight `500` |
| Form titles | `1.5rem` |
| Secondary text | `0.85rem` to `1rem`, `var(--text-secondary)` |
| Labels | `0.78rem`, weight `500`, uppercase |
| Phosphor icons | `1.5rem` |

### Spacing, radii, and shadows

| Use | Reference value |
|-----|-----------------|
| Base spacing | `4px`, `8px`, `12px`, `16px`, `24px`, `32px` |
| Compact controls | `5px` to `10px` radius |
| Cards and modals | `16px` radius |
| Existing form buttons | `50px` radius |
| Cards | `0 4px 12px rgba(0, 0, 0, 0.08)` |
| Modals | `var(--shadow-modal)` |

## Layout and navigation

### Top bars

| Component | Context | Use |
|-----------|---------|-----|
| `Navbar` | Public home | Login, contact, and responsive `MatSidenav` |
| `NavComponent` | Login and data changes | Guardian Escolar identity and back navigation |
| `NavbarManage` | Dashboards | Management toolbar and back navigation |
| `NavbarAdmin` | Administration | Icon access to users and families |

The shared toolbar uses a `56px` height, `var(--color-navbar)`, a `20px` title, and icon buttons. Every standalone icon must have an `aria-label` or tooltip.

### Sidebars

`SidebarAdmin` and `SidebarSuperadmin` use the shared `_navbar-shared.scss` style:

- `200px` width and `var(--color-navbar)` background.
- Items with an `8px` radius and `2px` spacing.
- Hover state with an 8% white overlay.
- Active state with a 15% white overlay and weight `500`.
- Profile placed in a separate bottom section.

The super administrator sidebar includes administrators, schools, and profile. The profile also provides access to email, password, and contact changes.

### Responsive behavior

- The public sidenav closes above `1024px`.
- The left information panel in session flows is hidden below `1000px`.
- Forms and cards switch from two columns to one on small screens.
- Horizontal scrolling and overlapping controls are not allowed.

## Components

### Buttons

| Type | Implementation | Use |
|------|----------------|-----|
| Primary | `MatButton` or `var(--button-apply)` | Save, continue, apply |
| Secondary | Light background and `var(--border-color)` border | Cancel, back |
| Navigation | `MatIconButton` or Phosphor | Back, menu, view changes |
| Critical | Confirmation modal plus action | Delete or irreversible changes |
| Link | `var(--accent-color)` | Return to login or go to contact |

Every button needs hover, visible focus, disabled, and loading states when it calls the API. Critical actions must never execute when a modal is closed.

### Forms

Forms use Angular Reactive Forms, `Validators`, `ChangePassword`, and `ChangeInformation`.

| Field | Routes |
|-------|--------|
| Email | Login, recovery, and email change |
| Password | Login, recovery, and password change |
| Code | Six-character alphanumeric segmented code |
| Phone | Contact change with international format |
| Personal data | Profile, students, parents, drivers, and families |

Rules:

- Mark all controls as touched when the form is invalid.
- Show the error below the field and explain how to fix it.
- Preserve focus and keyboard order across the six code fields.
- Passwords require at least eight characters, an uppercase letter, a lowercase letter, a number, and a special character.
- Every control must have an associated label; do not use the placeholder as the only label.

### Management cards

`CardList` is the main pattern for `/admin/*` and `/superadmin/*`:

- `var(--card-bg)` background, `0.5px` border, and `var(--card-shadow)`.
- `16px` radius.
- Header with Material icon, translatable title, and divider.
- Full-width or two-column fields through `halfWidth`.
- Types: student, guardian, driver, family, bus, stop, route, administrator, and school.
- Details through `RecordInformation`; editing and deletion through their respective modals.

Use `CardRegister` for creation when no specialized form exists.

### Modals

Shared modals use a fixed overlay, `var(--modal-bg)`, a maximum width between `400px` and `420px`, a `16px` radius, and a `0.2s` `slideUp` animation.

| Component | Use |
|-----------|-----|
| `Confirmations` | Confirm password recovery and accepted actions |
| `DeleteRecord` | Confirm deletion |
| `UpdateInformation` | Edit information |
| `RecordInformation` | View details |
| `Comments` | Record comments |
| `Language` / themes | Change language or theme |

### Iconography

- Angular Material Icons for navigation and CRUD entities: `group`, `school`, `directions_bus`, `route`.
- Phosphor Icons for public experience illustrations and actions.
- Base size: `1.5rem` for Phosphor; `18px` for sidebar items.
- Do not draw icons manually or introduce a third icon system.

### Feedback

| Situation | Pattern |
|-----------|---------|
| Form error | Inline message, invalid border, and `.error-message` |
| Invalid credentials | Visible error on login |
| Confirmation | `Confirmations` or Material dialog |
| Loading | Spinner or disabled control during the request |
| Success | Visible message before navigation |
| API error | Actionable feedback without internal details |

Loading, empty, and error states must preserve the content space to avoid layout shifts.

## Data tables and lists

The project mainly uses `CardList` and `CardRegister` for management screens instead of a generic table. This pattern applies to students, parents, drivers, families, buses, stops, routes, administrators, and schools.

| Aspect | Guardian Escolar rule |
|--------|----------------------|
| Presentation | Cards with a header, Material icon, and record fields |
| Fields | One or two columns through `halfWidth` |
| Details | Open `RecordInformation` without leaving the management screen |
| Editing | Use `UpdateInformation` or the relevant specialized form |
| Deletion | Use `DeleteRecord` with explicit confirmation |
| Creation | Use `CardRegister` when no specialized form exists |
| Empty state | Show a message oriented toward the first available action |
| Loading | Preserve the card structure while the API is loading |

If a Material table is added in the future, it must preserve the same loading, empty, error, selection, and action states as the existing cards. Pagination, sorting, and filters must be defined with the API contract before implementation.

## UX patterns

### Principles

1. **Confirm before destroying:** every deletion or irreversible modification requires a confirmation modal.
2. **Immediate feedback:** every action must show an immediate visual change through an active, validation, or loading state.
3. **Prevent rather than correct:** validate forms before navigation or API calls.
4. **Maintain context:** recovery and data-change steps use progress bars and back navigation.
5. **Design the empty state:** an empty list must guide the user toward the first available action.
6. **Respect roles:** `ADMIN` and `SUPER_ADMIN` share the profile, while administration and super administration keep separate dashboards and menus.

### Navigation and confirmations

- The root and unknown routes return to `/home` because the current routing has no dedicated 404 screen.
- Public flows return to `/auth/login` after password reset.
- Profile flows return to `/admin/informacion` when cancelled or completed.
- Profile, email, password, and contact changes are available to `ADMIN` and `SUPER_ADMIN`.
- Role protection must be enforced by the backend or guards; `app.routes.ts` currently declares no `canActivate` guards.

## Error handling

| Scenario | Expected response |
|----------|-------------------|
| Invalid form | Mark controls, show a message below the field, and explain how to fix it |
| Invalid credentials | Show a visible error at `/auth/login` without revealing sensitive information |
| Network error | Show connection feedback and allow the operation to be retried |
| `401` | Invalidate the session and redirect to `/auth/login` with a session-expired notice |
| `403` | Explain that the role has no permission and hide unauthorized actions |
| Resource `404` | Show an empty or resource-error state; do not confuse it with the route wildcard |
| Route `404` | Redirect to `/home`, which is the current Angular wildcard behavior |
| `500` | Show a general error and retry action without internal details |
| Timeout | Explain that the operation is taking longer than expected and preserve context |

Visible messages should be managed through `TranslateModule` when an equivalent translation key exists. API errors must not expose exceptions, SQL, tokens, or personal information.

## Navigation-based patterns

| Area | Routes | Pattern |
|------|--------|---------|
| Public | `/home`, `/contact` | Public navbar, informational content, and footer |
| Authentication | `/auth/login`, `/auth/forgot-password/*` | `NavComponent`, two-panel layout, and progress |
| Admin | `/dashboard-admin`, `/admin/*` | `NavbarManage`, `SidebarAdmin`, cards, and modals |
| Superadmin | `/dashboard-superadmin`, `/superadmin/*` | `NavbarManage`, `SidebarSuperadmin`, cards, and shared profile |
| Profile | `/admin/informacion`, `/admin/change-*/*` | Profile and step-by-step flow |

## UX and accessibility

1. Validate before submission and provide immediate feedback.
2. Confirm deletions and irreversible changes.
3. Preserve context in email, password, and contact flows.
4. Return to `/admin/informacion` or `/auth/login` according to the flow.
5. Do not consider a role protected without backend or guard validation.

| Aspect | Minimum |
|--------|---------|
| Contrast | WCAG AA: `4.5:1` normal text and `3:1` large text |
| Keyboard | All interactive elements operable with a keyboard |
| Focus | Visible indicator |
| Forms | Associated label and programmatic invalid state |
| Icons | Accessible text or `aria-label` |
| Responsive | No overlap or horizontal scrolling |
| Language | Text managed through `TranslateModule` |

## Status

### Implemented

- Eight theme variants.
- Angular Material 3 and standalone components.
- Navbar, sidebars, CRUD cards, modals, and data-change forms.
- Translations in navigation and main components.
- Basic responsive behavior for the public navbar and session flows.

### Pending standardization

- Consolidate radius, shadow, focus, and overlay tokens.
- Create a shared table component if lists stop using cards.
- Standardize API loading, empty, and error states.
- Add authentication and role guards; `app.routes.ts` currently declares no `canActivate` guards.
- Review contrast across all combinations, especially light text on yellow.

## Correlations

- Base design system: `12-ux-ui/design-system.md`
- Navigation map: `12-ux-ui/navigation-map-guardian-escolar.md`
- Angular routes: web frontend application
- Tokens: web frontend application
- Material theme: web frontend application
- Navigation components: web frontend application
- Card components: web frontend application
- Modal components: web frontend application
