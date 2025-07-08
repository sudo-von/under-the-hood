/**
 * Represents a concrete configuration object that conforms to a given schema.
 */
export type Configuration<S extends ConfigurationSchema = {}> = S;

/**
 * Extracts the valid keys from a given configuration.
 */
export type ConfigurationKey<C extends Configuration> = keyof C & string;

/**
 * Represents the set of allowed primitive types for configuration values.
 */
export type ConfigurationPrimitive = "string" | "number" | "boolean";

/**
 * Defines the expected structure of a configuration object.
 */
export type ConfigurationSchema = Record<string, ConfigurationPrimitive>;

/**
 * Resolves a ConfigSchema to its corresponding TypeScript-native types.
 */
export type ResolveConfigurationSchema<S extends ConfigurationSchema> = {
  [K in keyof S]: S[K] extends "string"
    ? string
    : S[K] extends "number"
    ? number
    : S[K] extends "boolean"
    ? boolean
    : never;
};
