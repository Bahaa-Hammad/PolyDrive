export interface StorageAdapter {
  /**
   * Store a blob in the storage backend
   * @param id Unique identifier for the blob
   * @param data Buffer containing the blob data
   * @returns Storage location identifier
   */
  store(id: string, data: Buffer): Promise<string>;

  /**
   * Retrieve a blob from the storage backend
   * @param id Unique identifier for the blob
   * @returns Buffer containing the blob data
   */
  retrieve(id: string): Promise<Buffer>;

  /**
   * Delete a blob from the storage backend
   * @param id Unique identifier for the blob
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a blob exists in the storage backend
   * @param id Unique identifier for the blob
   * @returns Boolean indicating existence
   */
  exists(id: string): Promise<boolean>;
} 