import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockchainVersionControl } from '@/components/BlockchainVersionControl';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { useToast } from '@/hooks/useToast.hook';

// Mock the hooks
jest.mock('@/hooks/useWeb3.hook');
jest.mock('@/hooks/useToast.hook');

describe('BlockchainVersionControl', () => {
  const mockCode = 'const example = "test";';
  const mockFiles = [{ path: 'example.js', content: mockCode }];
  const mockOnCodeUpdate = jest.fn();
  const mockOnFilesUpdate = jest.fn();

  beforeEach(() => {
    (useWeb3 as jest.Mock).mockReturnValue({
      saveVersion: jest.fn(),
      loadVersion: jest.fn(),
      getAllVersions: jest.fn().mockResolvedValue({ versions: [], total: 0 }),
    });
    (useToast as jest.Mock).mockReturnValue({ toast: jest.fn() });
  });

  it('renders without crashing', () => {
    render(
      <BlockchainVersionControl
        code={mockCode}
        onCodeUpdate={mockOnCodeUpdate}
        files={mockFiles}
        onFilesUpdate={mockOnFilesUpdate}
      />
    );
    expect(screen.getByRole('button', { name: /open version control/i })).toBeInTheDocument();
  });

  it('opens the dialog when the button is clicked', () => {
    render(
      <BlockchainVersionControl
        code={mockCode}
        onCodeUpdate={mockOnCodeUpdate}
        files={mockFiles}
        onFilesUpdate={mockOnFilesUpdate}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /open version control/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('saves a version when the save button is clicked', async () => {
    const mockSaveVersion = jest.fn();
    (useWeb3 as jest.Mock).mockReturnValue({
      ...useWeb3(),
      saveVersion: mockSaveVersion,
    });

    render(
      <BlockchainVersionControl
        code={mockCode}
        onCodeUpdate={mockOnCodeUpdate}
        files={mockFiles}
        onFilesUpdate={mockOnFilesUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /open version control/i }));
    fireEvent.change(screen.getByPlaceholderText('Commit message'), {
      target: { value: 'Test commit' },
    });
    fireEvent.click(screen.getByText('Queue Encrypted Save'));

    await waitFor(() => {
      expect(mockSaveVersion).toHaveBeenCalled();
    });
  });

  // Add more tests for other functionalities...
});
