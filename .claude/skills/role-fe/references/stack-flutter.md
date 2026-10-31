# If the desk's stack is Flutter / Dart

The desk's `SYSTEM-FACTS.md` and the repo state the SDK version, architecture layers, state
management and module layout. Read them, and the repo's `pubspec.yaml` and `analysis_options.yaml`,
before you write anything. Match **that** repo's patterns, not another module's and not your
favourite.

## Routing

| Situation | Skill |
|---|---|
| Where code belongs (layers, view-model/repository/service split) | `dart-flutter:flutter-apply-architecture-best-practices`, applied to the host's existing architecture and never imposed on it |
| Screen must adapt across phone, tablet, desktop | `dart-flutter:flutter-build-responsive-layout` |
| Overflow stripes, unbounded constraints, RenderFlex errors | `dart-flutter:flutter-fix-layout-issues` |
| Widget behaviour and states | `dart-flutter:flutter-add-widget-test` |
| A user path end to end | `dart-flutter:flutter-add-integration-test` |
| Previewing a widget in isolation across states and sizes | `dart-flutter:flutter-add-widget-preview` |
| Routes or deep links (only if the TASK orders it) | `dart-flutter:flutter-setup-declarative-routing` |
| Strings or locales (only if the TASK names the ARB files) | `dart-flutter:flutter-setup-localization` |
| Model (de)serialisation | `dart-flutter:flutter-implement-json-serialization` |
| HTTP calls | `dart-flutter:flutter-use-http-package`, or the host's existing client if it has one |
| Analyse before and after | `dart-flutter:dart-run-static-analysis`, using the **analyze** part only in a guest repo (see below) |
| Runtime exception or red screen | `dart-flutter:dart-fix-runtime-errors` |
| Pure Dart logic | `dart-flutter:dart-add-unit-test` |
| Mocks for services or repositories | `dart-flutter:dart-generate-test-mocks` |
| `pub get` version conflict | `dart-flutter:dart-resolve-package-conflicts`. Any pubspec or lock change must be a named file, or it's a question |
| Sealed states, switch expressions, destructuring | `dart-flutter:dart-use-pattern-matching` |
| Runtime inspection, hot reload, widget tree, errors | the **Dart MCP server**, if connected. If it isn't, say so and fall back to `flutter run` plus logs |

## Guest-repo rules specific to Flutter

- **Never run a repo-wide formatter or fixer.** No `dart format .` and no `dart fix --apply`. Format
  only your named files by path, and only if the host formats.
- `flutter pub get` may rewrite `pubspec.lock`. Report it and don't commit it unless the TASK names
  it.
- Code generation (`build_runner`) regenerates files across the package. Run it only if the TASK
  names the generated outputs, and scope it if the host's setup allows that.
- Bumping a module's git ref in an app's `pubspec.yaml` is a release act. Do it only when the TASK
  orders it.

## Craft notes

- Text scale: test at 1.0 and at a large accessibility scale (e.g. 2.0). Nothing should clip or
  overflow.
- `Semantics` labels on icon-only buttons. Tap targets 48dp or more. Use focus traversal on
  desktop and web builds.
- Theme through `ThemeData` / `ColorScheme` / the host's design-system tokens. No literal `Color()`
  or `TextStyle` values in feature code.
- `const` constructors, `ListView.builder` for long lists, and dispose controllers and streams.
  Avoid rebuilding big subtrees on small state changes.
- Respect `MediaQuery.disableAnimations`. Keep motion short and use ease-out curves.
- Async UI: handle loading, empty, error and success explicitly (sealed state + switch). Guard
  `setState` and navigation after `await` with a `mounted` check.

## Evidence

The `flutter analyze` result (zero new issues compared with the baseline you recorded), the
`flutter test` counts before and after, and a local build or run. Screenshots or a description of
each state at phone and tablet widths, with large text. Anything only a person on a device can
confirm gets marked `UNVERIFIED — <what would settle it>`.
