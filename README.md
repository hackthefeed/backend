# HackTheFeed

![build status](https://github.com/hackthefeed/backend/actions/workflows/ci.yml/badge.svg)
![tests status](https://github.com/hackthefeed/backend/actions/workflows/tests.yml/badge.svg)
![visitors](https://visitor-badge.laobi.icu/badge?page_id=github/hackthefeed/backend)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hackthefeed/backend/blob/main/LICENSE)

This repository contains the source code for the HackTheFeed backend.

## Installation

```powershell
pnpm install
pnpm run start
```

## About

- HackTheFeed's backend uses [Fastify](https://fastify.io) and [Prisma](https://prisma.io) to provide an API for the frontend
- Users are authenticated with [JWT](https://jwt.io)
- Users can access live feeds with [socket.io](https://socket.io)
- Documentation is generated with [Swagger](https://swagger.io)
