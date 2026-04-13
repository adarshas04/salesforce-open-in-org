import { SfCommand } from '@salesforce/sf-plugins-core';
export declare class OpenMetadata extends SfCommand<{
    url: string;
    metadataType: string;
    metadataName: string;
}> {
    static readonly summary = "Open a Salesforce metadata file directly in your org browser";
    static readonly description: string;
    static readonly examples: string[];
    static readonly flags: {
        file: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces").CustomOptions>;
        'url-only': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'target-org': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    run(): Promise<{
        url: string;
        metadataType: string;
        metadataName: string;
    }>;
}
//# sourceMappingURL=metadata.d.ts.map