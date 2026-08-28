---
name: tao-of-react
description: Build React frontends the Tao of React way — module-based structure, small single-responsibility components, state living close to where it's used — on a fixed stack of React, TypeScript, Tailwind CSS, React Router, Redux Toolkit and RTK Query, Framer Motion, Sonner, and shadcn/ui, with the Next.js App Router when SSR or SEO is needed and React Native (Expo) for mobile. Use this skill for ANY frontend work — scaffolding a new app, adding a page or screen, building a component or hook, wiring an API, adding a slice or endpoint, refactoring, reviewing frontend code, or debugging React — even when the user never says "React", names no libraries, and asks for nothing about architecture. Triggers include "build a dashboard", "add a login page", "hook this up to the backend", "make this page look better", "this component is a mess", "start a new project", "add a screen to the mobile app", and "why is this re-rendering".
---

# Tao of React

Architectural principles for building React applications that stay productive to work in as they grow. Adapted from Alex Kondov's *Tao of React*, with the styling and data-fetching layers replaced by this project's chosen stack.

The whole thing reduces to one idea: **a component is a function.** It takes props and returns markup. Every rule that follows is a rule you'd already apply to a function — keep it small, give it one job, name it, don't let it reach into things it shouldn't know about. When a rule here feels arbitrary, ask what you'd do if it were a plain function, and do that.

## The stack is fixed

Use these. Do not introduce a dependency that duplicates one of them.

| Concern | Choice | Notes |
|---|---|---|
| UI library | React 18+ (function components only) | Class components only for legacy error boundaries |
| Language | TypeScript, `strict: true` | No `any` in committed code; no `.js`/`.jsx` files |
| Styling | Tailwind CSS | No CSS-in-JS, no CSS modules, no SCSS |
| Components | shadcn/ui (Radix + CVA) | Copy in via CLI; own the code |
| Client routing | React Router (data router APIs) | `createBrowserRouter`, not `<Switch>`-era patterns |
| Server state | RTK Query | Not React Query, not SWR, not bare `fetch` in `useEffect` |
| Client state | Redux Toolkit slices | Only for state that is genuinely global |
| Animation | Framer Motion | Reanimated + Moti on React Native |
| Toasts | Sonner | One `<Toaster />` at the app root |
| SSR / SEO apps | Next.js App Router | See `references/nextjs.md` |
| Mobile | React Native via Expo | See `references/react-native.md` |
| Icons | lucide-react | shadcn's default; don't mix icon sets |
| Forms | react-hook-form + zod | `zodResolver`; schema is the source of truth |
| Tests | Vitest + React Testing Library | Playwright for E2E when asked |

Adding anything outside this list needs a stated reason. "It's popular" is not a reason.

## Before writing code

1. **Identify the platform** — plain React SPA, Next.js, or React Native. This decides which reference file you need.
2. **Read the reference files for the task** (table below). Read them; don't work from memory of what these libraries look like.
3. **Read the existing code first.** If the project already has conventions, match them even where they differ from this skill — one consistent codebase beats a correct-but-mixed one. Note the divergence to the user rather than silently rewriting.
4. **Decide where the code lives before writing it.** Which module? Is this shared or feature-local? Does the state belong in a component, a reducer, or the store? Deciding after the fact is how `components/` becomes a junk drawer.

## Reference map

Read the file that matches the task. Don't read all of them.

| Working on | Read |
|---|---|
| Any component, props, JSX, conditionals, lists | `references/components.md` |
| State, reducers, slices, API calls, caching, loading/error | `references/state-and-data.md` |
| New project, folders, file naming, imports, TS conventions | `references/project-structure.md` |
| Tailwind, shadcn, variants, animation, toasts, dark mode | `references/styling-and-motion.md` |
| Routes, layouts, guards, lazy loading, route errors | `references/react-router.md` |
| Anything in a Next.js app | `references/nextjs.md` |
| Anything in a React Native app | `references/react-native.md` |

## Core principles

Condensed. The reference files carry the examples and the edge cases.

### Components

- **Function components, always.** Name them — anonymous default exports produce useless stack traces and dev-tools output.
- **Size is about responsibilities, not lines.** If a component fetches, transforms, branches, and renders four sections, it's four things. Split it.
- **Extract lists.** A `.map()` in the middle of long markup wrecks readability. Move it into its own list component unless rendering that list is the component's whole job.
- **Destructure props, with defaults in the parameter list.** No `props.x` sprinkled everywhere, no `Component.defaultProps`.
- **Above ~5 props, look for a component that's doing too much.** Pass a related object (`user`) rather than four of its fields.
- **Helpers that don't need a closure go outside the component**, below it, taking values as arguments. Pure functions are easier to test and to reason about.
- **No nested render functions.** `renderHeader()` inside a component is a component you refused to name. Extract it.
- **Ternaries, not `&&`, for conditional rendering.** `{count && <X/>}` renders a literal `0`.
- **No nested ternaries in JSX.** Push the branching into a small component with early returns.
- **No hardcoded repetitive markup.** Nav items, filters, tabs, and option lists come from a typed config array.
- **Comment the domain, not the syntax.** `{/* Subscribers never see ads */}` earns its place; `{/* map over items */}` does not.
- **Error boundaries around independently-failing regions**, not just at the root. A broken widget should not blank the page.
- **Hooks over HOCs and render props.** With a hook you can see where every value came from.

