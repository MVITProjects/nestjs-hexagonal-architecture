# Templates

Placeholders: see SKILL.md (`{module_name}`, `{module_names}`, `{ModuleName}`, `{ModuleNames}`, `{moduleName}`).
Blocks: `{{each prop}}`, `{{each unique prop}}`, `{{each optional prop}}` (all exclude `id`). `<T>` = TS type of the prop. `<Id>` = declared TS type of `id` (`number` | `string`). No implicit props: there is no `createdAt` unless the user declares it as a normal prop.
Optional props are `<T> | null` in domain / read-model / response, and `?` in commands / DTOs.

All paths are relative to `src/{module_names}/`. The relative-import depth is noted per section.

## domain/model/{module_name}.ts  (imports `../exception/`)

```ts
import { Invalid{ModuleName}Exception } from '../exception/invalid-{module_name}.exception.js';

export interface {ModuleName}Primitives {
  id: <Id> | null;
  {{each prop}}{prop}: <T>;
}

export class {ModuleName} {
  private constructor(
    public readonly id: <Id> | null,
    {{each prop}}private _{prop}: <T>,
  ) {}

  static create(props: {
    {{each prop}}{prop}: <T>;   // optional: {prop}?: <T> | null;
  }): {ModuleName} {
    return new {ModuleName}(
      null,
      {{each prop}}{ModuleName}.normalize{Prop}(props.{prop}),
    );
  }

  static fromPrimitives(p: {ModuleName}Primitives): {ModuleName} {
    return new {ModuleName}(p.id, {{each prop}}p.{prop});
  }

  {{each prop}}get {prop}(): <T> {
    return this._{prop};
  }

  {{each prop}}change{Prop}(value: <T>): void {
    this._{prop} = {ModuleName}.normalize{Prop}(value);
  }

  toPrimitives(): {ModuleName}Primitives {
    return {
      id: this.id,
      {{each prop}}{prop}: this._{prop},
    };
  }

  // One private static normalize{Prop}(value) per prop:
  //  required string : trim; empty/undefined -> throw new Invalid{ModuleName}Exception('{prop}', value)
  //  optional string : trim; empty/undefined -> null
  //  number          : Number.isFinite(value) else throw Invalid{ModuleName}Exception
  //  boolean         : typeof value === 'boolean' else throw
  //  date            : value instanceof Date && !Number.isNaN(value.getTime()) else throw
  //  optional non-string: undefined -> null
  // Example (required string):
  //   private static normalizeName(value: string): string {
  //     const v = value?.trim();
  //     if (!v) throw new Invalid{ModuleName}Exception('name', value);
  //     return v;
  //   }
}
```

## domain/exception/  (no imports)

```ts
// {module_name}-not-found.exception.ts
export class {ModuleName}NotFoundException extends Error {
  constructor(id: <Id>) {
    super(`{ModuleName} #${id} not found`);
    this.name = '{ModuleName}NotFoundException';
  }
}

// invalid-{module_name}.exception.ts
export class Invalid{ModuleName}Exception extends Error {
  constructor(field: string, value: unknown) {
    super(`Invalid {moduleName} ${field}: "${String(value)}"`);
    this.name = 'Invalid{ModuleName}Exception';
  }
}

// {{each unique prop}} {module_name}-{prop-kebab}-already-in-use.exception.ts
export class {ModuleName}{Prop}AlreadyInUseException extends Error {
  constructor(value: unknown) {
    super(`{ModuleName} {prop} "${String(value)}" is already in use`);
    this.name = '{ModuleName}{Prop}AlreadyInUseException';
  }
}
```

## application/command/  (no imports)

```ts
// create-{module_name}.command.ts
export class Create{ModuleName}Command {
  {{each prop}}readonly {prop}: <T>;   // optional: readonly {prop}?: <T>;

  constructor(props: { {{each prop}}{prop}: <T>; /* optional: {prop}?: <T> */ }) {
    {{each prop}}this.{prop} = props.{prop};
  }
}

// update-{module_name}.command.ts  (id required, every prop optional)
export class Update{ModuleName}Command {
  readonly id: <Id>;
  {{each prop}}readonly {prop}?: <T>;

  constructor(props: { id: <Id>; {{each prop}}{prop}?: <T> }) {
    this.id = props.id;
    {{each prop}}this.{prop} = props.{prop};
  }
}

// delete-{module_name}.command.ts
export class Delete{ModuleName}Command {
  readonly id: <Id>;

  constructor(props: { id: <Id> }) {
    this.id = props.id;
  }
}
```

## application/query/  (read-model imports `../../domain/`)

```ts
// get-{module_name}.query.ts
export class Get{ModuleName}Query {
  readonly id: <Id>;

