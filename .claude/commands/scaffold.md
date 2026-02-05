---
name: scaffold
description: "Scaffold complete features with intelligent template detection, dependency analysis, and boilerplate recognition following 2025 Next.js 14+ best practices"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# scaffold

**Source:** Sigma Protocol generators module
**Version:** 3.0.0

---


# @scaffold

**Intelligent feature scaffolding with template learning and dependency detection**

## 🎯 Purpose

Rapidly scaffold complete features following 2025 Next.js 14+ best practices with TypeScript, React Server Components, Server Actions, and Drizzle ORM integration. Saves 30-60 minutes per feature while ensuring consistency and quality.

**v3.0.0** adds intelligent pattern detection that learns from your codebase, identifies duplicate patterns, and detects dependency conflicts before they happen.

---

## 🆕 v3.0.0 Enhancements

### Template Intelligence
- **Pattern Learning**: Analyzes existing features to learn your patterns
- **Template Suggestions**: Recommends templates based on similar features
- **Custom Templates**: Detects and reuses project-specific patterns

### Boilerplate Detection
- **Duplicate Prevention**: Identifies duplicate patterns across codebase
- **Pattern Consolidation**: Suggests refactoring opportunities
- **DRY Enforcement**: Warns before creating redundant code

### Smart Dependency Detection
- **Auto-Detection**: Detects required dependencies from generated code
- **Conflict Resolution**: Identifies peer dependency conflicts
- **Version Compatibility**: Validates version compatibility

### Enhanced Context Awareness
- **PRD Integration**: Reads and applies context from existing PRDs
- **Design System Sync**: Applies design tokens automatically
- **Architecture Alignment**: Ensures consistency with project architecture

---

## 🌐 Cross-Platform Compatibility

### Platform Detection

```typescript
interface PlatformContext {
  platform: 'cursor' | 'claude-code' | 'open-code' | 'unknown';
  mcpAvailable: boolean;
  tools: {
    available: string[];
    fallbacks: Record<string, string>;
  };
}

async function detectPlatform(): Promise<PlatformContext> {
  const cursorMCP = await checkMCPAvailability([
    'mcp_supabase-mcp-server_list_tables',
    'mcp_exa_web_search_exa',
    'mcp_Ref_ref_search_documentation',
  ]);
  
  if (cursorMCP.allAvailable) {
    return { platform: 'cursor', mcpAvailable: true, tools: { available: cursorMCP.tools, fallbacks: {} } };
  }
  
  const claudeMCP = await checkMCPAvailability(['web_search', 'read_file']);
  if (claudeMCP.hasWebSearch) {
    return {
      platform: 'claude-code',
      mcpAvailable: false,
      tools: {
        available: claudeMCP.tools,
        fallbacks: {
          'mcp_supabase-mcp-server_list_tables': 'grep_schema_files',
          'mcp_exa_web_search_exa': 'web_search',
        },
      },
    };
  }
  
  return {
    platform: 'open-code',
    mcpAvailable: false,
    tools: {
      available: ['read_file', 'write', 'grep', 'run_terminal_cmd'],
      fallbacks: {
        'mcp_supabase-mcp-server_list_tables': 'grep_schema_files',
        'mcp_exa_web_search_exa': 'curl_web_search',
      },
    },
  };
}
```

### Tool Priority

```
1. PRIMARY: MCP tools (mcp_exa_*, mcp_Ref_*, mcp_supabase-*)
2. BACKUP: Built-in tools (web_search, grep, read_file)
3. FALLBACK: CLI tools (curl, jq, find)
```

---

## 📋 Command Usage

### **Basic Scaffolding**
```bash
@scaffold --type=feature --name="user-profile"
```

### **With Database Schema**
```bash
@scaffold --type=feature --name="analytics-dashboard" --with-db
```

### **Dry Run (Preview Only)**
```bash
@scaffold --type=feature --name="notifications" --dry-run
```

