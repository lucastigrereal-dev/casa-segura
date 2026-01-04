'use client';

import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column, index) => (
              <th
                key={index}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                Nenhum resultado encontrado
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-muted/50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-4 align-middle text-sm">
                    {column.cell
                      ? column.cell(row[column.accessor], row)
                      : (row[column.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
