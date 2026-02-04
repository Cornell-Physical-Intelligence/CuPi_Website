import { useEffect, useRef } from 'react';
import './GridBackground.css';

const GridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gridSize = 10;
    const cellSize = gridSize * 0.4;
    const cornerRadius = 1.5;
    const prefersReducedMotion = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData;
    const shouldReduceMotion = prefersReducedMotion || saveData;

    let cols = 0;
    let rows = 0;
    let grid = [];
    let nextGrid = [];

    const resize = () => {
      const previousDisplay = canvas.style.display;
      canvas.style.display = 'none';

      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight ?? 0,
        document.documentElement.clientHeight,
        window.innerHeight
      );

      canvas.style.display = previousDisplay || '';
      canvas.width = window.innerWidth;
      canvas.height = scrollHeight;
      canvas.style.height = `${scrollHeight}px`;

      const newCols = Math.floor(canvas.width / gridSize);
      const newRows = Math.floor(canvas.height / gridSize);

      // Only reinitialize if size changed
      if (newCols !== cols || newRows !== rows) {
        cols = newCols;
        rows = newRows;

        // Initialize grids
        grid = Array(rows).fill(null).map(() => Array(cols).fill(0));
        nextGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));

        // Random initial state
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            grid[i][j] = Math.random() > 0.7 ? 1 : 0;
          }
        }
      }
    };

    let resizeFrame = null;
    const scheduleResize = () => {
      if (resizeFrame !== null) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        resize();
        if (rows > 0 && cols > 0) {
          draw();
        }
      });
    };

    resize();
    window.addEventListener('resize', scheduleResize);

    const sizeObserver = new ResizeObserver(scheduleResize);
    sizeObserver.observe(document.documentElement);

    const countNeighbors = (grid, x, y, rows, cols) => {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const row = (x + i + rows) % rows;
          const col = (y + j + cols) % cols;
          count += grid[row][col];
        }
      }
      return count;
    };

    const updateGrid = () => {
      if (rows === 0 || cols === 0) return;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const neighbors = countNeighbors(grid, i, j, rows, cols);
          const state = grid[i][j];

          // Game of Life rules
          if (state === 0 && neighbors === 3) {
            nextGrid[i][j] = 1; // Birth
          } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
            nextGrid[i][j] = 0; // Death
          } else {
            nextGrid[i][j] = state; // Survive
          }
        }
      }

      // Swap grids
      const temp = grid;
      grid = nextGrid;
      nextGrid = temp;
    };

    const drawRoundedRect = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const draw = () => {
      // Clear canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw cells
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j] === 1) {
            const x = j * gridSize + (gridSize - cellSize) / 2;
            const y = i * gridSize + (gridSize - cellSize) / 2;

            // Draw rounded square with 10% opacity
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            drawRoundedRect(x, y, cellSize, cellSize, cornerRadius);
            ctx.fill();
          }
        }
      }
    };

    const UPDATE_INTERVAL = 1200;
    let updateIntervalId;

    const startAnimation = () => {
      if (shouldReduceMotion || updateIntervalId) return;
      updateIntervalId = window.setInterval(() => {
        if (document.hidden) return;
        if (rows > 0 && cols > 0) {
          updateGrid();
          draw();
        }
      }, UPDATE_INTERVAL);
    };

    const stopAnimation = () => {
      if (updateIntervalId) {
        window.clearInterval(updateIntervalId);
        updateIntervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
        return;
      }
      startAnimation();
    };

    if (rows > 0 && cols > 0) {
      draw();
    }
    startAnimation();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      stopAnimation();
      window.removeEventListener('resize', scheduleResize);
      sizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="grid-background" />;
};

export default GridBackground;
