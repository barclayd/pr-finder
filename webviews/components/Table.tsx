import './table.css';

interface TableProps<T> {
  records: T[];
  onRecordClick: (record: T) => void;
}

export const Table = <T extends object>({
  records,
  onRecordClick,
}: TableProps<T>) => {
  return (
    <table className="content-table">
      <thead>
        <tr>
          {Object.keys(records[0]).map((column, index) => (
            <th key={column + index}>{column !== 'track' ? column : '✓'}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr
            key={record.toString() + index}
          >
            {Object.values(record).map((data, index) => (
              <td key={record.toString() + index} onClick={() => {
                if (index === Object.values(record).length-1) {
                  return;
                }
                onRecordClick(record)
              }}>{data}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
