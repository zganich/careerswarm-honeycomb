import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GridCell {
  id: string;
  row: number;
  col: number;
  filled: boolean;
  answer?: string;
  color?: string;
}

interface SnapGridProps {
  filledCells: Array<{ id: string; answer: string; color: string }>;
  className?: string;
}

/**
 * SnapGrid - Background honeycomb grid that receives "flying" hexagon answers
 * 
 * Features:
 * - Hexagonal grid layout with breathing animation
 * - Amber glow effect when cells are filled
 * - Smooth transitions for fill states
 * - Responsive grid sizing
 */
export function SnapGrid({ filledCells, className = "" }: SnapGridProps) {
  const [grid, setGrid] = useState<GridCell[]>([]);

  // Generate hexagonal grid (7 rows × 12 cols = 84 cells)
  useEffect(() => {
    const rows = 7;
    const cols = 12;
    const cells: GridCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Offset every other row for hexagonal pattern
        const offsetCol = row % 2 === 0 ? col : col + 0.5;
        cells.push({
          id: `cell-${row}-${col}`,
          row,
          col: offsetCol,
          filled: false,
        });
      }
    }

    setGrid(cells);
  }, []);

  // Update grid when cells are filled
  useEffect(() => {
    setGrid((prevGrid) =>
      prevGrid.map((cell) => {
        const filledCell = filledCells.find((fc) => fc.id === cell.id);
        if (filledCell) {
          return {
            ...cell,
            filled: true,
            answer: filledCell.answer,
            color: filledCell.color,
          };
        }
        return cell;
      })
    );
  }, [filledCells]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0"
      >
        <defs>
          {/* Amber glow filter for filled cells */}
          <filter id="amber-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Hexagon path definition */}
          <path
            id="hexagon"
            d="M 15,0 L 30,8.66 L 30,25.98 L 15,34.64 L 0,25.98 L 0,8.66 Z"
          />
        </defs>

        {grid.map((cell) => {
          const x = cell.col * 32; // Horizontal spacing
          const y = cell.row * 30; // Vertical spacing

          return (
            <motion.g
              key={cell.id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: cell.filled ? 1 : 0.15,
                scale: cell.filled ? 1 : [1, 1.02, 1],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: {
                  duration: 3,
                  repeat: cell.filled ? 0 : Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <use
                href="#hexagon"
                x={x}
                y={y}
                fill={cell.filled ? cell.color || "#f59e0b" : "none"}
                stroke={cell.filled ? "#f59e0b" : "#e5e7eb"}
                strokeWidth={cell.filled ? 2 : 1}
                filter={cell.filled ? "url(#amber-glow)" : undefined}
                style={{
                  transition: "all 0.3s ease-out",
                }}
              />

              {/* Display answer text in filled cells */}
              {cell.filled && cell.answer && (
                <text
                  x={x + 15}
                  y={y + 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="600"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {cell.answer.length > 12
                    ? `${cell.answer.slice(0, 12)}...`
                    : cell.answer}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
