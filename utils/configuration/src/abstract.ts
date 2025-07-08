import { MethodNotImplementedYetError } from "@utils/core";
import {
  Configuration,
  ConfigurationKey,
  ConfigurationSchema,
  ResolveConfigurationSchema,
} from "./types";

export abstract class AbstractConfiguration {
  /**
   * Singleton instance of the configuration service.
   */
  protected static instance?: AbstractConfiguration;

  /**
   * Indicates whether the environment variables have been ingested.
   */
  protected static isIngested?: boolean;

  /**
   * Prevents direct instantiation of the abstract class.
   */
  protected constructor() {}

  /**
   * Retrieves and parses a configuration value based on its expected type.
   *
   * The value is returned as the native JavaScript type (`string`, `number`, or `boolean`)
   * corresponding to the provided primitive type in the configuration schema.
   *
   * @param key - The configuration key to retrieve.
   * @param primitive - The expected primitive type of the configuration key.
   *
   * @returns The parsed configuration value with the appropriate native type.
   */
  protected abstract get<
    S extends ConfigurationSchema,
    K extends ConfigurationKey<Configuration<S>>
  >(key: K, primitive: S[K]): ResolveConfigurationSchema<S>[K];

  /**
   * Retrieves and parses all configuration values defined in the given schema.
   *
   * Each value is parsed according to its declared type in the configuration schema
   * and returned as a fully typed object.
   *
   * @param s - The configuration schema defining keys and their expected primitive types.
   *
   * @returns An object containing all configuration entries with correctly parsed types.
   */
  public abstract getAll<S extends ConfigurationSchema>(
    s: S
  ): ResolveConfigurationSchema<S>;

  /**
   * Returns the singleton instance of the ConfigurationService.
   *
   * @returns The singleton instance.
   */
  public static getInstance(): AbstractConfiguration {
    throw new MethodNotImplementedYetError("getInstance");
  }

  /**
   * Ingests environment variables from a file.
   *
   * @param path - Path to the environment file.
   */
  public static ingest(_path: string): void {
    throw new MethodNotImplementedYetError("ingest");
  }
}