  constructor(props: { id: <Id> }) {
    this.id = props.id;
  }
}

// list-{module_names}.query.ts
// Empty for now; extend with filters/pagination when needed.
export class List{ModuleNames}Query {}

// {module_name}.read-model.ts
import { {ModuleName} } from '../../domain/model/{module_name}.js';

export class {ModuleName}ReadModel {
  constructor(
    readonly id: <Id> | null,
    {{each prop}}readonly {prop}: <T>,
  ) {}

  static fromDomain({moduleName}: {ModuleName}): {ModuleName}ReadModel {
    const p = {moduleName}.toPrimitives();
    return new {ModuleName}ReadModel(p.id, {{each prop}}p.{prop});
  }
}
```

## application/port/in/  (imports `../../../domain/`, `../../command/`, `../../query/`)

One abstract class per use case:

```ts
// create-{module_name}.use-case.ts
import { {ModuleName} } from '../../../domain/model/{module_name}.js';
import { Create{ModuleName}Command } from '../../command/create-{module_name}.command.js';

export abstract class Create{ModuleName}UseCase {
  abstract create(command: Create{ModuleName}Command): Promise<{ModuleName}>;
}
```

- `get-{module_name}.use-case.ts` → `Get{ModuleName}UseCase`: `abstract getById(query: Get{ModuleName}Query): Promise<{ModuleName}ReadModel>;`
- `list-{module_names}.use-case.ts` → `List{ModuleNames}UseCase`: `abstract list(query: List{ModuleNames}Query): Promise<{ModuleName}ReadModel[]>;`
- `update-{module_name}.use-case.ts` → `Update{ModuleName}UseCase`: `abstract update(command: Update{ModuleName}Command): Promise<{ModuleName}>;`
- `delete-{module_name}.use-case.ts` → `Delete{ModuleName}UseCase`: `abstract delete(command: Delete{ModuleName}Command): Promise<void>;`

## application/port/out/{module_name}-repository.port.ts  (imports `../../../domain/`)

```ts
import { {ModuleName} } from '../../../domain/model/{module_name}.js';

/** Driven (out) port. Abstract class so it doubles as the Nest DI token. */
export abstract class {ModuleName}RepositoryPort {
  abstract save({moduleName}: {ModuleName}): Promise<{ModuleName}>;
  abstract findById(id: <Id>): Promise<{ModuleName} | null>;
  abstract findAll(): Promise<{ModuleName}[]>;
  abstract delete(id: <Id>): Promise<void>;
  {{each unique prop}}abstract findBy{Prop}({prop}: <T>): Promise<{ModuleName} | null>;
}
```

## application/service/{module_name}.service.ts  (imports `../../domain/`, `../command/`, `../port/`, `../query/`)

```ts
import { Injectable } from '@nestjs/common';
// ...imports: all exceptions, the model, 3 commands, 5 use cases, repository port, 2 queries, read model

@Injectable()
export class {ModuleName}Service
  implements
    Create{ModuleName}UseCase,
    Get{ModuleName}UseCase,
    List{ModuleNames}UseCase,
    Update{ModuleName}UseCase,
    Delete{ModuleName}UseCase
{
  constructor(private readonly repository: {ModuleName}RepositoryPort) {}

  async create(command: Create{ModuleName}Command): Promise<{ModuleName}> {
    const {moduleName} = {ModuleName}.create(command);
    {{each unique prop}}if (await this.repository.findBy{Prop}({moduleName}.{prop})) {
      throw new {ModuleName}{Prop}AlreadyInUseException({moduleName}.{prop});
    }
    return this.repository.save({moduleName});
  }

  async list(_query: List{ModuleNames}Query): Promise<{ModuleName}ReadModel[]> {
    return (await this.repository.findAll()).map((e) => {ModuleName}ReadModel.fromDomain(e));
  }

  async getById(query: Get{ModuleName}Query): Promise<{ModuleName}ReadModel> {
    return {ModuleName}ReadModel.fromDomain(await this.findOrFail(query.id));
  }

  async update(command: Update{ModuleName}Command): Promise<{ModuleName}> {
    const {moduleName} = await this.findOrFail(command.id);

    {{each prop}}if (command.{prop} !== undefined) {
      {moduleName}.change{Prop}(command.{prop});
      // {{each unique prop}} also:
      // const existing = await this.repository.findBy{Prop}({moduleName}.{prop});
      // if (existing && existing.id !== {moduleName}.id) {
      //   throw new {ModuleName}{Prop}AlreadyInUseException({moduleName}.{prop});
      // }
    }

    return this.repository.save({moduleName});
  }

  async delete(command: Delete{ModuleName}Command): Promise<void> {
    await this.findOrFail(command.id);
    await this.repository.delete(command.id);
  }

  private async findOrFail(id: <Id>): Promise<{ModuleName}> {
    const {moduleName} = await this.repository.findById(id);
    if (!{moduleName}) throw new {ModuleName}NotFoundException(id);
    return {moduleName};
  }
}
```

(In `findOrFail`, name the variable so it does not shadow anything; the point is `findById` → throw NotFound if null.)

## infrastructure/adapter/in/rest/  (depth `../../../../` to reach `application/` and `domain/`)

```ts
// dto/create-{module_name}.request.dto.ts
export class Create{ModuleName}RequestDto {
  {{each prop}}{prop}!: <T>;   // optional: {prop}?: <T>;
}

