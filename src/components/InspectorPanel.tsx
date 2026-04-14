"use client";

import { useState } from "react";
import { useVisualEditor, EditableElement } from "@/lib/visual-editor-context";

interface InspectorPanelProps {
  element: EditableElement | null;
}

export function InspectorPanel({ element }: InspectorPanelProps) {
  const { updateElement, saveChanges, setSelectedElement } = useVisualEditor();
  const [textValue, setTextValue] = useState(element?.props.text || "");
  const [classesValue, setClassesValue] = useState(element?.props.classes || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when element changes
  if (element && (textValue !== element.props.text || classesValue !== element.props.classes)) {
    setTextValue(element.props.text || "");
    setClassesValue(element.props.classes || "");
  }

  const handleTextChange = (text: string) => {
    setTextValue(text);
    if (element?.id) {
      updateElement(element.id, { text });
    }
  };

  const handleClassesChange = (classes: string) => {
    setClassesValue(classes);
    if (element?.id) {
      updateElement(element.id, { classes });
    }
  };

  const handleSave = async () => {
    if (!element) return;

    setIsSaving(true);
    try {
      // For now, save to a temp file. In production, you'd map to actual TSX files.
      await saveChanges("src/components/sections/About.tsx", {
        [element.id]: {
          text: textValue,
          classes: classesValue,
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedElement(null);
  };

  if (!element) {
    return (
      <div className="fixed right-4 top-4 z-[9999] w-80 bg-white rounded-lg shadow-2xl p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <p className="text-sm font-medium">Click an element to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-[9999] w-96 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Element Inspector</h3>
          <p className="text-xs opacity-90 mt-1">{element.selector}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:bg-red-700 rounded px-2 py-1 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Text Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Content
          </label>
          <textarea
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
            rows={3}
            placeholder="Edit text content..."
          />
        </div>

        {/* CSS Classes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CSS Classes (Tailwind)
          </label>
          <textarea
            value={classesValue}
            onChange={(e) => handleClassesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm font-mono"
            rows={4}
            placeholder="Enter Tailwind classes..."
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Type Tailwind classes like <code>text-lg font-bold text-white</code>
          </p>
        </div>

        {/* Element Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 text-gray-600">
          <p><strong>Tag:</strong> {element.element.tagName.toLowerCase()}</p>
          <p><strong>ID:</strong> {element.id}</p>
          <p><strong>Current classes:</strong> {element.element.className || "none"}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {isSaving ? "Saving..." : "💾 Save Changes"}
        </button>
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