### **Component Only**
```bash
@scaffold --type=component --name="DataTable"
```

### **API Route Only**
```bash
@scaffold --type=api --name="webhooks/stripe"
```

### **Learn from Existing Feature (v3.0.0)**
```bash
@scaffold --learn=user-dashboard
```

### **Use Custom Template (v3.0.0)**
```bash
@scaffold --type=feature --name="new-dashboard" --from-template=user-dashboard
```

---

## 🎭 Parameters

| Parameter | Values | Description | Default |
|-----------|--------|-------------|---------|
| `--type` | `feature`, `component`, `api`, `action`, `page` | Type of scaffold | `feature` |
| `--name` | string | Name of feature/component (kebab-case) | Required |
| `--features` | CSV | Sub-features to include | All |
| `--with-db` | boolean | Generate database schema | `true` |
| `--with-tests` | boolean | Generate test files | `true` |
| `--dry-run` | boolean | Preview without creating files | `false` |
| `--learn` | string | Learn patterns from existing feature (v3.0.0) | None |
| `--from-template` | string | Use learned template (v3.0.0) | None |

---

## 🧠 Template Intelligence (v3.0.0)

### Pattern Learning

```typescript
interface LearnedPattern {
  id: string;
  name: string;
  source: string; // Feature path it was learned from
  structure: {
    components: ComponentPattern[];
    actions: ActionPattern[];
    types: TypePattern[];
    tests: TestPattern[];
  };
  conventions: {
    naming: NamingConvention;
    imports: ImportPattern[];
    exports: ExportPattern[];
  };
  metadata: {
    learnedAt: string;
    usageCount: number;
    lastUsed: string;
  };
}

async function learnFromFeature(featurePath: string): Promise<LearnedPattern> {
  console.log(`📚 Learning patterns from ${featurePath}...`);
  
  // Read all files in feature directory
  const files = await glob(`${featurePath}/**/*.{ts,tsx}`);
  
  const patterns: LearnedPattern = {
    id: generatePatternId(featurePath),
    name: path.basename(featurePath),
    source: featurePath,
    structure: {
      components: [],
      actions: [],
      types: [],
      tests: [],
    },
    conventions: {
      naming: detectNamingConvention(files),
      imports: extractImportPatterns(files),
      exports: extractExportPatterns(files),
    },
    metadata: {
      learnedAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: '',
    },
  };
  
  // Analyze each file
  for (const file of files) {
    const content = await readFile(file);
    const fileType = classifyFile(file, content);
    
    switch (fileType) {
      case 'component':
        patterns.structure.components.push(extractComponentPattern(content, file));
        break;
      case 'action':
        patterns.structure.actions.push(extractActionPattern(content, file));
        break;
      case 'types':
        patterns.structure.types.push(extractTypePattern(content, file));
        break;
      case 'test':
        patterns.structure.tests.push(extractTestPattern(content, file));
        break;
    }
  }
  
  // Save learned pattern
  await saveLearnedPattern(patterns);
  
  console.log(`
✅ Pattern Learned: ${patterns.name}
   Components: ${patterns.structure.components.length}
   Actions: ${patterns.structure.actions.length}
   Types: ${patterns.structure.types.length}
   Tests: ${patterns.structure.tests.length}
   
   Use with: @scaffold --from-template=${patterns.name}
`);
  
  return patterns;
}
```

### Template Suggestions

