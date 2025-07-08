import dotenv from "dotenv";
import { AbstractConfiguration } from "./abstract";
import {
  ConfigurationKey,
  Configuration,
  ConfigurationSchema,
  ResolveConfigurationSchema,
} from "./types";
import {
  ConfigurationAlreadyIngestedError,
  ConfigurationFilePermissionError,
  ConfigurationNotIngestedError,
  InvalidNumberConfigurationError,
  MissingConfigurationError,
  MissingConfigurationFileError,
  UnknownConfigurationFileError,
  UnsupportedPrimitiveError,
} from "./errors";
import { hasCode } from "./helper";

export class ConfigurationService extends AbstractConfiguration {
  protected static instance?: ConfigurationService;
  protected static isIngested?: boolean;

  private constructor() {
    super();
  }

  protected get<
    S extends ConfigurationSchema,
    K extends ConfigurationKey<Configuration<S>>
  >(key: K, primitive: S[K]): ResolveConfigurationSchema<S>[K] {
    const rawValue = process.env[key];
    if (rawValue === undefined) {
      throw new MissingConfigurationError(key);
    }

    let parsedValue;
    switch (primitive) {
      case "boolean":
        parsedValue = rawValue === "true";
        break;
      case "number":
        parsedValue = Number(rawValue);
        if (isNaN(parsedValue)) {
          throw new InvalidNumberConfigurationError(key, rawValue);
        }
        break;
      case "string":
        parsedValue = rawValue;
        break;
      default:
        throw new UnsupportedPrimitiveError(key, primitive);
    }

    return parsedValue as ResolveConfigurationSchema<S>[K];
  }

  public getAll<S extends ConfigurationSchema>(
    s: S
  ): ResolveConfigurationSchema<S> {
    const keys = Object.entries(s);

    const result = keys.reduce((previous, current) => {
      const [key, primitive] = current;

      return {
        ...previous,
        [key]: this.get(key, primitive),
      };
    }, {} as ResolveConfigurationSchema<S>);

    return result;
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.isIngested) {
      throw new ConfigurationNotIngestedError();
    }
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  public static ingest(path: string): void {
    if (ConfigurationService.isIngested) {
      throw new ConfigurationAlreadyIngestedError(path);
    }

    const { error } = dotenv.config({ path });
    if (error) {
      const { message } = error;

      if (!hasCode(error)) {
        throw new UnknownConfigurationFileError(path, message);
      }

      const { code } = error;
      switch (code) {
        case "ENOENT":
          throw new MissingConfigurationFileError(path);
        case "EACCES":
          throw new ConfigurationFilePermissionError(path, message);
        default:
          throw new UnknownConfigurationFileError(path, message);
      }
    }

    ConfigurationService.isIngested = true;
  }
}
