import { CaretIcon } from './icons/CaretIcon';
import { SyncIcon } from './icons/SyncIcon';
import '../styles/table.css';

interface TableProps<T> {
  records?: T[];
  tableName?: JSX.Element;
  checkbox?: boolean;
  isOpen: boolean;
  onRecordClick?: (record: T) => void;
  onCaretClick?: () => void;
  onSyncClick?: () => void;
}

export const Table = <T extends object>({
  records,
  onRecordClick,
  tableName,
  isOpen = true,
  onCaretClick,
  onSyncClick,
  checkbox,
}: TableProps<T>) => {
  if (!records) {
    return <></>;
  }

  return (
    <table
      className={[
        'content-table',
        Object.keys(records[0]).length === 1 ? 'single-column' : 'multi-column',
      ].join(' ')}
    >
      <thead>
        {tableName ? (
          <tr>
            <th>
              <CaretIcon isOpen={isOpen} onCaretClick={onCaretClick} />
              {tableName}
              <SyncIcon onClick={onSyncClick} />
            </th>
          </tr>
        ) : (
          <tr>
            {Object.keys(records[0]).map((column, index) => (
              <th key={column + index}>{column !== 'track' ? column : '✓'}</th>
            ))}
          </tr>
        )}
      </thead>
      {isOpen ? (
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
      ) : null}
    </table>
  );
};