### State

- **State lives as close to its use as possible.** Push it down until something breaks, not up until everything can see it.
- **Think stateful/stateless, not container/presentational.** Containers concentrate complexity in a few bloated files; responsibilities spread it where it belongs. A `<Form>` owns the form's data and validation; an `<Input>` receives a value and an error and calls back.
- **Climb the ladder in order:** derived value → `useState` → `useReducer` → React Context → Redux slice. Take the first rung that works. Several related `useState` calls that always change together are a `useReducer`.
- **Server data is not client state.** It belongs in RTK Query, which owns caching, invalidation, loading and error states. Never mirror fetched data into a slice "so components can read it."
- **Never `fetch` in `useEffect`** for data the app displays. That's a hand-rolled cache with no invalidation.

### Structure

- **Group by module/domain, never by technical kind.** `modules/checkout/`, not `containers/` + `components/`. A structure organised by domain tells a reader what the app does; one organised by kind only tells them it uses React.
- **A `common` module for genuinely shared pieces.** Buttons, inputs, layout, hooks, utils. Without it, four people build four buttons.
- **Absolute imports only** (`@/modules/...`). Relative paths break when files move and hide where things come from.
- **Wrap third-party components** behind a thin internal module so the library can be swapped or its API adapted in one place.
- **A component with siblings gets a folder** (component file, test, sub-parts, `index.ts`). Keep the real filename — never a directory full of `index.tsx`.

### Styling

- **Tailwind utilities in the markup.** This deliberately departs from the original Tao's CSS-in-JS recommendation; the article itself notes styling is a free choice.
- **Merge classes with `cn()`**, never string concatenation, so consumer overrides actually win.
- **Variants via CVA**, not a pile of boolean props each toggling classes.
- **Design tokens as CSS variables** in Tailwind config. No raw hex values in components.

### Performance

- **Don't optimise before you've measured.** Readable code is easier to make fast than fast code is to make readable.
- **Bundle size first.** Route-level code splitting matters more than re-render counts, every time.
- **Inline callbacks are fine by default.** Reach for `memo`/`useMemo`/`useCallback` when a profiler says so, or when a value feeds a dependency array where identity genuinely matters.
- **Hoist constant arrays and objects** above the component so they keep a stable identity.

### Testing

- **Test behaviour through the public interface**: does it render correctly for given props, respond to events, update state, call handlers with the right arguments.
- **Test edge cases** — empty arrays, failed requests, missing optional fields.
- **Skip snapshot tests.** They fail on every intentional change and catch almost nothing; the workflow degrades into blind `-u`.
- **Prefer a few integration tests** over many isolated unit tests. Components can each pass in isolation and still be wired together wrong.

## Naming and file conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `OrderSummary.tsx` |
| Hook | `useThing.ts` | `useOrderTotals.ts` |
| Slice | `thingSlice.ts` | `cartSlice.ts` |
| RTK Query API | `thingApi.ts` | `ordersApi.ts` |
| Types | `types.ts` in the module | `modules/orders/types.ts` |
| Constants / config | `SCREAMING_SNAKE` values in `constants.ts` | `ORDER_STATUSES` |
| Utilities | `camelCase.ts` | `formatCurrency.ts` |
| Boolean props | `is` / `has` / `can` prefix | `isDisabled`, `canEdit` |
| Handler props | `on` prefix; internal handlers `handle` prefix | `onSubmit` / `handleSubmit` |

## Never

These come up constantly in generated React and are all worth catching in review:

- `any`, or a `@ts-ignore` covering for one
- `useEffect` fetching data the UI renders
- Array index as a `key` in a list that can reorder, filter, or delete
- Server data duplicated into a Redux slice
- Deriving state into `useState` + `useEffect` when a plain expression during render would do
- Business logic inside presentational components
- A `<div onClick>` where a `<button>` belongs
- Barrel files that re-export a whole module and drag in the world
- Inline `style={{}}` for anything Tailwind can express
- `localStorage` reads during render instead of in an effect or a lazy initialiser
- Mutating Redux state outside a `createSlice` reducer (Immer only applies inside)

## Before saying you're done

- [ ] `tsc --noEmit` clean, lint clean
- [ ] Every async surface has an explicit loading state, error state, and empty state
- [ ] No component over ~150 lines without a reason you could defend
- [ ] Imports absolute, files in the right module
- [ ] Interactive elements reachable by keyboard; icon-only buttons have labels
- [ ] Layout checked at mobile width, not just desktop
- [ ] Nothing added to `package.json` that isn't in the stack table

## Deliberate departures from the original

Say so if the user asks why this differs from the article:

- **Styling**: Tailwind instead of Styled Components / Emotion. The article recommends CSS-in-JS but explicitly allows Tailwind; utility CSS also keeps the component file free of a second layer of abstraction.
- **Data fetching**: RTK Query instead of React Query / SWR. Same principle — a library owns caching, loading, and error state — implemented inside the Redux ecosystem this project already uses.
- **State libraries**: the article says most apps don't need one, and that's still true. Redux Toolkit here is for genuinely global client state (session, cross-route UI, complex flows) plus RTK Query as the data layer. It isn't a bucket for everything.
