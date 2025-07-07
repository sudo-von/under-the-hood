/**
 * Standardized interface for managing the lifecycle of core application services.
 *
 * This interface enforces a consistent structure for services that require
 * controlled initialization and teardown phases. It is particularly useful
 * in modular architectures where resources such as connections, workers,
 * or event listeners need to be properly managed.
 *
 * @typeParam InitOptions - Configuration type required during initialization.
 * @typeParam CloseOptions - Configuration type used during cleanup.
 */
export interface ICoreService<InitOptions = void, CloseOptions = void> {
  /**
   * Initializes the service with the provided configuration.
   * This method should prepare the service to be fully operational.
   *
   * @param options - Configuration object used to initialize the service.
   * @returns A promise that resolves when the initialization is complete.
   */
  init(options: InitOptions): Promise<void>;

  /**
   * Gracefully shuts down the service, releasing any held resources.
   *
   * @param options - Configuration object for the shutdown process.
   * @returns A promise that resolves when cleanup is finished.
   */
  close(options: CloseOptions): Promise<void>;
}
