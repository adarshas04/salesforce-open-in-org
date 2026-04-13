# Salesforce Open in Org

Open any Salesforce metadata file directly in your org — from VSCode or the Salesforce CLI.

Supports **15+ metadata types** with automatic ID resolution via Tooling API.

## Supported Metadata Types

| Type | File Pattern | URL Target |
|------|-------------|------------|
| ApexClass | `.cls` | Setup → Apex Classes |
| ApexTrigger | `.trigger` | Setup → Apex Triggers |
| Flow | `.flow-meta.xml` | Flow Builder |
| CustomField | `objects/X/fields/Y.field-meta.xml` | Object Manager → Fields |
| Layout | `.layout-meta.xml` | Object Manager → Page Layouts |
| PermissionSet | `.permissionset-meta.xml` | Setup → Permission Sets |
| Profile | `.profile-meta.xml` | Setup → Profiles |
| LWC | `lwc/componentName/` | Setup → Lightning Components |
| Aura | `aura/componentName/` | Setup → Aura Components |
| ApexPage | `.page` | Setup → Visualforce Pages |
| ApexComponent | `.component` | Setup → Visualforce Components |
| CustomObject | `.object` | Object Manager |
| CustomTab | `.tab` | Setup → Tabs |
| CustomApplication | `.app` | Setup → App Manager |

---

## Option 1: VSCode Extension

### Install from VSIX (local)

```bash
cd salesforce-open-in-org
npm install
npm run build:core
npm run package:vscode
# Produces vscode-extension/salesforce-open-in-org-1.0.0.vsix
code --install-extension vscode-extension/salesforce-open-in-org-1.0.0.vsix
```

### Install from VS Marketplace (after publishing)

```
ext install adarsh.salesforce-open-in-org
```

### Usage

1. **Right-click** any metadata file in the editor or explorer → **"Open in Salesforce Org"**
2. **Keyboard shortcut**: `Cmd+Shift+O` (Mac) / `Ctrl+Shift+O` (Windows/Linux)
3. **Command Palette**: `Cmd+Shift+P` → "Open in Salesforce Org"

### Publishing to VS Marketplace

```bash
# One-time: create a publisher at https://marketplace.visualstudio.com/manage
npx @vscode/vsce login adarsh
npm run publish:vscode
```

---

## Option 2: Salesforce CLI Plugin

### Install from local path

```bash
cd salesforce-open-in-org/sf-plugin
npm install
npm run build
sf plugins link .
```

### Install from npm (after publishing)

```bash
sf plugins install sf-open-in-org
```

### Usage

```bash
# Open a class
sf open metadata --file force-app/main/default/classes/MyClass.cls

# Open a flow
sf open metadata -f force-app/main/default/flows/MyFlow.flow-meta.xml

# Open a custom field
sf open metadata -f force-app/main/default/objects/Account/fields/MyField__c.field-meta.xml

# Target a specific org
sf open metadata -f force-app/main/default/classes/MyClass.cls -o myOrgAlias

# Print URL only (don't open browser)
sf open metadata -f force-app/main/default/classes/MyClass.cls --url-only
```

### Publishing to npm

```bash
cd sf-plugin
npm publish
```

---

## Using in Any SFDX Project

Once installed (either as a VSCode extension or SF CLI plugin), it works in **any** Salesforce DX project — no project-level configuration needed. It only requires:

1. **Salesforce CLI** (`sf`) installed
2. A **default org** set (`sf org set-default <alias>`)
3. Files in standard **SFDX project structure** (`force-app/main/default/...`)

---

## Project Structure

```
salesforce-open-in-org/
├── core/                        # Shared TypeScript library
│   └── src/
│       ├── index.ts             # Public exports
│       ├── metadata-detector.ts # File path → metadata type + name
│       ├── tooling-api.ts       # Tooling API ID resolution
│       └── url-builder.ts       # Metadata → Salesforce Setup URL
├── vscode-extension/            # VSCode extension package
│   └── src/
│       └── extension.ts         # VSCode integration (context menu, progress)
├── sf-plugin/                   # SF CLI plugin package
│   └── src/
│       └── commands/open/
│           └── metadata.ts      # `sf open metadata` command
├── package.json                 # Monorepo root (npm workspaces)
└── README.md
```

## Development

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Build individual packages
npm run build:core
npm run build:vscode
npm run build:plugin
```

## How It Works

1. **Detect** metadata type from file path (e.g., `.cls` → ApexClass, `objects/X/fields/Y` → CustomField)
2. **Query** Salesforce Tooling API to resolve the 18-char metadata ID
3. **Build** the correct Setup URL using the ID (falls back to name-based URL if query fails)
4. **Open** in your default browser

### Special Handling

- **Flows**: Reads XML to extract `MasterLabel`, finds active version
- **Custom Fields**: Strips `__c` for Tooling API queries, keeps it in URLs
- **Layouts**: Extracts object name from filename, builds Object Manager URL

## Prerequisites

- **Node.js** ≥ 18
- **Salesforce CLI** (`sf`) v2+
- A configured default org

## License

MIT