```typescript
async function suggestTemplates(
  featureName: string,
  featureType: string
): Promise<TemplateSuggestion[]> {
  // Load all learned patterns
  const patterns = await loadLearnedPatterns();
  
  // Load existing features for comparison
  const existingFeatures = await scanExistingFeatures();
  
  const suggestions: TemplateSuggestion[] = [];
  
  // Find similar features by name
  for (const pattern of patterns) {
    const nameSimilarity = calculateSimilarity(featureName, pattern.name);
    if (nameSimilarity > 0.5) {
      suggestions.push({
        template: pattern.name,
        similarity: nameSimilarity,
        reason: `Similar name to "${pattern.name}"`,
      });
    }
  }
  
  // Find similar features by type/structure
  for (const feature of existingFeatures) {
    const structureSimilarity = analyzeStructureSimilarity(featureType, feature);
    if (structureSimilarity > 0.6) {
      suggestions.push({
        template: feature.name,
        similarity: structureSimilarity,
        reason: `Similar structure to "${feature.name}"`,
      });
    }
  }
  
  // Sort by similarity
  return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

async function applyTemplate(
  template: LearnedPattern,
  newFeatureName: string
): Promise<GeneratedFiles> {
  console.log(`📋 Applying template: ${template.name} → ${newFeatureName}`);
  
  const files: GeneratedFiles = [];
  
  // Generate components from template
  for (const compPattern of template.structure.components) {
    const newContent = replacePatternVariables(compPattern.template, {
      originalName: template.name,
      newName: newFeatureName,
      pascalCase: toPascalCase(newFeatureName),
      camelCase: toCamelCase(newFeatureName),
      kebabCase: toKebabCase(newFeatureName),
    });
    
    const newPath = compPattern.path.replace(
      template.name,
      newFeatureName
    );
    
    files.push({ path: newPath, content: newContent });
  }
  
  // Similar for actions, types, tests...
  
  return files;
}
```

---

## 🔍 Boilerplate Detection (v3.0.0)

### Duplicate Pattern Identification

```typescript
interface DuplicatePattern {
  pattern: string;
  occurrences: {
    file: string;
    lines: [number, number];
  }[];
  consolidationSuggestion: string;
}

async function detectDuplicatePatterns(): Promise<DuplicatePattern[]> {
  console.log('🔍 Scanning for duplicate patterns...');
  
  // Scan common directories
  const componentFiles = await glob('components/**/*.tsx');
  const actionFiles = await glob('actions/**/*.ts');
  const libFiles = await glob('lib/**/*.ts');
  
  const allFiles = [...componentFiles, ...actionFiles, ...libFiles];
  const patterns: Map<string, string[]> = new Map();
  
  // Extract patterns from each file
  for (const file of allFiles) {
    const content = await readFile(file);
    const extractedPatterns = extractCodePatterns(content);
    
    for (const pattern of extractedPatterns) {
      const hash = hashPattern(pattern);
      if (!patterns.has(hash)) {
        patterns.set(hash, []);
      }
      patterns.get(hash)!.push(file);
    }
  }
  
  // Find duplicates
  const duplicates: DuplicatePattern[] = [];
  
  for (const [hash, files] of patterns) {
    if (files.length > 2) { // More than 2 occurrences
      duplicates.push({
        pattern: getPatternFromHash(hash),
        occurrences: files.map(f => ({
          file: f,
          lines: findPatternLines(f, hash),
        })),
        consolidationSuggestion: generateConsolidationSuggestion(hash, files),
      });
    }
  }
  
  return duplicates;
}

async function warnAboutDuplicates(
  newFeature: string,
  duplicates: DuplicatePattern[]
): Promise<void> {
  if (duplicates.length === 0) return;
  
  console.warn(`
⚠️ DUPLICATE PATTERN WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found ${duplicates.length} patterns that may already exist in your codebase.

${duplicates.map(d => `
📋 Pattern: ${d.pattern.slice(0, 50)}...
   Found in: ${d.occurrences.length} files
   Suggestion: ${d.consolidationSuggestion}
`).join('\n')}

