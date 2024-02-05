# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.3](https://github.com/es-shims/DisposableStack/compare/v1.1.2...v1.1.3) - 2024-02-04

### Commits

- [Refactor] use `es-errors` where possible, so things that only need those do not need `get-intrinsic` [`992e541`](https://github.com/es-shims/DisposableStack/commit/992e5411254f81ed19d7bd947dfa3b1eeb5b82f4)
- [Dev Deps] use `hasown` instead of `has` [`07d41dc`](https://github.com/es-shims/DisposableStack/commit/07d41dc21c9668336db0dfc74ed134404fd1040a)
- [Dev Deps] update `aud`, `has-tostringtag`, `npmignore`, `tape` [`c7601cf`](https://github.com/es-shims/DisposableStack/commit/c7601cf6b7ab3c1a621b67bfe5eb388485438cea)
- [Deps] update `es-abstract`, `es-set-tostringtag`, `get-intrinsic`, `internal-slot` [`ae1f344`](https://github.com/es-shims/DisposableStack/commit/ae1f34464de882ca22bc46c8b3714fd5adf0baca)
- [Tests] node v18.18 ships a broken Symbol.dispose as well [`000c7aa`](https://github.com/es-shims/DisposableStack/commit/000c7aac6f81f34c076bbfdc86dfca417b84ac9a)
- [Deps] update `get-intrinsic`, `suppressed-error` [`e088c32`](https://github.com/es-shims/DisposableStack/commit/e088c329386e9b6191f125ff9df77e28fc823fd5)
- [Dev Deps] update `object-inspect`, `tape` [`745057e`](https://github.com/es-shims/DisposableStack/commit/745057e6a3288eee1916bc799212c84e5586f0ca)
- [meta] add prepublish/prepublishOnly [`f8bd449`](https://github.com/es-shims/DisposableStack/commit/f8bd449c5a0ff622861cae22828a854341909aed)

## [v1.1.2](https://github.com/es-shims/DisposableStack/compare/v1.1.1...v1.1.2) - 2023-09-13

### Fixed

- [Deps] add missing `globalthis` dep [`#3`](https://github.com/es-shims/DisposableStack/issues/3)

### Commits

- [Deps] update `define-properties`, `suppressed-error` [`6322b16`](https://github.com/es-shims/DisposableStack/commit/6322b1603f18a9f706c370bad6ac99e692138d6d)

## [v1.1.1](https://github.com/es-shims/DisposableStack/compare/v1.1.0...v1.1.1) - 2023-07-24

### Commits

- [Deps] update `es-abstract` [`4251c56`](https://github.com/es-shims/DisposableStack/commit/4251c56f0d73a6b09a79eee099e0d0f270e969f5)
- [Refactor] empty out DisposableStack slot on dispose [`4d67178`](https://github.com/es-shims/DisposableStack/commit/4d67178fc7878eb0cf0a88ee84131e0acf72c725)
- [Tests] add some coverage [`001e23c`](https://github.com/es-shims/DisposableStack/commit/001e23cff7b94b29ef5098d2b0b256c23fb85b27)
- [readme] fix package name [`52002d1`](https://github.com/es-shims/DisposableStack/commit/52002d1440b7fa4702e48efa44e9c64d1023c3a8)
- [Tests] node v20.4 ships Symbol dispose polyfills that are registered symbols [`37709d2`](https://github.com/es-shims/DisposableStack/commit/37709d2aa6066952148237beaf086597f4b2aa78)
- [Dev Deps] update `@es-shims/api`, `@ljharb/eslint-config`, `aud`, `tape` [`4716a40`](https://github.com/es-shims/DisposableStack/commit/4716a4033ad2eaff18c02a41d1b9fc7df322e7e2)
- [Dev Deps] update `tape` [`85c5033`](https://github.com/es-shims/DisposableStack/commit/85c503392126770c984b826f281003305cf7b664)
- [Deps] update `get-intrinsic` [`a3b63e2`](https://github.com/es-shims/DisposableStack/commit/a3b63e2de49b93b300cd900c05f35d6cb455e945)

## [v1.1.0](https://github.com/es-shims/DisposableStack/compare/v1.0.0...v1.1.0) - 2023-04-12

### Commits

- [New] add `AsyncDisposableStack` [`7f20fa1`](https://github.com/es-shims/DisposableStack/commit/7f20fa1d289520ee90fd347241c9ab7862e96095)
- [New] add `Symbol.asyncDispose` [`cf0d13c`](https://github.com/es-shims/DisposableStack/commit/cf0d13ca7e52a54179e74071abc03a9e2225f993)
- [Tests] simple cleanup [`1be651d`](https://github.com/es-shims/DisposableStack/commit/1be651d8a447b16623fa8833432d805cc55d3b13)
- [Refactor] clean up per https://github.com/tc39/proposal-explicit-resource-management/pull/150 [`e7dbbd8`](https://github.com/es-shims/DisposableStack/commit/e7dbbd87b4c6c2531c20a62a2eb16a0bb5163179)
- [Refactor] move AOs higher up [`9ff6444`](https://github.com/es-shims/DisposableStack/commit/9ff644488a1f939f9250163ae31ad2565bae7141)
- [patch] improve error messages [`f7c572c`](https://github.com/es-shims/DisposableStack/commit/f7c572c7604efe5d64a248ef8142a7ca6ea5570e)
- [Deps] update `es-abstract` [`ecbc99e`](https://github.com/es-shims/DisposableStack/commit/ecbc99e063adaa58b77b36395fd29aeb996cbf8a)

## v1.0.0 - 2023-02-17

### Commits

- Initial implementation, tests, readme [`5a37b9c`](https://github.com/es-shims/DisposableStack/commit/5a37b9cf83f61a12ae0d018d6f0645dca487bb29)
- Initial commit [`8ebaad1`](https://github.com/es-shims/DisposableStack/commit/8ebaad1568705325c4808231cd84073ab5e39ff3)
- npm init [`1c96843`](https://github.com/es-shims/DisposableStack/commit/1c96843e2f2b620c7e3cf7789eee8bbcdc5490ae)
- Only apps should have lockfiles [`8e37572`](https://github.com/es-shims/DisposableStack/commit/8e37572162f2ffedc1fd8459aee178e7e284f23c)
