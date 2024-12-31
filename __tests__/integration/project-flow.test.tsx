import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from '@/components/CodeEditor';
import { useCollaboration } from '@/hooks/useCollaboration.hook';
import { useAI } from '@/hooks/useAI.hook';

// Mock the hooks
jest.mock('@/hooks/useCollaboration.hook');
jest.mock('@/hooks/useAI.hook');
jest.mock('@monaco-editor/react', () => ({
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
}));

describe('CodeEditor', () => {
  const mockOnChange = jest.fn();
  const mockBindMonacoEditor = jest.fn();
  const mockOnCursorChange = jest.fn();
  const mockGetAISuggestions = jest.fn();

  beforeEach(() => {
    (useCollaboration as jest.Mock).mockReturnValue({
      bindMonacoEditor: mockBindMonacoEditor,
      awareness: { on: jest.fn(), off: jest.fn() },
      conflicts: [],
      resolveConflict: jest.fn(),
      onCursorChange: mockOnCursorChange,
    });
    (useAI as jest.Mock).mockReturnValue({
      getAISuggestions: mockGetAISuggestions,
    });
  });

  it('renders correctly', () => {
    render(
      <CodeEditor value="console.log('Hello');" onChange={mockOnChange} language="javascript" />
    );
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor-textarea')).toHaveValue("console.log('Hello');");
    expect(screen.getByTestId('mock-editor-language')).toHaveTextContent('javascript');
  });

  it('calls onChange when content changes', () => {
    render(<CodeEditor value="" onChange={mockOnChange} language="javascript" />);

    fireEvent.change(screen.getByTestId('mock-editor-textarea'), {
      target: { value: 'const x = 5;' },
    });
    expect(mockOnChange).toHaveBeenCalledWith('const x = 5;');
  });

  it('updates when value prop changes', () => {
    const { rerender } = render(
      <CodeEditor value="let y = 10;" onChange={mockOnChange} language="javascript" />
    );
    expect(screen.getByTestId('mock-editor-textarea')).toHaveValue('let y = 10;');

    rerender(<CodeEditor value="const z = 20;" onChange={mockOnChange} language="javascript" />);
    expect(screen.getByTestId('mock-editor-textarea')).toHaveValue('const z = 20;');
  });

  it('handles language change', () => {
    const { rerender } = render(
      <CodeEditor value="print('Hello')" onChange={mockOnChange} language="python" />
    );
    expect(screen.getByTestId('mock-editor-language')).toHaveTextContent('python');

    rerender(<CodeEditor value="print('Hello')" onChange={mockOnChange} language="typescript" />);
    expect(screen.getByTestId('mock-editor-language')).toHaveTextContent('typescript');
  });

  it('displays loading state', () => {
    render(<CodeEditor value="" onChange={mockOnChange} language="javascript" />);
    expect(screen.getByLabelText('Loading editor')).toBeInTheDocument();
  });

  it('displays error message when AI suggestions fail', async () => {
    mockGetAISuggestions.mockRejectedValue(new Error('AI suggestion error'));

    render(
      <CodeEditor value="console.log('Hello');" onChange={mockOnChange} language="javascript" />
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch AI suggestions');
    });
  });

  it('handles conflicts', () => {
    (useCollaboration as jest.Mock).mockReturnValue({
      ...useCollaboration(),
      conflicts: [{ start: 0, end: 5, localContent: 'local', remoteContent: 'remote' }],
    });

    render(<CodeEditor value="" onChange={mockOnChange} language="javascript" />);

    expect(screen.getByLabelText('Conflict resolution')).toBeInTheDocument();
    expect(screen.getByText('Conflicts Detected')).toBeInTheDocument();
    expect(screen.getByText('Keep Local')).toBeInTheDocument();
    expect(screen.getByText('Keep Remote')).toBeInTheDocument();
  });
});
