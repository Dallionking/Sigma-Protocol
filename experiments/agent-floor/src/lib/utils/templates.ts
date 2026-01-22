/**
 * Template loader utility for team templates
 * PRD015-004: Load and validate team templates with Zod schemas
 */

import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Position schema for desk/grid coordinates
 */
export const PositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

/**
 * Agent role enum schema - all supported roles across team types
 */
export const AgentRoleSchema = z.enum([
  // Dev team roles
  "project-manager",
  "architect",
  "frontend-engineer",
  "backend-engineer",
  "qa-engineer",
  "devops-engineer",
  // Trading floor roles
  "analyst",
  "quant",
  "risk-manager",
  "trader",
  "compliance",
  // Creative studio roles
  "writer",
  "designer",
  "reviewer",
  "editor",
  "producer",
]);

/**
 * Agent personality schema - defines communication style and traits
 */
export const PersonalitySchema = z.object({
  traits: z.array(z.string()).min(1),
  communication: z.enum(["formal", "casual", "technical", "structured", "precise"]),
  verbosity: z.enum(["concise", "moderate", "detailed", "thorough"]),
  workStyle: z.enum(["collaborative", "methodical", "iterative", "focused", "exploratory"]),
});

/**
 * Agent configuration schema for template definitions
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: AgentRoleSchema,
  avatar: z.string().min(1),
  desk: PositionSchema,
  provider: z.string().min(1),
  model: z.string().min(1),
  personality: PersonalitySchema.optional(),
  systemPrompt: z.string().min(1),
});

/**
 * Team template schema - full template definition
 */
export const TeamTemplateSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "Template ID must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1),
  description: z.string().min(1),
  map: z.string().min(1),
  agents: z.array(AgentConfigSchema).min(1),
});

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type Position = z.infer<typeof PositionSchema>;
export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type Personality = z.infer<typeof PersonalitySchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type TeamTemplate = z.infer<typeof TeamTemplateSchema>;

/**
 * Template metadata for listing without full content
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  agentCount: number;
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: z.ZodError;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default templates directory path (relative to project root)
 */
const DEFAULT_TEMPLATES_DIR = "templates";

/**
 * Resolve templates directory path
 */
function getTemplatesDir(customDir?: string): string {
  const baseDir = customDir || DEFAULT_TEMPLATES_DIR;
  // Handle both absolute and relative paths
  if (path.isAbsolute(baseDir)) {
    return baseDir;
  }
  // Try to find the templates directory relative to the project root
  // In Node.js context, use process.cwd()
  return path.join(process.cwd(), baseDir);
}

// ============================================================================
// Template Loader Functions
// ============================================================================

/**
 * Load a team template by ID
 *
 * @param templateId - The template identifier (e.g., "dev-team")
 * @param templatesDir - Optional custom templates directory
 * @returns The loaded and validated template
 * @throws Error if template not found or invalid
 *
 * @example
 * ```ts
 * const devTeam = await loadTemplate("dev-team");
 * console.log(devTeam.name); // "Development Team"
 * ```
 */
export async function loadTemplate(
  templateId: string,
  templatesDir?: string
): Promise<TeamTemplate> {
  const dir = getTemplatesDir(templatesDir);
  const templatePath = path.join(dir, `${templateId}.json`);

  // Check if file exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateId} (looked in ${templatePath})`);
  }

  // Read and parse JSON
  const content = fs.readFileSync(templatePath, "utf-8");
  let rawData: unknown;

  try {
    rawData = JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON in template ${templateId}: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Validate with Zod
  const result = TeamTemplateSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Template validation failed for ${templateId}:\n${errors}`);
  }

  return result.data;
}

/**
 * Synchronous version of loadTemplate for contexts where async is not available
 */
export function loadTemplateSync(
  templateId: string,
  templatesDir?: string
): TeamTemplate {
  const dir = getTemplatesDir(templatesDir);
  const templatePath = path.join(dir, `${templateId}.json`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateId} (looked in ${templatePath})`);
  }

  const content = fs.readFileSync(templatePath, "utf-8");
  let rawData: unknown;

  try {
    rawData = JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON in template ${templateId}: ${e instanceof Error ? e.message : String(e)}`);
  }

  const result = TeamTemplateSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Template validation failed for ${templateId}:\n${errors}`);
  }

  return result.data;
}

/**
 * Validate a template object against the schema
 *
 * @param template - The template object to validate
 * @returns Validation result with parsed data or error details
 *
 * @example
 * ```ts
 * const result = validateTemplate(myTemplate);
 * if (result.success) {
 *   console.log("Valid template:", result.data);
 * } else {
 *   console.error("Validation errors:", result.error);
 * }
 * ```
 */
export function validateTemplate(template: unknown): ValidationResult<TeamTemplate> {
  const result = TeamTemplateSchema.safeParse(template);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Validate a template and throw on error (strict mode)
 *
 * @param template - The template object to validate
 * @returns The validated template
 * @throws z.ZodError if validation fails
 */
export function validateTemplateStrict(template: unknown): TeamTemplate {
  return TeamTemplateSchema.parse(template);
}

/**
 * List all available templates in the templates directory
 *
 * @param templatesDir - Optional custom templates directory
 * @returns Array of template metadata (id, name, description, agentCount)
 *
 * @example
 * ```ts
 * const templates = await listTemplates();
 * templates.forEach(t => console.log(`${t.id}: ${t.name} (${t.agentCount} agents)`));
 * ```
 */
export async function listTemplates(templatesDir?: string): Promise<TemplateMetadata[]> {
  const dir = getTemplatesDir(templatesDir);

  // Check if directory exists
  if (!fs.existsSync(dir)) {
    return [];
  }

  // Get all JSON files
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const templates: TemplateMetadata[] = [];

  for (const file of files) {
    const templateId = file.replace(".json", "");

    try {
      const template = await loadTemplate(templateId, templatesDir);
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        agentCount: template.agents.length,
      });
    } catch {
      // Skip invalid templates in list (log could be added here)
      continue;
    }
  }

  return templates;
}

/**
 * Synchronous version of listTemplates
 */
export function listTemplatesSync(templatesDir?: string): TemplateMetadata[] {
  const dir = getTemplatesDir(templatesDir);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const templates: TemplateMetadata[] = [];

  for (const file of files) {
    const templateId = file.replace(".json", "");

    try {
      const template = loadTemplateSync(templateId, templatesDir);
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        agentCount: template.agents.length,
      });
    } catch {
      continue;
    }
  }

  return templates;
}

/**
 * Check if a template exists
 *
 * @param templateId - The template identifier to check
 * @param templatesDir - Optional custom templates directory
 * @returns True if template file exists
 */
export function templateExists(templateId: string, templatesDir?: string): boolean {
  const dir = getTemplatesDir(templatesDir);
  const templatePath = path.join(dir, `${templateId}.json`);
  return fs.existsSync(templatePath);
}

/**
 * Get template path for a given ID
 *
 * @param templateId - The template identifier
 * @param templatesDir - Optional custom templates directory
 * @returns Full path to the template file
 */
export function getTemplatePath(templateId: string, templatesDir?: string): string {
  const dir = getTemplatesDir(templatesDir);
  return path.join(dir, `${templateId}.json`);
}
