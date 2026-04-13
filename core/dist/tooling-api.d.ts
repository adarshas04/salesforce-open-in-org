/**
 * Get the default Salesforce org alias from the CLI.
 * Throws if no default org is set.
 */
export declare function getDefaultOrg(): string;
/**
 * Get the Salesforce instance URL for the given org alias.
 */
export declare function getInstanceUrl(orgAlias: string): string;
/**
 * Resolve the 18-char Salesforce metadata ID via Tooling API.
 * Returns null if the metadata type is unsupported or the record is not found.
 */
export declare function getMetadataId(orgAlias: string, metadataType: string, metadataName: string): Promise<string | null>;
//# sourceMappingURL=tooling-api.d.ts.map