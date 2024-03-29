# This project is unmaintained, take a look at the successor [SentiumJS](https://github.com/sentium-js/sentium)!

This project is currently experimental and may not work properly! If you find any bug, please write an issue.

<h1 align="center">
  <img src="https://raw.githubusercontent.com/lkwr/dar/main/assets/logo.png" alt="DAR" width="200">
  <br>
  DAR
</h1>

<h4 align="center">A <a href="https://www.typescriptlang.org/docs/handbook/decorators.html" target="_blank">TypeScript Decorator</a> based API router for <a href="https://deno.land">Deno</a>.</h4>

<p align="center">
    <img src="https://img.shields.io/badge/made%20for-Deno-6B82F6?style=flat-square" alt="Made for Deno">
    <img src="https://img.shields.io/github/license/lkwr/dar?color=blue&style=flat-square" alt="Licence MIT">
    <img src="https://img.shields.io/github/v/tag/lkwr/dar?color=informational&label=version&sort=semver&style=flat-square" alt="Latest version">
    <img src="https://img.shields.io/github/last-commit/lkwr/dar?style=flat-square" alt="Latest commit">
    <img src="https://img.shields.io/badge/status-WIP-red?style=flat-square" alt="Status WIP">
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#introduction">Introduction</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#run-the-example">Example</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## Key Features

-   Typescript with [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
-   Made for [Deno](https://deno.land)
    -   works with [Deno Deploy](https://deno.com/deploy)
-   Lightweight
-   Zero _third party_ dependencies (only [std](https://deno.land/std) & my own modules ([x/vade](https://deno.land/x/vade)))
-   Highly customizable
-   Controller nesting (using `@Include()`)
-   Native [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) routing

## Introduction

DAR (formerly Pterosaur) stands for "**D**ecorator based **A**PI **R**outer" and is aimed to be used as a REST API Server, which primarily uses JSON data. It is built to support [Deno Deploy](https://deno.com/deploy).

## How To Use

DAR is available via Deno's Thrid Party Modules.

```ts
import { ... } from 'https://deno.land/x/dar/mod.ts';
```

Create a simple controller class.

```ts
@Controller()
class SomeClass {
    // Methods here
}
```

Create a simple get method.

```ts
@Get()
someMethod() {
    return { success: true }
}
```

Create the application

```ts
const app: Application = new Application({
    controller: [SomeClass],
});
```

And register the handler. We use Deno's Standard Library

```ts
await serve((request: Request) => app.handle(request), { port: 8080 });
```

And all together

```ts
import { ... } from 'https://deno.land/x/dar/mod.ts';

@Controller()
class SomeClass {
    @Get()
    someMethod() {
        return { success: true }
    }
}

const app: Application = new Application({
    controller: [SomeClass],
});

await serve((request: Request) => app.handle(request), { port: 8080 });
```

## Run the example

```bash
$ deno run --allow-net https://deno.land/x/dar/examples/basic.ts
```

## Known issues

-   Include decorator not working in Deno Deploy. Need to use controller options to nest controllers!

## You may also like...

-   [Alosaur](https://github.com/alosaur/alosaur) - Another decorator based router

## Credits

This software uses the following open source projects:

-   [Deno Standard Modules](https://deno.land/std)
-   [Dinosaur icons created by Darius Dan - Flaticon](https://www.flaticon.com/free-icons/dinosaur)

## License

MIT

---

> Homepage [luke.id](https://luke.id) &nbsp;&middot;&nbsp;
> GitHub [@lkwr](https://github.com/lkwr) &nbsp;&middot;&nbsp;
> Twitter [@wlkrlk](https://twitter.com/wlkrlk)
