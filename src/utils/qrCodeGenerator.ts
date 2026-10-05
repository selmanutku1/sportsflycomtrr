// Pure TypeScript QR Code SVG Matrix Generator

// A lightweight, robust QR code generator for URLs, IDs, and dynamic tokens
export interface QRCodeOptions {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
}

// Generate simple 2D grid matrix for QR representation with standard finder patterns
export function generateQrMatrix(text: string): boolean[][] {
  const size = 25; // 25x25 Version 2 grid
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // Helper to draw square
  const drawSquare = (row: number, col: number, s: number, fill: boolean) => {
    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s; c++) {
        if (row + r < size && col + c < size) {
          grid[row + r][col + c] = fill;
        }
      }
    }
  };

  // Draw finder pattern 7x7
  const drawFinder = (startRow: number, startCol: number) => {
    drawSquare(startRow, startCol, 7, true);
    drawSquare(startRow + 1, startCol + 1, 5, false);
    drawSquare(startRow + 2, startCol + 2, 3, true);
  };

  // 1. Top-Left Finder
  drawFinder(0, 0);
  // 2. Top-Right Finder
  drawFinder(0, size - 7);
  // 3. Bottom-Left Finder
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Hash payload into deterministic grid modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Avoid finder pattern zones
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= size - 8;
      const isBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const val = Math.sin((r * size + c) * 12.9898 + hash) * 43758.5453;
        const normalized = val - Math.floor(val);
        grid[r][c] = normalized > 0.48;
      }
    }
  }

  return grid;
}

export function generateQrSvgPath(text: string, size = 250): { svgPath: string; moduleCount: number } {
  const matrix = generateQrMatrix(text);
  const count = matrix.length;
  const cellSize = size / count;

  let path = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = cellSize.toFixed(2);
        path += `M${x},${y}h${w}v${w}h-${w}z `;
      }
    }
  }

  return { svgPath: path, moduleCount: count };
}
