import './table.css';
import { FC } from 'react';

interface TableProps<T> {
  records: T[];
  tableName?: string;
  checkbox?: boolean;
  onRecordClick: (record: T) => void;
}

export const Table = <T extends object>({
  records,
  onRecordClick,
  tableName,
  checkbox,
}: TableProps<T>) => {
  const TableHead: FC = () => {
    if (!tableName) {
      return (
        <>
          {Object.keys(records[0]).map((column, index) => (
            <th key={column + index}>{column !== 'track' ? column : '✓'}</th>
          ))}
        </>
      );
    }
    return (
      <>
        <th>{tableName}</th>
        <th>✓</th>
      </>
    );
  };

  return (
    <table className="content-table">
      <thead>
        <tr>
          <TableHead />
        </tr>
      </thead>
      <tbody className={checkbox ? 'checkbox': undefined}>
        {records.map((record, index) => (
          <tr key={record.toString() + index}>
            {Object.values(record).map((data, index) => (
              <td
                key={record.toString() + index}
                onClick={() => {
                  if (index === Object.values(record).length - 1) {
                    return;
                  }
                  onRecordClick(record);
                }}
              >
                {data}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
