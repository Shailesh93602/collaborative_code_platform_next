// This file will contain commonly used constants across the project
export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  // ... other languages
];

export const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

export const CONTRACT_ABI = [
  // ... contract ABI
];

export const INITIAL_CODE = {
  javascript: `// Your JavaScript code here
console.log('Hello, World!');`,
  typescript: `// Your TypeScript code here
let message: string = 'Hello, World!';
console.log(message);`,
  python: `# Your Python code here
print('Hello, World!')`,
};

export const API_NAVIGATION = {
  ai: {
    suggestions: '/api/ai-suggest',
  },
};
