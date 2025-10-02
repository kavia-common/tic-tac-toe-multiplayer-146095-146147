import { component$, $, useSignal, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/**
 * Utility: Determine winner and winning line indexes
 */
const winningTriples: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// PUBLIC_INTERFACE
export default component$(() => {
  // Board state: 'X' | 'O' | null per square
  const board = useSignal<Array<"X" | "O" | null>>(
    Array.from({ length: 9 }, () => null),
  );
  const xIsNext = useSignal(true);
  const winner = useSignal<"X" | "O" | null>(null);
  const winningLine = useSignal<number[] | null>(null);
  const isTie = useSignal(false);

  // Check win/tie after any board change
  useTask$(({ track }) => {
    track(() => board.value);
    const [w, line] = calculateWinner(board.value);
    winner.value = w;
    winningLine.value = line;
    isTie.value = !w && board.value.every((s) => s !== null);
  });

  // PUBLIC_INTERFACE
  const handleCellClick = $((idx: number) => {
    if (board.value[idx] !== null) return;
    if (winner.value) return;

    const next = [...board.value];
    next[idx] = xIsNext.value ? "X" : "O";
    board.value = next;
    xIsNext.value = !xIsNext.value;
  });

  // PUBLIC_INTERFACE
  const resetGame = $(() => {
    board.value = Array.from({ length: 9 }, () => null);
    xIsNext.value = true;
    winner.value = null;
    winningLine.value = null;
    isTie.value = false;
  });

  const statusLabel = (() => {
    if (winner.value) {
      return `${winner.value} wins`;
    }
    if (isTie.value) {
      return "It's a tie";
    }
    return `${xIsNext.value ? "X" : "O"} to play`;
  })();

  const statusPillClass =
    winner.value
      ? "pill " + (winner.value === "X" ? "blue" : "amber")
      : "pill " + (xIsNext.value ? "blue" : "amber");

  return (
    <div class="container" style="padding-top: 1.25rem; padding-bottom: 2rem;">
      {/* Header */}
      <header class="header card">
        <h1 class="title">
          <span
            style="
              display:inline-grid;place-items:center;
              width:32px;height:32px;border-radius:8px;
              background: linear-gradient(180deg, rgba(37,99,235,.16), rgba(245,158,11,.16));
              border:1px solid rgba(17,24,39,.08);
              box-shadow: var(--op-shadow-sm);
              color: var(--op-primary);
              font-weight:900;
            "
            aria-hidden="true"
          >
            XO
          </span>
          Tic Tac Toe
          <span class="title-badge">Ocean Professional</span>
        </h1>
        <div class="actions">
          <span aria-live="polite" class={statusPillClass}>
            {winner.value ? "Winner" : isTie.value ? "Status" : "Turn"}:{" "}
            <strong>{statusLabel}</strong>
          </span>
          <button type="button" class="btn btn-ghost" onClick$={resetGame}>
            Reset
          </button>
        </div>
      </header>

      {/* Status card */}
      <section class="status-card card" style="margin-top: 1rem;">
        <div class="status-row">
          <div class="subtle">
            Current player:
            <span class={xIsNext.value ? "pill blue" : "pill amber"} style="margin-left:.5rem;">
              {xIsNext.value ? "X (Blue)" : "O (Amber)"}
            </span>
          </div>
          <div class="subtle">
            Result:
            <span class="pill" style="margin-left:.5rem;">
              {winner.value
                ? `${winner.value} wins`
                : isTie.value
                ? "Tie"
                : "In progress"}
            </span>
          </div>
        </div>
      </section>

      {/* Game board */}
      <section class="board-wrapper">
        <div class="board" role="grid" aria-label="Tic Tac Toe board">
          {board.value.map((val, idx) => {
            const isDisabled = !!winner.value || isTie.value || val !== null;
            const isWinCell =
              !!winningLine.value && winningLine.value.includes(idx);
            const classes = [
              "cell",
              val === "X" ? "x" : "",
              val === "O" ? "o" : "",
              isDisabled ? "disabled" : "",
              isWinCell ? "win" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const aria = val
              ? `Cell ${idx + 1} contains ${val}`
              : `Cell ${idx + 1} empty`;

            return (
              <button
                key={idx}
                type="button"
                role="gridcell"
                aria-label={aria}
                class={classes}
                disabled={isDisabled && val !== null}
                onClick$={() => handleCellClick(idx)}
              >
                {val ?? ""}
              </button>
            );
          })}
        </div>

        {/* Footer actions / legend */}
        <div class="footer-actions">
          <div class="legend">
            <span class="pill blue">X</span>
            <span class="subtle">Blue</span>
            <span class="pill amber" style="margin-left:.5rem;">O</span>
            <span class="subtle">Amber</span>
          </div>
          <div class="actions">
            <button type="button" class="btn btn-primary" onClick$={resetGame}>
              New Game
            </button>
          </div>
        </div>
      </section>
    </div>
  );
});

/**
 * PUBLIC_INTERFACE
 * Calculate winner on a 3x3 board
 * @param squares Array of 9 cells containing "X" | "O" | null
 * @returns [winner, winningLine] where winner is "X" | "O" | null and winningLine is array of cell indexes or null
 */
export function calculateWinner(
  squares: Array<"X" | "O" | null>,
): ["X" | "O" | null, number[] | null] {
  for (const line of winningTriples) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], line];
    }
  }
  return [null, null];
}

export const head: DocumentHead = {
  title: "Tic Tac Toe - Ocean Professional",
  meta: [
    {
      name: "description",
      content:
        "Play a clean, modern Tic Tac Toe with blue & amber accents. Multiplayer (local), win/tie detection, and reset functionality.",
    },
    {
      name: "theme-color",
      content: "#2563EB",
    },
  ],
  links: [
    {
      rel: "icon",
      href: "/favicon.svg",
    },
  ],
};
