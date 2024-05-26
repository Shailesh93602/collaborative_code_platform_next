import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { CodeEditor } from "../components/code-editor";
import "@testing-library/jest-dom";

jest.mock("@monaco-editor/react", () => {
  return {
    Editor: ({
      value,
      onChange,
      language,
    }: {
      value: string;
      onChange: (value: string) => void;
      language: string;
    }) => (
      <div data-testid="mock-editor">
        <textarea
          data-testid="mock-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span data-testid="mock-editor-language">{language}</span>
      </div>
    ),
  };
});

describe("CodeEditor", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders correctly", () => {
    render(
      <CodeEditor
        value="console.log('Hello');"
        onChange={mockOnChange}
        language="javascript"
      />
    );
    expect(screen.getByTestId("mock-editor")).toBeInTheDocument();
    expect(screen.getByTestId("mock-editor-textarea")).toHaveValue(
      "console.log('Hello');"
    );
    expect(screen.getByTestId("mock-editor-language")).toHaveTextContent(
      "javascript"
    );
  });

  it("calls onChange when content changes", () => {
    render(
      <CodeEditor value="" onChange={mockOnChange} language="javascript" />
    );

    fireEvent.change(screen.getByTestId("mock-editor-textarea"), {
      target: { value: "const x = 5;" },
    });
    expect(mockOnChange).toHaveBeenCalledWith("const x = 5;");
  });

  it("updates when value prop changes", () => {
    const { rerender } = render(
      <CodeEditor
        value="let y = 10;"
        onChange={mockOnChange}
        language="javascript"
      />
    );
    expect(screen.getByTestId("mock-editor-textarea")).toHaveValue(
      "let y = 10;"
    );

    rerender(
      <CodeEditor
        value="const z = 20;"
        onChange={mockOnChange}
        language="javascript"
      />
    );
    expect(screen.getByTestId("mock-editor-textarea")).toHaveValue(
      "const z = 20;"
    );
  });

  it("handles language change", () => {
    const { rerender } = render(
      <CodeEditor
        value="print('Hello')"
        onChange={mockOnChange}
        language="python"
      />
    );
    expect(screen.getByTestId("mock-editor-language")).toHaveTextContent(
      "python"
    );

    rerender(
      <CodeEditor
        value="print('Hello')"
        onChange={mockOnChange}
        language="typescript"
      />
    );
    expect(screen.getByTestId("mock-editor-language")).toHaveTextContent(
      "typescript"
    );
  });
});
