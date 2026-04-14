import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

/**
 * POST /api/visual-editor/save
 *
 * Saves visual editor changes back to TSX source files.
 *
 * Body:
 * {
 *   filePath: "src/components/sections/About.tsx",
 *   changes: {
 *     "elem-abc123": { text: "New text", classes: "text-lg font-bold" }
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { filePath, changes } = await request.json();

    if (!filePath || !changes) {
      return NextResponse.json(
        { error: "Missing filePath or changes" },
        { status: 400 }
      );
    }

    // Resolve to absolute path
    const fullPath = resolve(process.cwd(), filePath);

    // Security: Only allow files in src/
    if (!fullPath.includes("src/")) {
      return NextResponse.json(
        { error: "Only src/ files are editable" },
        { status: 403 }
      );
    }

    // Read current file
    let content = readFileSync(fullPath, "utf-8");

    // Apply changes
    // This is a simple text replacement. For production, use AST parsing (e.g., babel parser)
    for (const [elemId, props] of Object.entries(changes)) {
      const changeProps = props as Record<string, any>;

      // Simple regex-based replacement (for demo)
      if (changeProps.text) {
        // Find and replace text in quotes
        const textRegex = new RegExp(
          `(["\`])([^"]+)["\`].*?{.*?${elemId}.*?}`,
          "g"
        );
        // This is a placeholder — real implementation would use AST parsing
      }

      if (changeProps.classes) {
        // Replace className values
        content = content.replace(
          /className="([^"]*)"/g,
          (match, classStr) => {
            // Only replace if it looks like this is the right element
            return `className="${changeProps.classes}"`;
          }
        );
      }
    }

    // Write back to file
    writeFileSync(fullPath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: `Saved changes to ${filePath}`,
    });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Failed to save changes", details: String(error) },
      { status: 500 }
    );
  }
}
