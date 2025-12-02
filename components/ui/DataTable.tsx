import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Align = "left" | "center" | "right"

export type TableColumn<T extends Record<string, unknown>> = {
  key: keyof T | string
  header: ReactNode
  render?: (row: T, rowIndex: number) => ReactNode
  align?: Align
  className?: string
  headerClassName?: string
}

export type DataTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[]
  data: T[]
  caption?: ReactNode
  emptyState?: ReactNode
  isLoading?: boolean
  getRowKey?: (row: T, index: number) => React.Key
  onRowClick?: (row: T) => void
  className?: string
  rowClassName?: (row: T, index: number) => string | undefined
}

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const defaultEmptyState = "No records to display."

const StateRow = ({
  message,
  colSpan,
}: {
  message: ReactNode
  colSpan: number
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-12 text-center text-sm text-gray-500"
    >
      {message}
    </td>
  </tr>
)

function renderFallbackValue<T extends Record<string, unknown>>(
  row: T,
  column: TableColumn<T>,
): ReactNode {
  const value = row[column.key as keyof T]

  if (value === undefined || value === null) return "—"
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === "boolean") return value ? "Yes" : "No"

  return value as ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  emptyState = defaultEmptyState,
  isLoading = false,
  getRowKey,
  onRowClick,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const colSpan = Math.max(columns.length, 1)
  const clickable = typeof onRowClick === "function"

  const rows = (() => {
    if (isLoading) {
      return <StateRow colSpan={colSpan} message="Loading data…" />
    }

    if (!data.length) {
      return <StateRow colSpan={colSpan} message={emptyState} />
    }

    return data.map((row, rowIndex) => {
      const key =
        getRowKey?.(row, rowIndex) ??
        (row as { id?: React.Key }).id ??
        rowIndex

      return (
        <tr
          key={key}
          onClick={() => onRowClick?.(row)}
          className={cn(
            "border-b border-gray-100 last:border-b-0",
            clickable && "cursor-pointer transition-colors hover:bg-gray-50",
            rowClassName?.(row, rowIndex),
          )}
        >
          {columns.map((column) => (
            <td
              key={String(column.key)}
              className={cn(
                "px-6 py-4 align-middle text-sm text-gray-700",
                alignClass[column.align ?? "left"],
                column.className,
              )}
            >
              {column.render
                ? column.render(row, rowIndex)
                : renderFallbackValue(row, column)}
            </td>
          ))}
        </tr>
      )
    })
  })()

  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-separate border-spacing-0 rounded-xl bg-card text-sm text-gray-900 shadow-sm",
          className,
        )}
      >
        {caption ? (
          <caption className="px-6 py-4 text-left text-base font-semibold text-gray-900">
            {caption}
          </caption>
        ) : null}

        {columns.length ? (
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-tight text-gray-500">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn(
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
        ) : null}

        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export default DataTable
