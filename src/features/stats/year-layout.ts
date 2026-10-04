export interface GridLayout {
  columns: number;
  rows: number;
  cellSize: number;
  dotRadius: number;
  width: number;
  height: number;
}

export function calculateGridDimensions(
  containerWidth: number,
  totalDots: number = 365
): GridLayout {
  const width = Math.max(1, containerWidth);
  // 19 or 20 columns gives a roughly square grid (19x20 or 20x19)
  const columns = 20;
  const rows = Math.ceil(totalDots / columns);
  const cellSize = width / columns;
  // Dot radius with pleasant padding between dots
  const dotRadius = Math.max(1.5, (cellSize * 0.65) / 2);
  const height = rows * cellSize;

  return {
    columns,
    rows,
    cellSize,
    dotRadius,
    width,
    height,
  };
}

export interface PointToDotParams {
  x: number;
  y: number;
  containerWidth: number;
  totalDots: number;
  columns?: number;
}

/**
 * Converts a touch coordinate (x, y) to the nearest dot index (0-based).
 * Tolerance is half a cell. Returns -1 if out of bounds or outside tolerance.
 */
export function pointToDotIndex(params: PointToDotParams): number {
  const { x, y, containerWidth, totalDots, columns = 20 } = params;
  if (containerWidth <= 0 || totalDots <= 0 || columns <= 0) return -1;

  const cellSize = containerWidth / columns;
  const rows = Math.ceil(totalDots / columns);
  const tolerance = cellSize * 0.5;

  // Strict check outside bounding box + tolerance
  if (
    x < -tolerance ||
    x > containerWidth + tolerance ||
    y < -tolerance ||
    y > rows * cellSize + tolerance
  ) {
    return -1;
  }

  // Clamped col and row based on nearest cell center
  const rawCol = Math.round((x - cellSize / 2) / cellSize);
  const rawRow = Math.round((y - cellSize / 2) / cellSize);

  const col = Math.max(0, Math.min(columns - 1, rawCol));
  const row = Math.max(0, Math.min(rows - 1, rawRow));

  const centerColX = col * cellSize + cellSize / 2;
  const centerRowY = row * cellSize + cellSize / 2;

  const distSq = (x - centerColX) ** 2 + (y - centerRowY) ** 2;
  // Tolerance of half a cell radius in distance
  const maxDist = cellSize * 0.85;
  if (distSq > maxDist * maxDist) {
    return -1;
  }

  const index = row * columns + col;
  if (index < 0 || index >= totalDots) {
    return -1;
  }

  return index;
}

export interface MonthBlockLayout {
  month: number; // 1-12
  x: number;
  y: number;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  dotRadius: number;
}

export function calculateMonthsLayout(containerWidth: number): {
  blocks: MonthBlockLayout[];
  totalHeight: number;
} {
  const width = Math.max(1, containerWidth);
  const cols = 3;
  const rows = 4;
  const gapX = 12;
  const gapY = 16;
  const blockWidth = (width - gapX * (cols - 1)) / cols;

  // Each month block has 7 day-columns (Mon-Sun) and up to 6 week-rows + header
  const headerHeight = 18;
  const dayCols = 7;
  const dayRows = 6;
  const cellWidth = blockWidth / dayCols;
  const cellHeight = cellWidth;
  const blockHeight = headerHeight + dayRows * cellHeight;
  const dotRadius = Math.max(1.2, (cellWidth * 0.6) / 2);

  const blocks: MonthBlockLayout[] = [];
  for (let m = 0; m < 12; m++) {
    const colIndex = m % cols;
    const rowIndex = Math.floor(m / cols);
    const x = colIndex * (blockWidth + gapX);
    const y = rowIndex * (blockHeight + gapY);

    blocks.push({
      month: m + 1,
      x,
      y,
      width: blockWidth,
      height: blockHeight,
      cellWidth,
      cellHeight,
      dotRadius,
    });
  }

  const totalHeight = rows * blockHeight + (rows - 1) * gapY;
  return { blocks, totalHeight };
}

export function pointToMonthBlockDot(
  x: number,
  y: number,
  blocks: MonthBlockLayout[],
  monthGrids: { date: string; inMonth: boolean }[][]
): string | null {
  for (const block of blocks) {
    if (
      x >= block.x &&
      x <= block.x + block.width &&
      y >= block.y &&
      y <= block.y + block.height
    ) {
      const relX = x - block.x;
      const relY = y - (block.y + 18);
      if (relY < 0) return null;
      const col = Math.floor(relX / block.cellWidth);
      const row = Math.floor(relY / block.cellHeight);
      if (col >= 0 && col < 7 && row >= 0 && row < 6) {
        const grid = monthGrids[block.month - 1];
        const cell = grid?.[row * 7 + col];
        if (cell && cell.inMonth) {
          return cell.date;
        }
      }
      return null;
    }
  }
  return null;
}
