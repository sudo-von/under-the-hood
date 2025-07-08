import { jest } from "@jest/globals";
import {
  ConfigurationFilePermissionError,
  ConfigurationNotIngestedError,
  InvalidNumberConfigurationError,
  MissingConfigurationError,
  MissingConfigurationFileError,
  UnknownConfigurationFileError,
  UnsupportedPrimitiveError,
} from "./errors";
import { ConfigurationSchema } from "./types";

const configMock = jest.fn();
jest.unstable_mockModule("dotenv", () => ({
  default: {
    config: configMock,
  },
}));

const { ConfigurationService } = await import("./service");
const { ConfigurationAlreadyIngestedError } = await import("./errors");

describe("ConfigurationService", () => {
  const filename = ".env";
  const directory = "/directory/";
  const path = `${directory}${filename}`;

  beforeEach(() => {
    ConfigurationService["isIngested"] = false;
    ConfigurationService["instance"] = undefined;
  });

  describe("getAll", () => {
    describe("when the configuration has been ingested", () => {
      const configurationSchema: ConfigurationSchema = {
        BOOLEAN: "boolean",
        STRING: "string",
        NUMBER: "number",
      };

      beforeEach(() => {
        configMock.mockClear();
        configMock.mockReturnValue({});
        ConfigurationService.ingest(path);

        delete process.env.BOOLEAN;
        delete process.env.STRING;
        delete process.env.NUMBER;
        delete process.env.UNKOWN;
      });

      it("parses and returns truthy values as correct native types", () => {
        process.env.BOOLEAN = "true";
        process.env.STRING = "string";
        process.env.NUMBER = "1";

        const configurationService = ConfigurationService.getInstance();
        expect(configurationService.getAll(configurationSchema)).toEqual({
          BOOLEAN: true,
          STRING: "string",
          NUMBER: 1,
        });
      });

      it("parses and returns falsy values like 'false', '' and '0' correctly", () => {
        process.env.BOOLEAN = "false";
        process.env.STRING = "";
        process.env.NUMBER = "0";

        const configurationService = ConfigurationService.getInstance();
        expect(configurationService.getAll(configurationSchema)).toEqual({
          BOOLEAN: false,
          STRING: "",
          NUMBER: 0,
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
        process.env.INVALID_TYPE = "invalid-number";

        const configurationService = ConfigurationService.getInstance();
        expect(() =>
          configurationService.getAll({
            INVALID_TYPE: "number",
          })
        ).toThrow(InvalidNumberConfigurationError);
      });

      it("throws UnsupportedPrimitiveError when an unsupported primitive type is requested", () => {
        process.env.INVALID_TYPE = "{}";

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
        configMock.mockReturnValue({});
        ConfigurationService.ingest(path);
      });

      it("returns the singleton instance of ConfigurationService", () => {
        expect(ConfigurationService.getInstance()).toBeInstanceOf(
          ConfigurationService
        );
      });
    });

    describe("when the configuration has not been ingested", () => {
      it("throws ConfigurationNotIngestedError", () => {
        expect(() => ConfigurationService.getInstance()).toThrow(
          ConfigurationNotIngestedError
        );
      });
    });
  });

  describe("ingest", () => {
    describe("when configuration has already been ingested", () => {
      beforeEach(() => {
        configMock.mockReturnValue({});
        ConfigurationService.ingest(path);
      });

      it("throws ConfigurationAlreadyIngestedError if called more than once", () => {
        expect(() => ConfigurationService.ingest(path)).toThrow(
          ConfigurationAlreadyIngestedError
        );
      });
    });

    describe("when configuration has not been ingested", () => {
      it("throws UnknownConfigurationFileError if the error lacks a code property", () => {
        configMock.mockReturnValue({ error: {} });

        expect(() => ConfigurationService.ingest(path)).toThrow(
          UnknownConfigurationFileError
        );
      });

      it("throws MissingConfigurationFileError if the file does not exist", () => {
        configMock.mockReturnValue({ error: { code: "ENOENT" } });

        expect(() => ConfigurationService.ingest(path)).toThrow(
          MissingConfigurationFileError
        );
      });

      it("throws ConfigurationFilePermissionError if the file is not readable", () => {
        configMock.mockReturnValue({ error: { code: "EACCES" } });

        expect(() => ConfigurationService.ingest(path)).toThrow(
          ConfigurationFilePermissionError
        );
      });

      it("throws UnknownConfigurationFileError if the error is unknown", () => {
        configMock.mockReturnValue({ error: { code: "UNKNOWN" } });

        expect(() => ConfigurationService.ingest(path)).toThrow(
          UnknownConfigurationFileError
        );
      });

      it("successfully ingests when the file exists, is readable, and parses correctly", () => {
        configMock.mockReturnValue({});

        ConfigurationService.ingest(path);

        expect(ConfigurationService["isIngested"]).toBe(true);
      });
    });
  });
});
