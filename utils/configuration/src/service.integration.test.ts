import {
  ConfigurationFilePermissionError,
  ConfigurationNotIngestedError,
  InvalidNumberConfigurationError,
  MissingConfigurationError,
  MissingConfigurationFileError,
  UnsupportedPrimitiveError,
} from "./errors";
import { chmodSync } from "fs";
import { join } from "path";
import { ConfigurationSchema } from "./types";

const { ConfigurationService } = await import("./service");
const { ConfigurationAlreadyIngestedError } = await import("./errors");

describe("ConfigurationService", () => {
  const filename = ".env.integration.sample";
  const directory = process.cwd();
  const path = join(directory, filename);

  beforeEach(() => {
    ConfigurationService["isIngested"] = false;
    ConfigurationService["instance"] = undefined;
  });

  describe("getAll", () => {
    describe("when the configuration has been ingested", () => {
      const configurationSchema: ConfigurationSchema = {
        FALSY_BOOLEAN: "boolean",
        FALSY_STRING: "string",
        FALSY_NUMBER: "number",
        TRUTHY_BOOLEAN: "boolean",
        TRUTHY_STRING: "string",
        TRUTHY_NUMBER: "number",
      };

      beforeEach(() => {
        ConfigurationService.ingest(path);
      });

      it("parses and returns truthy values as correct native types", () => {
        const configurationService = ConfigurationService.getInstance();
        expect(configurationService.getAll(configurationSchema)).toMatchObject({
          TRUTHY_BOOLEAN: true,
          TRUTHY_STRING: "string",
          TRUTHY_NUMBER: 1,
        });
      });

      it("parses and returns falsy values like 'false', '' and '0' correctly", () => {
        const configurationService = ConfigurationService.getInstance();
        expect(configurationService.getAll(configurationSchema)).toMatchObject({
          FALSY_BOOLEAN: false,
          FALSY_STRING: "",
          FALSY_NUMBER: 0,
        });
      });

      it("throws MissingConfigurationError when a requested key is not found", () => {
        const configurationService = ConfigurationService.getInstance();
        expect(() =>
          configurationService.getAll({
            MISSING_KEY: "string",
          })
        ).toThrow(MissingConfigurationError);
      });

      it("throws InvalidNumberConfigurationError if a value expected as number is invalid", () => {
        const configurationService = ConfigurationService.getInstance();
        expect(() =>
          configurationService.getAll({
            INVALID_NUMBER: "number",
          })
        ).toThrow(InvalidNumberConfigurationError);
      });

      it("throws UnsupportedPrimitiveError when an unsupported primitive type is requested", () => {
        const configurationService = ConfigurationService.getInstance();
        expect(() =>
          configurationService.getAll({
            INVALID_TYPE: "{}" as any,
          })
        ).toThrow(UnsupportedPrimitiveError);
      });
    });
  });

  describe("getInstance", () => {
    describe("when the configuration has been ingested", () => {
      beforeEach(() => {
        ConfigurationService.ingest(path);
      });

      it("returns the singleton instance of ConfigurationService", () => {
        expect(ConfigurationService.getInstance()).toBeInstanceOf(
          ConfigurationService
        );
      });
    });

    describe("when the configuration has not been ingested", () => {
      it("throws a ConfigurationNotIngestedError", () => {
        expect(() => ConfigurationService.getInstance()).toThrow(
          ConfigurationNotIngestedError
        );
      });
    });
  });

  describe("ingest", () => {
    describe("when configuration has already been ingested", () => {
      beforeEach(() => {
        ConfigurationService.ingest(path);
      });

      it("throws a ConfigurationAlreadyIngestedError if called more than once", () => {
        expect(() => ConfigurationService.ingest(path)).toThrow(
          ConfigurationAlreadyIngestedError
        );
      });
    });

    describe("when configuration has not been ingested", () => {
      it("throws a MissingConfigurationFileError if the file does not exist", () => {
        const nonexistentPath = "nonexistent-path";

        expect(() => ConfigurationService.ingest(nonexistentPath)).toThrow(
          MissingConfigurationFileError
        );
      });

      it("throws a ConfigurationFilePermissionError if the file is not readable", () => {
        const NO_PERMISSIONS = 0o000;
        const READ_PERMISSIONS = 0o444;

        chmodSync(path, NO_PERMISSIONS);

        expect(() => ConfigurationService.ingest(path)).toThrow(
          ConfigurationFilePermissionError
        );

        chmodSync(path, READ_PERMISSIONS);
      });

      it("successfully ingests when the file exists, is readable, and parses correctly", () => {
        ConfigurationService.ingest(path);

        expect(ConfigurationService["isIngested"]).toBe(true);
      });
    });
  });
});
