import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<Row> {
  key: string;
  header: string;
  /** Render the cell; defaults to the row value at `key`. */
  cell?: (row: Row) => ReactNode;
  align?: "left" | "right";
  /** Visually emphasise the first column as the row header. */
  rowHeader?: boolean;
}

/**
 * Accessible data table. The caption names it, the scroll region is keyboard focusable so
 * narrow screens can scroll it, and the first column can act as the row header.
 */
export function DataTable<Row extends { id: string }>({
  caption,
  columns,
  rows,
  className,
}: {
  caption: string;
  columns: Array<Column<Row>>;
  rows: Row[];
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={cn("overflow-x-auto rounded-lg border border-mist bg-paper", className)}
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-base">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-snow">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "border-b border-mist px-4 py-3 font-semibold",
                  c.align === "right" && "text-right",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-mist last:border-0">
              {columns.map((c) => {
                const value = c.cell
                  ? c.cell(row)
                  : String((row as unknown as Record<string, unknown>)[c.key] ?? "");
                const cls = cn("px-4 py-3 align-top", c.align === "right" && "text-right");
                return c.rowHeader ? (
                  <th key={c.key} scope="row" className={cn(cls, "font-semibold")}>
                    {value}
                  </th>
                ) : (
                  <td key={c.key} className={cls}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
