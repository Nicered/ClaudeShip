# Changelog

## [0.2.38](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.37...claudeship-v0.2.38) (2026-02-05)


### Bug Fixes

* Remove undefined killPromises variable ([68cd7b1](https://github.com/Nicered/ClaudeShip/commit/68cd7b1f32fea1dd006f08901e1f896d5a50d782))
* Remove undefined killPromises variable in preview cleanup ([ace0e19](https://github.com/Nicered/ClaudeShip/commit/ace0e19182e3abcd972bd6b65ede6e74ba7a8306))

## [0.2.37](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.36...claudeship-v0.2.37) (2026-02-05)


### Bug Fixes

* Resolve connection leak and proxy configuration issues ([44f5993](https://github.com/Nicered/ClaudeShip/commit/44f5993726c4a5c36742ed8241c050cc85c176fa))
* Resolve connection leak and Vite proxy issues ([3a40883](https://github.com/Nicered/ClaudeShip/commit/3a4088336a2d0d6fcdcb3845f17c6a6b28602fc2))

## [0.2.36](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.35...claudeship-v0.2.36) (2026-02-02)


### Bug Fixes

* await process kill and port release before preview restart ([4e8ab3f](https://github.com/Nicered/ClaudeShip/commit/4e8ab3f92bc24e9c39ddaa6b560c053958f3fec0)), closes [#86](https://github.com/Nicered/ClaudeShip/issues/86)

## [0.2.35](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.34...claudeship-v0.2.35) (2026-02-02)


### Features

* integrate disconnected features & refactor DatabaseService ([e1c18e2](https://github.com/Nicered/ClaudeShip/commit/e1c18e2f646e0e35594db3c95c50b14e1caf60df))
* integrate disconnected features across architect, checkpoint, and workspace ([40808b0](https://github.com/Nicered/ClaudeShip/commit/40808b07cd3b5e3d161989db360b010d2ba95dbc))
* refactor DatabaseService to adapter pattern with SQLite/PostgreSQL support ([8df12b1](https://github.com/Nicered/ClaudeShip/commit/8df12b1e2cbb861993dcf9f37de7103c89f37d48))


### Bug Fixes

* add .nojekyll to docs for GitHub Pages _next directory serving ([0c1d271](https://github.com/Nicered/ClaudeShip/commit/0c1d271310f67109cd1956aecc51607b8bc9e030))

## [0.2.34](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.33...claudeship-v0.2.34) (2026-02-02)


### Features

* Add clipboard image paste support to chat input ([93c1cfe](https://github.com/Nicered/ClaudeShip/commit/93c1cfe9d8368f980d4f426fc9b8413829a9bc18))
* Add clipboard image paste support to chat input ([f834410](https://github.com/Nicered/ClaudeShip/commit/f834410c52b779c207076028ae57db8074bb6f7b))

## [0.2.33](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.32...claudeship-v0.2.33) (2026-02-02)


### Bug Fixes

* Auto-build server on pnpm dev if dist is missing ([696961e](https://github.com/Nicered/ClaudeShip/commit/696961ef06bdc33fdc07b093771ba7330d97c78d))
* Auto-build server on pnpm dev if dist is missing ([9669ee1](https://github.com/Nicered/ClaudeShip/commit/9669ee1637a5e37a00bd4aaac09657555352a92d))

## [0.2.32](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.31...claudeship-v0.2.32) (2026-02-02)


### Bug Fixes

* Use acceptEdits with allowedTools for root permission bypass ([0fa663f](https://github.com/Nicered/ClaudeShip/commit/0fa663f67c38f2355020295eda9c0098ac573c46))
* Use acceptEdits with allowedTools for root permission bypass ([9162a8f](https://github.com/Nicered/ClaudeShip/commit/9162a8fa0430b41c127464c312105e90ba3388d2))

## [0.2.31](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.30...claudeship-v0.2.31) (2026-02-02)


### Bug Fixes

* Add entryFile to nest-cli.json for correct dist path ([8b97ed6](https://github.com/Nicered/ClaudeShip/commit/8b97ed6842a4ff392f3fe05e299f387249a88123))
* Add entryFile to nest-cli.json for correct dist path resolution ([87aa8b7](https://github.com/Nicered/ClaudeShip/commit/87aa8b7358810368ef9b2c109481d38296a777ef))

## [0.2.30](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.29...claudeship-v0.2.30) (2026-02-02)


### Bug Fixes

* Use --permission-mode dontAsk for root to bypass all tool permissions ([b276554](https://github.com/Nicered/ClaudeShip/commit/b276554170b367b7e26b91fd293fe8035ed2f55a))
* Use --permission-mode dontAsk for root to bypass all tool permissions ([98ecc8e](https://github.com/Nicered/ClaudeShip/commit/98ecc8edae90023e413068ef07e2c400aaa82092))

## [0.2.29](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.28...claudeship-v0.2.29) (2026-02-02)


### Bug Fixes

* Use --permission-mode acceptEdits for root environment ([2222944](https://github.com/Nicered/ClaudeShip/commit/222294408edc3b77071957a52f1eed6d436c90b5))
* Use --permission-mode acceptEdits for root instead of skipping permissions ([3995fbd](https://github.com/Nicered/ClaudeShip/commit/3995fbd2ef8d1318eb93900f573adfe71ab45553)), closes [#71](https://github.com/Nicered/ClaudeShip/issues/71)

## [0.2.28](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.27...claudeship-v0.2.28) (2026-02-02)


### Features

* Add architect agent for automated code review ([286dc7b](https://github.com/Nicered/ClaudeShip/commit/286dc7b4c75d055bbc16f28191ef4ee6a5964fa1))
* Add architect agent for automated code review after build ([3d9fd4f](https://github.com/Nicered/ClaudeShip/commit/3d9fd4f22c91c9572b1448ffec0483c400c87289)), closes [#68](https://github.com/Nicered/ClaudeShip/issues/68)

## [0.2.27](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.26...claudeship-v0.2.27) (2026-02-02)


### Bug Fixes

* Isolate chat store state per project ([#65](https://github.com/Nicered/ClaudeShip/issues/65)) ([d07b4f4](https://github.com/Nicered/ClaudeShip/commit/d07b4f4a59dcb4a9b28e970cb6316d2697688e05))
* Isolate chat store state per project to prevent cross-project context leaking ([a0208f7](https://github.com/Nicered/ClaudeShip/commit/a0208f7a11614b6cc62d5107ed422bbaea31e8ab))

## [0.2.26](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.25...claudeship-v0.2.26) (2026-01-29)


### Features

* Add conversational framework selection system ([f9e04f6](https://github.com/Nicered/ClaudeShip/commit/f9e04f65fed08e37d998de8da5e98fc84702b9b3))


### Bug Fixes

* Update server DTO and service to match new appType schema ([c463920](https://github.com/Nicered/ClaudeShip/commit/c4639201756c1eb2341fc6f55f73b815e848f5a2))

## [0.2.25](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.24...claudeship-v0.2.25) (2026-01-27)


### Features

* Add conversational framework selection system ([f701006](https://github.com/Nicered/ClaudeShip/commit/f701006c897f2f2675cc481a49f09484bb91540f))
* Add conversational framework selection system ([c417f2f](https://github.com/Nicered/ClaudeShip/commit/c417f2fa2955a23633dac31d499fd0fed00a9217))

## [0.2.24](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.23...claudeship-v0.2.24) (2026-01-27)


### Bug Fixes

* Prevent Tailwind CSS version conflict between packages ([b523842](https://github.com/Nicered/ClaudeShip/commit/b523842d9491e2ac93f1901ca28d07e31ae53882))
* Prevent Tailwind CSS version conflict between packages ([1dc2614](https://github.com/Nicered/ClaudeShip/commit/1dc26140f83e972ced3eb0ab5c9136959992907a))

## [0.2.23](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.22...claudeship-v0.2.23) (2026-01-23)


### Features

* **docs:** Add Nextra 4 docs viewer with Tailwind CSS v4 ([63ea28e](https://github.com/Nicered/ClaudeShip/commit/63ea28e763c77a18cc8ee0541cfe30cb7d8c9cbe))
* **docs:** Add Nextra 4 docs viewer with Tailwind CSS v4 ([a7663b5](https://github.com/Nicered/ClaudeShip/commit/a7663b5380a117850056628d59efdfe2ee0b2540))

## [0.2.22](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.21...claudeship-v0.2.22) (2026-01-13)


### Features

* **docs:** Improve SEO and update icons to rocket logo ([4af92c8](https://github.com/Nicered/ClaudeShip/commit/4af92c8c1b58aa5fc0ff320cc387062bf0e3d161))


### Bug Fixes

* **docs:** Improve SEO for search engine indexing ([c128f52](https://github.com/Nicered/ClaudeShip/commit/c128f528828022426e94c44698392e0103111830))

## [0.2.21](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.20...claudeship-v0.2.21) (2026-01-09)


### Features

* Add database infrastructure auto-management ([93cc1d2](https://github.com/Nicered/ClaudeShip/commit/93cc1d28921d5b559c3cdbd5e49e389997ea7e89))
* Add database infrastructure UI ([29eea5b](https://github.com/Nicered/ClaudeShip/commit/29eea5b6f639d8d80f305808b2dbaafd5fa979ab))
* 데이터베이스 인프라 자동 관리 기능 ([f6f64bc](https://github.com/Nicered/ClaudeShip/commit/f6f64bc41d40e46b21dfe92ee4bdbafdaae5ead6))

## [0.2.20](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.19...claudeship-v0.2.20) (2026-01-09)


### Features

* Improve chat UI with duration display and collapsible tools ([cfca34f](https://github.com/Nicered/ClaudeShip/commit/cfca34f54172ccea9d935c8a930d9f29df48f1d4))
* Improve chat UI with duration display and collapsible tools ([43457a5](https://github.com/Nicered/ClaudeShip/commit/43457a55109bbc10a9d1528e20eaa9c192db4293)), closes [#48](https://github.com/Nicered/ClaudeShip/issues/48)

## [0.2.19](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.18...claudeship-v0.2.19) (2026-01-07)


### Bug Fixes

* Add force-static export for robots and sitemap ([88482fc](https://github.com/Nicered/ClaudeShip/commit/88482fc9094890954360cca75e5d271e45dd370e))


### Miscellaneous

* Add Google Search Console verification meta tag ([bb7f084](https://github.com/Nicered/ClaudeShip/commit/bb7f0845f7d16f513e5fb60e8a17b6379079e148))
* Add robots.txt and sitemap.xml for SEO ([c7ad1c3](https://github.com/Nicered/ClaudeShip/commit/c7ad1c32cc9842b46a07876c0dd4b4859c34b3a9))

## [0.2.18](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.17...claudeship-v0.2.18) (2026-01-06)


### Bug Fixes

* Skip --dangerously-skip-permissions when running as root ([c989bf0](https://github.com/Nicered/ClaudeShip/commit/c989bf04693acc5591b96aff3bb0d9f9a846f36b))
* Skip --dangerously-skip-permissions when running as root ([0ad7b30](https://github.com/Nicered/ClaudeShip/commit/0ad7b30fb83f6a312a5336cb76f1465404a763c7)), closes [#44](https://github.com/Nicered/ClaudeShip/issues/44)

## [0.2.17](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.16...claudeship-v0.2.17) (2026-01-06)


### Features

* Add Prisma database setup to setup.sh ([d571c57](https://github.com/Nicered/ClaudeShip/commit/d571c57a2b766f0f051ae7c8c3e969ceae1d78d1))
* Add Prisma database setup to setup.sh ([1171dd0](https://github.com/Nicered/ClaudeShip/commit/1171dd08d0a629359aa0d1819b33220baac1ddb5)), closes [#41](https://github.com/Nicered/ClaudeShip/issues/41)

## [0.2.16](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.15...claudeship-v0.2.16) (2026-01-06)


### Features

* Auto-generate .env files during project setup ([142c690](https://github.com/Nicered/ClaudeShip/commit/142c690f00d7bae773ead4615d9a0962a63c014f))
* Auto-generate .env files during project setup ([282690f](https://github.com/Nicered/ClaudeShip/commit/282690fbf0f8df52bf31090d9650fe156cff6821)), closes [#38](https://github.com/Nicered/ClaudeShip/issues/38)

## [0.2.15](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.14...claudeship-v0.2.15) (2026-01-05)


### Features

* Integrate Phase 2/3 components into workspace ([901349b](https://github.com/Nicered/ClaudeShip/commit/901349b727f67d0f6b99862a3aac56ed5b242516))
* Integrate Phase 2/3 components into workspace ([7d5629d](https://github.com/Nicered/ClaudeShip/commit/7d5629dc9729982baf8a78a8651bdb44efadcd00))


### Documentation

* Add PR test checklist rules to CLAUDE.md ([6062e72](https://github.com/Nicered/ClaudeShip/commit/6062e729e1f273ff619e524ea087fcc29fb0738c))

## [0.2.14](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.13...claudeship-v0.2.14) (2026-01-05)


### Bug Fixes

* Escape quotes in TestRunner.tsx to fix build error ([277a76a](https://github.com/Nicered/ClaudeShip/commit/277a76af57171648e448c8764146a07cc2568672))
* Escape quotes in TestRunner.tsx to fix build error ([4bd5db0](https://github.com/Nicered/ClaudeShip/commit/4bd5db0a5a93a7cf26d6f54e6afc94285d004041))

## [0.2.13](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.12...claudeship-v0.2.13) (2026-01-03)


### Features

* Add agent prompt strategies and project context API ([3e9dc9f](https://github.com/Nicered/ClaudeShip/commit/3e9dc9fe9104aaf80d3e37cd20ee74f7b0aac014))
* Add preview enhancement Phase 1 features ([07483f4](https://github.com/Nicered/ClaudeShip/commit/07483f4c98542471d32e8de6f76e607473e57f9a))
* Add preview enhancement Phase 2 features ([5aae80e](https://github.com/Nicered/ClaudeShip/commit/5aae80ec6f3b2c9dc08eb83316e1f04e0d8e985f))
* Add preview enhancement Phase 3 features ([c77a49c](https://github.com/Nicered/ClaudeShip/commit/c77a49c7738e47450d05a571d30bc736b40050f9))
* Preview Enhancement ([#31](https://github.com/Nicered/ClaudeShip/issues/31)) ([95c8e7f](https://github.com/Nicered/ClaudeShip/commit/95c8e7f5ef3e831f9420647fbdcc706e03623d2a))

## [0.2.12](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.11...claudeship-v0.2.12) (2026-01-02)


### Bug Fixes

* Prevent agent from using process control commands ([2490c34](https://github.com/Nicered/ClaudeShip/commit/2490c34c3c1d35608384ac1fab63aa2a5bec27bb))
* Prevent agent from using process control commands ([73cc74f](https://github.com/Nicered/ClaudeShip/commit/73cc74f8f24e7ee7a139764f06b7760605250b71)), closes [#28](https://github.com/Nicered/ClaudeShip/issues/28)

## [0.2.11](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.10...claudeship-v0.2.11) (2026-01-02)


### Features

* Add agent-triggered preview restart via special marker ([aa04d1a](https://github.com/Nicered/ClaudeShip/commit/aa04d1ac5f014dac3a7994449a212922e104734f))
* Add agent-triggered preview restart via special marker ([9668bf5](https://github.com/Nicered/ClaudeShip/commit/9668bf5c39b4acd85480f4ac6e36ded7b68aef61)), closes [#25](https://github.com/Nicered/ClaudeShip/issues/25)

## [0.2.10](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.9...claudeship-v0.2.10) (2026-01-01)


### Features

* Add preview restart API and improve layout ([b601646](https://github.com/Nicered/ClaudeShip/commit/b601646713291f62df3b7c298c2fe5bf2048a417))
* Add preview restart API and improve layout ([8e42230](https://github.com/Nicered/ClaudeShip/commit/8e42230ccf3ec4616f942b63b1d686d899e65b71))

## [0.2.9](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.8...claudeship-v0.2.9) (2026-01-01)


### Bug Fixes

* Fix Python/FastAPI preview server startup ([91782d0](https://github.com/Nicered/ClaudeShip/commit/91782d0901df385d7a69ea1eb97098bdffac9425))
* Fix Python/FastAPI preview server startup ([4ead674](https://github.com/Nicered/ClaudeShip/commit/4ead6743b7b541e4eef718a36cb9609170704b9d))

## [0.2.8](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.7...claudeship-v0.2.8) (2026-01-01)


### Bug Fixes

* Fix preview lifecycle and clear files after send ([85d413b](https://github.com/Nicered/ClaudeShip/commit/85d413bafec399eac8bb0f82e8ffafbabf90bf1e))
* Fix preview lifecycle and clear files after send ([bf4bc89](https://github.com/Nicered/ClaudeShip/commit/bf4bc89b5ee73031127edf7afe3a89bfa51043a2))
* Increase file upload size limit to 100MB ([fdd811d](https://github.com/Nicered/ClaudeShip/commit/fdd811d3fe1c5e4299a882f1fdc2d1ef3d7de3ec))

## [0.2.7](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.6...claudeship-v0.2.7) (2026-01-01)


### Features

* Add CSV and Excel file support for attachments ([b3ce9fb](https://github.com/Nicered/ClaudeShip/commit/b3ce9fb57d3f981859fa6073bad3a026377aafd5))
* Add CSV and Excel file support for attachments ([36b8a04](https://github.com/Nicered/ClaudeShip/commit/36b8a04ff70d8951b9b136acabdb8b477c3833fc))

## [0.2.6](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.5...claudeship-v0.2.6) (2026-01-01)


### Bug Fixes

* Add Python/FastAPI backend recognition in preview panel ([509b10f](https://github.com/Nicered/ClaudeShip/commit/509b10f302dbca2d762654e4ddd6c9a2d3fa92db))
* Add Python/FastAPI backend recognition in preview panel ([8927a37](https://github.com/Nicered/ClaudeShip/commit/8927a37e233045fb7640cbf15b0e6c804dee5656)), closes [#14](https://github.com/Nicered/ClaudeShip/issues/14)

## [0.2.5](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.4...claudeship-v0.2.5) (2026-01-01)


### Features

* Add file attachment support in chat ([3de5375](https://github.com/Nicered/ClaudeShip/commit/3de53751330382d29a6a0dd9f8564cab3d14d85b))
* Add file attachment support in chat ([e598265](https://github.com/Nicered/ClaudeShip/commit/e598265dfff1c680abd56fcc1c718d8c0cc7eb15)), closes [#11](https://github.com/Nicered/ClaudeShip/issues/11)

## [0.2.4](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.3...claudeship-v0.2.4) (2025-12-31)


### Features

* Add AskUserQuestion UI component ([ec7d472](https://github.com/Nicered/ClaudeShip/commit/ec7d472abe809b931cf1d0e83ed58f86da547fd6))


### Bug Fixes

* Parse version from claudeship-v prefix in npm-publish ([c70a980](https://github.com/Nicered/ClaudeShip/commit/c70a9802f1a1466c987116f0a19908737406333a))

## [0.2.3](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.2...claudeship-v0.2.3) (2025-12-31)


### Bug Fixes

* Update release-please action with PAT support ([354a545](https://github.com/Nicered/ClaudeShip/commit/354a545905211013160d5a5e55f50d464ba399a3))

## [0.2.2](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.1...claudeship-v0.2.2) (2025-12-31)


### Bug Fixes

* Separate release workflows for Trusted Publishing ([08d73c8](https://github.com/Nicered/ClaudeShip/commit/08d73c82e96e553607b3039a1fb3a40e0e6e6082))

## [0.2.1](https://github.com/Nicered/ClaudeShip/compare/claudeship-v0.2.0...claudeship-v0.2.1) (2025-12-31)


### Features

* Add preview server lifecycle management ([e1afc2f](https://github.com/Nicered/ClaudeShip/commit/e1afc2f2a9b812a773fe44c2ca3d3284d905b385))


### Bug Fixes

* Add id-token and pages permissions for workflow_call ([331bdeb](https://github.com/Nicered/ClaudeShip/commit/331bdeb4b83bd587f31286ddae4042119e820b92))


### CI/CD

* Release Please 자동 릴리스 설정 ([f20f707](https://github.com/Nicered/ClaudeShip/commit/f20f707cfa2048de7b760afe2e9e5e87556fe567))