// dto/update-{module_name}.request.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { Create{ModuleName}RequestDto } from './create-{module_name}.request.dto.js';

export class Update{ModuleName}RequestDto extends PartialType(Create{ModuleName}RequestDto) {}

// dto/{module_name}.response.dto.ts
export interface {ModuleName}ResponseDto {
  id: <Id> | null;
  {{each prop}}{prop}: <T>;
}

// mappers/{module_name}.mapper.ts   (depth `../../../../../`)
import { {ModuleName}ReadModel } from '../../../../../application/query/{module_name}.read-model.js';
import { {ModuleName} } from '../../../../../domain/model/{module_name}.js';
import { {ModuleName}ResponseDto } from '../dto/{module_name}.response.dto.js';

export const {ModuleName}Mapper = {
  toResponse({moduleName}: {ModuleName}): {ModuleName}ResponseDto {
    return {moduleName}.toPrimitives();
  },
  fromReadModel(model: {ModuleName}ReadModel): {ModuleName}ResponseDto {
    return {
      id: model.id,
      {{each prop}}{prop}: model.{prop},
    };
  },
};
```

```ts
// global-exception.handler.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
// import every exception of the module from '../../../../domain/exception/...js'

type DomainException =
  | {ModuleName}NotFoundException
  | Invalid{ModuleName}Exception
  {{each unique prop}}| {ModuleName}{Prop}AlreadyInUseException;

@Catch({ModuleName}NotFoundException, Invalid{ModuleName}Exception, /* {{each unique prop}} {ModuleName}{Prop}AlreadyInUseException */)
export class GlobalExceptionHandler implements ExceptionFilter<DomainException> {
  catch(error: DomainException, host: ArgumentsHost) {
    const status =
      error instanceof {ModuleName}NotFoundException
        ? HttpStatus.NOT_FOUND
        : error instanceof Invalid{ModuleName}Exception
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.CONFLICT;

    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      error: error.name,
      message: error.message,
    });
  }
}
```

If the module has no unique props, drop the CONFLICT branch (use `: HttpStatus.BAD_REQUEST`).
Any new domain exception must be added to both the `@Catch` list and the status mapping.

```ts
// {module_names}.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseFilters,
} from '@nestjs/common';
// Pipe depends on <Id>: number -> ParseIntPipe; string -> ParseUUIDPipe (import only the one used)
// ...imports: 3 commands, 5 use cases, 2 queries, 2 request DTOs, mapper (from `./mappers/{module_name}.mapper.js`), response DTO, GlobalExceptionHandler

@Controller('{module_names}')
@UseFilters(GlobalExceptionHandler)
export class {ModuleNames}Controller {
  constructor(
    private readonly create{ModuleName}: Create{ModuleName}UseCase,
    private readonly list{ModuleNames}: List{ModuleNames}UseCase,
    private readonly get{ModuleName}: Get{ModuleName}UseCase,
    private readonly update{ModuleName}: Update{ModuleName}UseCase,
    private readonly delete{ModuleName}: Delete{ModuleName}UseCase,
  ) {}

  @Post()
  async create(@Body() body: Create{ModuleName}RequestDto): Promise<{ModuleName}ResponseDto> {
    const command = new Create{ModuleName}Command({ {{each prop}}{prop}: body.{prop}, });
    return {ModuleName}Mapper.toResponse(await this.create{ModuleName}.create(command));
  }