Consider:
1. Reusing existing code instead of generating new
2. Extracting common patterns to shared utilities
3. Using @scaffold --from-template to maintain consistency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}
```

---

## 📦 Smart Dependency Detection (v3.0.0)

### Auto-Detection

```typescript
interface DependencyAnalysis {
  required: {
    name: string;
    version: string;
    reason: string;
    installed: boolean;
  }[];
  conflicts: {
    package: string;
    currentVersion: string;
    requiredVersion: string;
    resolution: string;
  }[];
  recommendations: {
    package: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

async function analyzeDependencies(generatedCode: string[]): Promise<DependencyAnalysis> {
  const packageJson = JSON.parse(await readFile('package.json'));
  const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const analysis: DependencyAnalysis = {
    required: [],
    conflicts: [],
    recommendations: [],
  };
  
  // Detect imports from generated code
  const imports = new Set<string>();
  for (const code of generatedCode) {
    const importMatches = code.match(/from ['"]([^'"]+)['"]/g) || [];
    for (const match of importMatches) {
      const pkg = match.match(/from ['"]([^'"]+)['"]/)?.[1];
      if (pkg && !pkg.startsWith('.') && !pkg.startsWith('@/')) {
        imports.add(pkg.split('/')[0]);
      }
    }
  }
  
  // Check each import
  for (const pkg of imports) {
    const isInstalled = pkg in installedDeps;
    const latestVersion = await getLatestVersion(pkg);
    
    analysis.required.push({
      name: pkg,
      version: latestVersion,
      reason: 'Used in generated code',
      installed: isInstalled,
    });
    
    // Check for version conflicts
    if (isInstalled) {
      const currentVersion = installedDeps[pkg];
      const peerDeps = await getPeerDependencies(pkg, latestVersion);
      
      for (const [peer, requiredVer] of Object.entries(peerDeps)) {
        if (peer in installedDeps && !semverSatisfies(installedDeps[peer], requiredVer)) {
          analysis.conflicts.push({
            package: peer,
            currentVersion: installedDeps[peer],
            requiredVersion: requiredVer as string,
            resolution: `Update ${peer} to ${requiredVer}`,
          });
        }
      }
    }
  }
  
  // Generate recommendations
  if (!('zod' in installedDeps) && generatedCode.some(c => c.includes('validate'))) {
    analysis.recommendations.push({
      package: 'zod',
      reason: 'Type-safe validation for forms and API inputs',
      impact: 'high',
    });
  }
  
  return analysis;
}

async function resolveDependencies(analysis: DependencyAnalysis): Promise<void> {
  // Install missing dependencies
  const missing = analysis.required.filter(d => !d.installed);
  
  if (missing.length > 0) {
    console.log(`
📦 Installing ${missing.length} dependencies...
${missing.map(d => `   - ${d.name}@${d.version}`).join('\n')}
`);
    
    const installCmd = `pnpm add ${missing.map(d => `${d.name}@${d.version}`).join(' ')}`;
    await runCommand(installCmd);
  }
  
  // Resolve conflicts
  if (analysis.conflicts.length > 0) {
    console.warn(`
⚠️ Dependency Conflicts Detected
${analysis.conflicts.map(c => `
   ${c.package}: ${c.currentVersion} → ${c.requiredVersion}
   Resolution: ${c.resolution}
`).join('\n')}

Run: pnpm update ${analysis.conflicts.map(c => c.package).join(' ')}
`);
  }
}
```

---

## 📄 Enhanced Context Awareness (v3.0.0)

### PRD Integration

```typescript
async function loadPRDContext(featureName: string): Promise<PRDContext | null> {
  // Search for related PRDs
  const prdPaths = [
    `docs/prds/flows/**/${featureName}.md`,
    `docs/prds/frontend/${featureName}.md`,
    `docs/prds/backend/${featureName}.md`,
  ];
  
  for (const pattern of prdPaths) {
    const matches = await glob(pattern);
    if (matches.length > 0) {
      const prdContent = await readFile(matches[0]);
      
      return {
        path: matches[0],
        components: extractComponentsFromPRD(prdContent),
        schema: extractSchemaFromPRD(prdContent),
        actions: extractActionsFromPRD(prdContent),
        tests: extractTestRequirementsFromPRD(prdContent),
      };
    }
  }
  
  return null;
}

async function applyPRDContext(
  context: PRDContext,
  generatedFiles: GeneratedFiles
): Promise<GeneratedFiles> {
  // Inject PRD-specified components
  for (const component of context.components) {
    const existingFile = generatedFiles.find(f => 
      f.path.includes(toKebabCase(component.name))
    );
    
    if (existingFile) {
      // Enhance with PRD requirements
      existingFile.content = enhanceWithPRDRequirements(
        existingFile.content,
        component
      );
    }
  }
  
  // Ensure schema matches PRD
  if (context.schema) {
    const schemaFile = generatedFiles.find(f => f.path.includes('schema'));
    if (schemaFile) {
      schemaFile.content = alignSchemaWithPRD(schemaFile.content, context.schema);
    }
  }
  
  return generatedFiles;
}
```

### Design System Sync

```typescript
async function syncWithDesignSystem(
  generatedFiles: GeneratedFiles
): Promise<GeneratedFiles> {
  // Load design tokens
  const uiProfile = await readFile('docs/design/ui-profile.json')
    .then(JSON.parse)
    .catch(() => null);
  
  const tokens = await readFile('docs/design/TOKENS.md').catch(() => null);
  
  if (!uiProfile && !tokens) {
    console.log('ℹ️ No design system found - using defaults');
    return generatedFiles;
  }
  
  console.log('🎨 Applying design system tokens...');
  
  for (const file of generatedFiles) {
    if (file.path.endsWith('.tsx')) {
      file.content = applyDesignTokens(file.content, uiProfile, tokens);
    }
  }
  
  return generatedFiles;
}
```

---

## 📈 Trend Tracking (v3.0.0)

### Scaffolding Metrics

```typescript
interface ScaffoldMetrics {
  featureName: string;
  timestamp: string;
  filesGenerated: number;
  linesOfCode: number;
  testsGenerated: number;
  dependenciesAdded: number;
  templateUsed: string | null;
  duplicatesAvoided: number;
  timesSaved: number; // minutes
}

async function trackScaffolding(metrics: ScaffoldMetrics): Promise<void> {
  const metricsPath = '/docs/.scaffold-metrics.json';
  
  let allMetrics: ScaffoldMetrics[] = [];
  try {
    allMetrics = JSON.parse(await readFile(metricsPath));
  } catch {
    allMetrics = [];
  }
  
  allMetrics.push(metrics);
  await writeFile(metricsPath, JSON.stringify(allMetrics, null, 2));
  
  // Calculate trends
  const totalFeatures = allMetrics.length;
  const totalTimeSaved = allMetrics.reduce((a, b) => a + b.timesSaved, 0);
  const avgFilesPerFeature = allMetrics.reduce((a, b) => a + b.filesGenerated, 0) / totalFeatures;
  
  console.log(`
📈 Scaffolding Trends
━━━━━━━━━━━━━━━━━━━━━━
Total Features Scaffolded: ${totalFeatures}
Total Time Saved: ${totalTimeSaved} minutes (${(totalTimeSaved / 60).toFixed(1)} hours)
Avg Files per Feature: ${avgFilesPerFeature.toFixed(1)}
Templates Used: ${allMetrics.filter(m => m.templateUsed).length}
Duplicates Avoided: ${allMetrics.reduce((a, b) => a + b.duplicatesAvoided, 0)}
━━━━━━━━━━━━━━━━━━━━━━
`);
}
```

### Integration with @status

```typescript
async function reportToStatus(metrics: ScaffoldMetrics): Promise<void> {
  const statusData = {
    command: '@scaffold',
    lastRun: new Date().toISOString(),
    feature: metrics.featureName,
    result: 'success',
    metrics: {
      filesGenerated: metrics.filesGenerated,
      testsGenerated: metrics.testsGenerated,
      timeSaved: metrics.timesSaved,
    },
  };
  
  const statusPath = '/docs/.command-status.json';
  let commandStatus = {};
  try {
    commandStatus = JSON.parse(await readFile(statusPath));
  } catch {
    commandStatus = {};
  }
  
  commandStatus['@scaffold'] = statusData;
  await writeFile(statusPath, JSON.stringify(commandStatus, null, 2));
}
```

---

## 🔗 Related Commands & Auto-Invocation

### **Prerequisites (Run Before):**
- `@step-1-ideation` - Defines features to implement
- `@step-8-technical-spec` - Provides technical context
- `@step-10-feature-breakdown` - Lists all features
- `@step-11-prd-generation` - Creates detailed PRD for feature

### **Run After Scaffolding:**
- `@db-migrate` - Apply database schema changes
- `@test-gen` - Generate additional tests
- `@docs-update` - Update documentation

### **Pre-Deployment:**
- `@ui-healer` - Validate UI quality
- `@ship-check` - Pre-deployment validation

---

## 📊 Summary Report (v3.0.0)

```markdown
# Scaffolding Complete: ${Title}

## Files Created (${totalFiles})

### Core Files
- ✅ app/${feature-name}/page.tsx
- ✅ app/${feature-name}/layout.tsx
- ✅ app/${feature-name}/loading.tsx
- ✅ app/${feature-name}/error.tsx

### Components (${componentCount})
${componentList}

### Server Actions (${actionCount})
${actionList}

### Database Schema
${schemaList}

### Tests (${testCount})
${testList}

---

## Intelligence Report

### Template Used
${templateUsed ? `✅ Based on "${templateUsed}" pattern` : '📋 Generated from scratch'}

### Duplicate Patterns Avoided
${duplicatesAvoided.length > 0 ? duplicatesAvoided.map(d => `- ${d}`).join('\n') : 'None detected'}

### Dependencies
- Installed: ${dependenciesInstalled.length}
- Conflicts Resolved: ${conflictsResolved.length}

---

## Metrics

| Metric | Value |
|--------|-------|
| Files Generated | ${filesGenerated} |
| Lines of Code | ${linesOfCode} |
| Tests Generated | ${testsGenerated} |
| Time Saved | ~${timeSaved} minutes |

---

## Next Steps

1. **Apply Database Schema:**
   \`\`\`bash
   @db-migrate --schema="${feature-name}"
   \`\`\`

2. **Implement Business Logic:**
   - Complete server actions in \`app/${feature-name}/_actions/\`
   - Add UI interactions in components
   - Customize validators in \`_lib/validators.ts\`

3. **Check Status:**
   \`\`\`bash
   @status
   \`\`\`

---

## Integration Status

| Command | Status | Last Run |
|---------|--------|----------|
| @scaffold | ✅ Complete | ${new Date().toISOString()} |
| @db-migrate | ⏳ Pending | - |
| @test-gen | ⏳ Pending | - |
```

---

## 🎯 Success Metrics

- **Time Saved:** 30-60 minutes per feature
- **Consistency:** 100% adherence to project patterns
- **Quality:** TypeScript strict mode, Zod validation, test coverage
- **DX:** Clear structure, discoverable files, easy navigation
- **Intelligence:** Pattern reuse, duplicate prevention, dependency safety

---

## 💡 Pro Tips

1. **Learn first** - Run `@scaffold --learn=existing-feature` before creating similar features
2. **Use templates** - `--from-template` ensures consistency across similar features
3. **Check duplicates** - Pay attention to duplicate warnings
4. **Sync with PRD** - Ensure PRD exists for better context awareness
5. **Run @status** - Check overall project health after scaffolding

---

## 🔗 Related Commands

- `@implement-prd` - Full PRD implementation
- `@test-gen` - Generate additional tests
- `@db-migrate` - Apply database migrations
- `@docs-update` - Update documentation
- `@status` - Check project status

---

$END$

