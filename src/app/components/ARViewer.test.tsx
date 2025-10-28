import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ARViewer from './ARViewer';

// Mock the model-viewer script loading
const originalCreateElement = document.createElement;
const mockCreateElement = jest.spyOn(document, 'createElement');
const mockHeadAppendChild = jest.spyOn(document.head, 'appendChild');
const mockQuerySelector = jest.spyOn(document, 'querySelector');

// Mock model-viewer custom element
jest.mock('@google/model-viewer', () => ({}), { virtual: true });

// Create a proper HTMLElement mock for model-viewer
Object.defineProperty(window, 'customElements', {
  value: {
    define: jest.fn(),
    get: jest.fn(),
  },
  writable: true,
});

// Mock the model-viewer element as a simple div
const MockModelViewer = () => {
  const element = document.createElement('div');
  element.setAttribute('data-testid', 'model-viewer');

  // Mock properties and methods
  Object.defineProperty(element, 'src', {
    get() { return this.getAttribute('src') || ''; },
    set(value: string) { this.setAttribute('src', value); }
  });

  Object.defineProperty(element, 'poster', {
    get() { return this.getAttribute('poster') || ''; },
    set(value: string) { this.setAttribute('poster', value); }
  });

  Object.defineProperty(element, 'alt', {
    get() { return this.getAttribute('alt') || ''; },
    set(value: string) { this.setAttribute('alt', value); }
  });

  return element;
};

// Mock the script element to avoid DOM issues
const mockScript = {
  src: '',
  type: 'module',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock createElement to return mockScript only for 'script' elements
mockCreateElement.mockImplementation((tagName: string) => {
  if (tagName === 'script') {
    return mockScript as any;
  }
  if (tagName === 'model-viewer') {
    return MockModelViewer() as any;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock head.appendChild to prevent DOM issues
mockHeadAppendChild.mockImplementation((node: any) => {
  // Just return the node without actually appending
  return node;
});

// Override customElements.define to prevent JSDOM validation
const originalDefine = customElements.define;
customElements.define = jest.fn((name: string, constructor: any) => {
  if (name === 'model-viewer') {
    // Skip the actual definition to avoid JSDOM validation
    return;
  }
  return originalDefine.call(customElements, name, constructor);
});

describe('ARViewer Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockCreateElement.mockClear();
    mockHeadAppendChild.mockClear();
    mockQuerySelector.mockClear();

    // Mock script not already loaded
    mockQuerySelector.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the ARViewer component with required props', () => {
      render(<ARViewer assetUrl="/test-model.glb" />);

      const container = screen.getByTestId('ar-viewer-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('w-full', 'h-full');
    });

    it('renders with custom alt text', () => {
      render(<ARViewer assetUrl="/test-model.glb" alt="Custom Alt Text" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('alt', 'Custom Alt Text');
    });

    it('renders with poster image', () => {
      render(<ARViewer assetUrl="/test-model.glb" poster="/poster.jpg" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('poster', '/poster.jpg');
    });

    it('renders the AR button', () => {
      render(<ARViewer assetUrl="/test-model.glb" />);

      const arButton = screen.getByRole('button', { name: /view in ar/i });
      expect(arButton).toBeInTheDocument();
      expect(arButton).toHaveClass('bg-purple-600', 'hover:bg-purple-700');
    });
  });

  describe('Model Viewer Attributes', () => {
    it('sets correct model-viewer attributes', () => {
      render(<ARViewer assetUrl="/test-model.glb" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('src', '/test-model.glb');
      expect(modelViewer).toHaveAttribute('ar');
      expect(modelViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
      expect(modelViewer).toHaveAttribute('camera-controls');
      expect(modelViewer).toHaveAttribute('auto-rotate');
      expect(modelViewer).toHaveAttribute('shadow-intensity', '1');
      expect(modelViewer).toHaveAttribute('exposure', '1');
    });

    it('applies correct styling', () => {
      render(<ARViewer assetUrl="/test-model.glb" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveStyle({
        width: '100%',
        height: '100%',
        minHeight: '400px'
      });
    });
  });

  describe('Script Loading', () => {
    beforeEach(() => {
      // Reset for each script loading test
      mockQuerySelector.mockReturnValue(null);
    });

    it('loads model-viewer script when not present', () => {
      const mockScript = { src: '', type: 'module' };
      mockCreateElement.mockReturnValue(mockScript as any);

      render(<ARViewer assetUrl="/test-model.glb" />);

      expect(mockCreateElement).toHaveBeenCalledWith('script');
      expect(mockScript.src).toBe('https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js');
      expect(mockScript.type).toBe('module');
      expect(mockHeadAppendChild).toHaveBeenCalledWith(mockScript);
    });

    it('does not load script if already present', () => {
      const existingScript = document.createElement('script');
      mockQuerySelector.mockReturnValue(existingScript);

      render(<ARViewer assetUrl="/test-model.glb" />);

      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockHeadAppendChild).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('handles empty assetUrl gracefully', () => {
      render(<ARViewer assetUrl="" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('src', '');
    });

    it('handles invalid assetUrl', () => {
      render(<ARViewer assetUrl="invalid-url" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('src', 'invalid-url');
    });

    it('handles script loading failure', () => {
      const mockScript = {
        src: '',
        type: 'module',
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            callback();
          }
        })
      };
      mockCreateElement.mockReturnValue(mockScript as any);

      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<ARViewer assetUrl="/test-model.glb" />);

      // Script should still be appended even if it fails to load
      expect(mockHeadAppendChild).toHaveBeenCalledWith(mockScript);

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ARViewer assetUrl="/test-model.glb" alt="Test Model" />);

      const modelViewer = screen.getByTestId('model-viewer');
      expect(modelViewer).toHaveAttribute('alt', 'Test Model');
    });

    it('AR button is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ARViewer assetUrl="/test-model.glb" />);

      const arButton = screen.getByRole('button', { name: /view in ar/i });

      // Focus the button
      arButton.focus();
      expect(arButton).toHaveFocus();

      // Can be clicked with keyboard
      await user.keyboard('{Enter}');
      // In a real scenario, this would trigger AR functionality
    });
  });
});