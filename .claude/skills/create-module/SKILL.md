---
name: create-module
description: Scaffold a complete hexagonal/CQRS feature module (domain, application, REST adapter, in-memory repository, module, unit tests) in a NestJS repo from a module name and model props. Use when the user asks to create, scaffold or generate a new module, feature, resource or CRUD.
argument-hint: <module_name> <prop:type[?][:unique]>...
---

# create-module

Generates a vertical slice `src/{module_names}/` with hexagonal architecture and CQRS-style commands/queries. Persistence is an **in-memory repository adapter**; nothing Prisma-related is ever generated.

## Input

```
/create-module product id:number name:string price:number description:string? sku:string:unique
```

- First arg: singular module name (any case; normalize it).
- Props: `name:type`, optional suffixes `?` (nullable/optional) and `:unique`.
- Types: `string`, `number`, `boolean`, `date` (maps to `Date`).
- **No props are added implicitly.** Everything the model has must be declared in the input.
- `id` is required and must be declared with type `number` or `string` only (no `?`, no `:unique`). It is the identity: the repository generates it (`number` auto-increments, `string` uses `crypto.randomUUID()`), so it is excluded from commands, request DTOs and normalization. If `id` is missing, ask with AskUserQuestion; do not generate without it.
- If name or props are missing/ambiguous, ask with AskUserQuestion.

## Placeholders

Example: module `product`.

| Placeholder     | Meaning                 | Example    |
| --------------- | ----------------------- | ---------- |
| `{module_name}`  | singular, kebab-case    | `product`  |
| `{module_names}` | plural, kebab-case      | `products` |
| `{ModuleName}`   | singular, PascalCase    | `Product`  |
| `{ModuleNames}`  | plural, PascalCase      | `Products` |
| `{moduleName}`   | singular, camelCase     | `product`  |

If the plural is irregular, ask. `{prop}`/`{Prop}`/`{prop-kebab}` are a prop's camel/Pascal/kebab forms. `<Id>` is the declared TS type of `id` (`number` | `string`). `{{each prop}}` iterates over the declared props **excluding `id`**.

## Folder structure (generated under `src/{module_names}/`)

```
├── application
│   ├── command
│   │   ├── create-{module_name}.command.ts
│   │   ├── delete-{module_name}.command.ts
│   │   └── update-{module_name}.command.ts
│   ├── port
│   │   ├── in
│   │   │   ├── create-{module_name}.use-case.ts
│   │   │   ├── delete-{module_name}.use-case.ts
│   │   │   ├── get-{module_name}.use-case.ts
│   │   │   ├── list-{module_names}.use-case.ts
│   │   │   └── update-{module_name}.use-case.ts
│   │   └── out
│   │       └── {module_name}-repository.port.ts
│   ├── query
│   │   ├── get-{module_name}.query.ts
│   │   ├── list-{module_names}.query.ts
│   │   └── {module_name}.read-model.ts
│   └── service
│       └── {module_name}.service.ts
├── domain
│   ├── exception
│   │   ├── {module_name}-not-found.exception.ts
│   │   ├── invalid-{module_name}.exception.ts
│   │   └── {module_name}-{prop-kebab}-already-in-use.exception.ts   # one per :unique prop
│   └── model
│       └── {module_name}.ts
├── infrastructure
│   └── adapter
│       ├── in
│       │   └── rest
│       │       ├── dto
│       │       │   ├── create-{module_name}.request.dto.ts
│       │       │   ├── update-{module_name}.request.dto.ts
│       │       │   └── {module_name}.response.dto.ts
│       │       ├── mappers
│       │       │   └── {module_name}.mapper.ts
│       │       ├── global-exception.handler.ts
│       │       └── {module_names}.controller.ts
│       └── out
│           └── persistence
│               └── in-memory
│                   └── in-memory-{module_name}.repository.adapter.ts
└── {module_names}.module.ts
```

Plus, outside the module: an import of `{ModuleNames}Module` in `src/app.module.ts`, and the spec `test/src/{module_names}/application/service/{module_name}.service.spec.ts`.

File contents are in `references/templates.md`.

## Workflow

1. Parse input. Abort if `src/{module_names}/` already exists.
2. Read `references/templates.md`.
3. Generate every file in the structure above, filling in the templates.
4. Add `{ModuleNames}Module` to the `imports` of `src/app.module.ts` (relative import ending in `.js`).
5. Generate the unit spec.
6. Run `npm run format`, `npm run lint`, `npm run build`, `npm test`. Fix failures; report honestly if anything still fails.
7. Summarize created files and endpoints (`POST/GET /{module_names}`, `GET/PATCH/DELETE /{module_names}/:id`).

## Hard rules

- Relative imports end in `.js` (ESM, `module: nodenext`).
- `domain/` must not import `@nestjs/*`.
- Ports are abstract classes (they are the Nest DI tokens), never interfaces.
- Dependency direction: infrastructure → application → domain.
- **No Prisma**: do not touch `prisma/schema.prisma`, `src/generated/`, migrations, or `PrismaService`.
- Don't modify other existing modules.
- The in-memory adapter lives in `src/` (it is the real adapter bound in the module); the spec imports it from there. Do not duplicate it under `test/`.
