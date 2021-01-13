import './table.css';
import { FC } from 'react';

interface TableProps<T> {
  records: T[];
  tableName?: string;
  checkbox?: boolean;
  isOpen: boolean;
  onRecordClick?: (record: T) => void;
  onCaretClick?: () => void;
}

interface CaretProps {
  isOpen: boolean;
  onCaretClick?: () => void;
}

const Caret: FC<CaretProps> = ({ isOpen, onCaretClick }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="caret-right"
    className={[
      'svg-inline--fa fa-caret-right fa-w-6',
      isOpen ? 'open' : 'closed',
    ].join(' ')}
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 192 512"
    onClick={onCaretClick}
  >
    <path
      fill="currentColor"
      d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
    ></path>
  </svg>
);

export const Table = <T extends object>({
  records,
  onRecordClick,
  tableName,
  isOpen = true,
  onCaretClick,
  checkbox,
}: TableProps<T>) => {
  const TableHead: FC = () => {
    if (!tableName) {
      return (
        <tr>
          {Object.keys(records[0]).map((column, index) => (
            <th key={column + index}>{column !== 'track' ? column : '✓'}</th>
          ))}
        </tr>
      );
    }
    return (
      <tr>
        <th>
          <Caret isOpen={isOpen} onCaretClick={onCaretClick} />
          {tableName}
        </th>
      </tr>
    );
  };

  const TableBody: FC = () => {
    if (!isOpen) {
      return <></>;
    }
    return (
      <tbody className={checkbox ? 'checkbox' : undefined}>
        {records.map((record, index) => (
          <tr key={record.toString() + index}>
            {Object.values(record).map((data, index) => (
              <td
                key={record.toString() + index}
                onClick={() => {
                  if (
                    index === Object.values(record).length - 1 ||
                    !onRecordClick
                  ) {
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
    );
  };

  return (
    <table
      className={[
        'content-table',
        Object.keys(records[0]).length === 1 ? 'single-column' : 'multi-column',
      ].join(' ')}
    >
      <thead>
        <TableHead />
      </thead>
      <TableBody />
    </table>
  );
};
