/**
 * Build the Salesforce Setup URL for a given metadata type, name, and optional file path.
 * Resolves IDs via Tooling API when possible; falls back to name-based URLs.
 */
export declare function buildSalesforceURL(orgAlias: string, metadataType: string, metadataName: string, filePath: string): Promise<string>;
//# sourceMappingURL=url-builder.d.ts.map