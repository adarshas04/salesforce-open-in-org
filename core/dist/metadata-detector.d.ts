export interface MetadataInfo {
    type: string;
    name: string;
}
/**
 * Extract the Flow label from its XML file content.
 * Falls back to null if label cannot be extracted.
 */
export declare function getFlowLabel(filePath: string): string | null;
/**
 * Detect the Salesforce metadata type and API name from a file path
 * inside an SFDX project structure (force-app/main/default/...).
 */
export declare function getMetadataTypeAndName(filePath: string): MetadataInfo | null;
/**
 * Extract the object API name from a layout file path.
 * e.g. ".../layouts/Opportunity-FY'25 Opp Layout.layout-meta.xml" → "Opportunity"
 */
export declare function getLayoutObjectName(filePath: string): string;
//# sourceMappingURL=metadata-detector.d.ts.map