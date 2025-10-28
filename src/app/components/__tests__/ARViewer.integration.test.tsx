import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../../page';

// Mock the model-viewer script loading globally
const mockCreateElement = jest.spyOn(document, 'createElement');
const mockHeadAppendChild = jest.spyOn(document.head, 'appendChild');
const mockQuerySelector = jest.spyOn(document, 'querySelector');

describe('ARViewer Integration Tests', () => {
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

  describe('ARViewer in Home Page Context', () => {
    it('renders ARViewer within the home page layout', () => {
      render(<Home />);

      // Check that the AR section is present
      expect(screen.getByText('Try AR Now')).toBeInTheDocument();
      expect(screen.getByText(/Experience augmented reality with our interactive 3D astronaut model/)).toBeInTheDocument();

      // Check that ARViewer is rendered
      const arViewer = screen.getByAltText('Astronaut 3D Model');
      expect(arViewer).toBeInTheDocument();
      expect(arViewer).toHaveAttribute('src', '/astronaut.glb');
    });

    it('displays AR instructions correctly', () => {
      render(<Home />);

      expect(screen.getByText(/AR Instructions:/)).toBeInTheDocument();
      expect(screen.getByText(/Point your camera at a flat surface and tap "View in AR" to place the model in your environment/)).toBeInTheDocument();
    });

    it('AR button is present and functional in page context', () => {
      render(<Home />);

      const arButton = screen.getByRole('button', { name: /view in ar/i });
      expect(arButton).toBeInTheDocument();
      expect(arButton).toHaveClass('bg-purple-600');
    });
  });

  describe('Device Compatibility Checks', () => {
    beforeEach(() => {
      // Mock navigator.userAgent for different devices
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: '',
      });
    });

    it('handles mobile device user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      });

      render(<Home />);

      const arViewer = screen.getByAltText('Astronaut 3D Model');
      expect(arViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
    });

    it('handles desktop device user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });

      render(<Home />);

      const arViewer = screen.getByAltText('Astronaut 3D Model');
      expect(arViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
    });

    it('handles Android device user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
      });

      render(<Home />);

      const arViewer = screen.getByAltText('Astronaut 3D Model');
      expect(arViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
    });

    it('handles devices without WebXR support', () => {
      // Mock WebXR not supported
      Object.defineProperty(navigator, 'xr', {
        writable: true,
        value: undefined,
      });

      render(<Home />);

      // Component should still render and have fallback AR modes
      const arViewer = screen.getByAltText('Astronaut 3D Model');
      expect(arViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
    });
  });

  describe('Script Loading in Integration Context', () => {
    it('loads model-viewer script once across multiple renders', () => {
      const mockScript = { src: '', type: 'module' };
      mockCreateElement.mockReturnValue(mockScript as any);

      // First render
      const { rerender } = render(<Home />);
      expect(mockCreateElement).toHaveBeenCalledTimes(1);

      // Second render - script should not be loaded again
      rerender(<Home />);
      expect(mockCreateElement).toHaveBeenCalledTimes(1);
    });

    it('handles script loading errors gracefully in page context', () => {
      const mockScript = {
        src: '',
        type: 'module',
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(callback, 0); // Simulate async error
          }
        })
      };
      mockCreateElement.mockReturnValue(mockScript as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<Home />);

      // Wait for error handling
      waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Loading States', () => {
    it('renders without crashing during initial load', () => {
      expect(() => render(<Home />)).not.toThrow();
    });

    it('maintains layout stability during script loading', () => {
      const mockScript = { src: '', type: 'module' };
      mockCreateElement.mockReturnValue(mockScript as any);

      render(<Home />);

      // Container should maintain its dimensions
      const container = screen.getByRole('generic', { hidden: true });
      expect(container).toHaveClass('w-full', 'h-full');
    });
  });
});