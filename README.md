# workspace-api-node-ts

## Prerequisites

| **Package** | **Version** |
| ----------- | ----------- |
| Node        | v18.16.0    |
| Yarn        | 1.22.x      |
| Postgres    | 14.0        |
| Liquibase   | 4.17.0      |

## Development Environment Setup

### Set required Node Version

```sh
nvm use
```

### Install dependencies

```sh
yarn # to install dependencies
```

### ENV Update

- Create .env from .env.example file and place required values

### DB Setup

- Create new DB Application manually.
- Update `liquibase.properties` file for DB credentials
- Run migrations for your local DB using `yarn liquibase`
