import clsx from "clsx";
import { ReactNode } from "react";

type Align = "left" | "center" | "right";

export type TableColumn<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header: ReactNode;
  render?: (row: T, rowIndex: number) => ReactNode;
  align?: Align;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[];
  data: T[];
  caption?: ReactNode;
  emptyMessage?: ReactNode;
  isLoading?: boolean;
  getRowId?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
};

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const defaultEmptyMessage = "No records to display.";

function renderCellValue<T extends Record<string, unknown>>(
  row: T,
  column: TableColumn<T>,
) {
  const value = row[column.key as keyof T];

  if (value === undefined || value === null) return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value);
}

const StateRow = ({
  message,
  columnsLength,
}: {
  message: ReactNode;
  columnsLength: number;
}) => (
  <tr>
    <td
      colSpan={columnsLength}
      className="px-6 py-12 text-center text-sm text-gray-500"
    >
      {message}
    </td>
  </tr>
);

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  emptyMessage = defaultEmptyMessage,
  isLoading = false,
  getRowId,
  onRowClick,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const tableClassName = clsx(
    "w-full border-separate border-spacing-0 rounded-xl bg-white text-sm text-gray-900 shadow-sm",
    className,
  );

  const renderRows = () => {
    if (isLoading) {
      return (
        <StateRow
          columnsLength={columns.length}
          message="Loading data…"
        />
      );
    }

    if (!data.length) {
      return (
        <StateRow
          columnsLength={columns.length}
          message={emptyMessage}
        />
      );
    }

    return data.map((row, rowIndex) => {
      const key =
        getRowId?.(row, rowIndex) ??
        (row as { id?: string | number }).id ??
        rowIndex;

      const clickable = typeof onRowClick === "function";

      return (
        <tr
          key={key}
          onClick={() => onRowClick?.(row)}
          className={clsx(
            "border-b border-gray-100 last:border-b-0",
            clickable && "cursor-pointer transition-colors hover:bg-gray-50",
            rowClassName?.(row, rowIndex),
          )}
        >
          {columns.map((column) => (
            <td
              key={String(column.key)}
              className={clsx(
                "px-6 py-4 align-middle text-sm text-gray-700",
                alignClass[column.align ?? "left"],
                column.className,
              )}
            >
              {column.render
                ? column.render(row, rowIndex)
                : renderCellValue(row, column)}
            </td>
          ))}
        </tr>
      );
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className={tableClassName}>
        {caption ? (
          <caption className="px-6 py-4 text-left text-base font-semibold text-gray-900">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-tight text-gray-500">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={clsx(
                  "px-6 py-3 text-[0.75rem] font-semibold",
                  alignClass[column.align ?? "left"],
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
}