  @Get()
  async findAll(): Promise<{ModuleName}ResponseDto[]> {
    const items = await this.list{ModuleNames}.list(new List{ModuleNames}Query());
    return items.map((i) => {ModuleName}Mapper.fromReadModel(i));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: <Id>): Promise<{ModuleName}ResponseDto> {
    const item = await this.get{ModuleName}.getById(new Get{ModuleName}Query({ id }));
    return {ModuleName}Mapper.fromReadModel(item);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: <Id>,
    @Body() body: Update{ModuleName}RequestDto,
  ): Promise<{ModuleName}ResponseDto> {
    const command = new Update{ModuleName}Command({ id, {{each prop}}{prop}: body.{prop}, });
    return {ModuleName}Mapper.toResponse(await this.update{ModuleName}.update(command));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: <Id>): Promise<void> {
    await this.delete{ModuleName}.delete(new Delete{ModuleName}Command({ id }));
  }
}
```

## infrastructure/adapter/out/persistence/in-memory/in-memory-{module_name}.repository.adapter.ts  (depth `../../../../../`)

```ts
import { Injectable } from '@nestjs/common';
// string id only: import { randomUUID } from 'node:crypto';
import { {ModuleName}RepositoryPort } from '../../../../../application/port/out/{module_name}-repository.port.js';
import { {ModuleName} } from '../../../../../domain/model/{module_name}.js';

@Injectable()
export class InMemory{ModuleName}RepositoryAdapter implements {ModuleName}RepositoryPort {
  private rows = new Map<<Id>, {ModuleName}>();
  private nextId = 1; // number id only; omit for string id

  async save({moduleName}: {ModuleName}): Promise<{ModuleName}> {
    const p = {moduleName}.toPrimitives();
    // number: p.id ?? this.nextId++   |   string: p.id ?? randomUUID()
    const saved = {ModuleName}.fromPrimitives({ ...p, id: p.id ?? this.nextId++ });
    this.rows.set(saved.id as <Id>, saved);
    return saved;
  }

  async findById(id: <Id>): Promise<{ModuleName} | null> {
    return this.rows.get(id) ?? null;
  }

  async findAll(): Promise<{ModuleName}[]> {
    return [...this.rows.values()];
  }

  async delete(id: <Id>): Promise<void> {
    this.rows.delete(id);
  }

  {{each unique prop}}async findBy{Prop}({prop}: <T>): Promise<{ModuleName} | null> {
    return [...this.rows.values()].find((e) => e.{prop} === {prop}) ?? null;
  }
}
```

## {module_names}.module.ts

```ts
import { Module } from '@nestjs/common';
// ...imports: 5 use cases, repository port, service, controller, in-memory adapter

@Module({
  controllers: [{ModuleNames}Controller],
  providers: [
    {ModuleName}Service,
    { provide: Create{ModuleName}UseCase, useExisting: {ModuleName}Service },
    { provide: Get{ModuleName}UseCase, useExisting: {ModuleName}Service },
    { provide: List{ModuleNames}UseCase, useExisting: {ModuleName}Service },
    { provide: Update{ModuleName}UseCase, useExisting: {ModuleName}Service },
    { provide: Delete{ModuleName}UseCase, useExisting: {ModuleName}Service },
    { provide: {ModuleName}RepositoryPort, useClass: InMemory{ModuleName}RepositoryAdapter },
  ],
})
export class {ModuleNames}Module {}
```

## src/app.module.ts

Add `import { {ModuleNames}Module } from './{module_names}/{module_names}.module.js';` and append `{ModuleNames}Module` to `imports`.

## test/src/{module_names}/application/service/{module_name}.service.spec.ts

Import depth `../../../../../src/{module_names}/...`. Vitest globals; no Nest DI, no DB.

```ts
describe('{ModuleName}Service', () => {
  let service: {ModuleName}Service;

  // helper building a Create{ModuleName}Command with valid sample values for every prop
  const create = (overrides = {}) =>
    service.create(new Create{ModuleName}Command({ /* valid sample props */ ...overrides }));

  beforeEach(() => {
    service = new {ModuleName}Service(new InMemory{ModuleName}RepositoryAdapter());
  });

  // Non-existent id: number -> 99; string -> randomUUID() (from 'node:crypto')
  // create: valid -> id 1 (number) or a defined UUID string (string), and normalized values; invalid required prop -> Invalid{ModuleName}Exception;
  //         {{each unique prop}} duplicate -> {ModuleName}{Prop}AlreadyInUseException
  // list:   returns all items as read models, in insertion order
  // getById: existing -> read model; id 99 -> {ModuleName}NotFoundException
  // update: changes props; keeping the same unique value is allowed; id 99 -> NotFound;
  //         {{each unique prop}} value owned by another item -> AlreadyInUse
  // delete: removes the item (list becomes empty); id 99 -> NotFound
});
```
