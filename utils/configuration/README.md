# ConfigurationService

`ConfigurationService` is a modern, extensible, and type-safe configuration utility built on top of [`dotenv`](https://github.com/motdotla/dotenv).
It provides centralized access to environment variables through a singleton interface, with strongly typed retrieval of multiple config keys at once.

## 📦 Installation

This package is part of a monorepo managed with Rush. To add it to your project within the monorepo, run:

```sh
rush add -p @utils/configuration
```

## 🚀 Usage

Pass the path to your `.env` file and ingest the configuration once when your application starts:

```ts
import { join } from "path";
import { ConfigurationService } from "@utils/configuration";

const filename = ".env";
const directory = process.cwd();
const path = join(directory, filename);

ConfigurationService.ingest(path);
```

Get the singleton instance anywhere in your app:

```ts
const configurationService = ConfigurationService.getInstance();
```

Define a configuration schema with expected keys and their primitive types,
then retrieve all configuration values at once with full type safety and automatic parsing:

```ts
import { ConfigurationSchema } from "@utils/configuration";

const configurationSchema: ConfigurationSchema = {
  DEBUG: "boolean",
  PORT: "number",
  SECRET: "string",
};

const { DEBUG, PORT, SECRET } = configurationService.getAll(configurationSchema);
```

## ❌ Errors

The `ConfigurationService` provides meaningful, purpose-specific error types to help you identify and handle configuration issues precisely.

- `ConfigurationAlreadyIngestedError`:  
  Thrown if you call `ingest()` more than once.

- `ConfigurationFilePermissionError`:  
  Thrown when the file exists but is not readable due to insufficient file system permissions.

- `ConfigurationNotIngestedError`:  
  Thrown if you try to access the singleton instance via `getInstance()` before calling `ingest()`.

- `InvalidNumberConfigurationError`:
- Thrown when a value expected to be a number fails to parse.

- `MissingConfigurationError`:  
  Thrown when you request an environment variable key that was not defined or has no value.

- `MissingConfigurationFileError`:  
  Thrown when the specified file does not exist at the given path.

- `UnknownConfigurationFileError`:  
  Thrown for unknown or unexpected errors while parsing the file.

- `UnsupportedPrimitiveError`:
  Thrown when a configuration key is requested with a primitive type that is not supported by the service.

## 📁 Project Structure

```bash
├── abstract.ts                 # Abstract class and base definition
├── errors.ts                   # Custom error classes
├── helper.ts                   # Utility and helper functions
├── index.ts                    # Entry point for the package
├── service.integration.test.ts # Integration tests for service
├── service.ts                  # Core service implementation
├── service.unit.test.ts        # Unit tests for service
└── types.ts                    # Type definitions
```

## 🧪 Testing

Uses Jest with ESM support.

Run all tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run start:unit-test
npm run start:unit-test:coverage
```

Run only integration tests:

```bash
npm run start:integration-test
npm run start:integration-test:coverage
```