interface TableProps<T> {
  records: T[];
  onRecordClick: (record: T) => void;
}

export const Table = <T extends object>({ records, onRecordClick }: TableProps<T>) => {
  return (
    <table className="content-table">
      <thead>
        <tr>
          {Object.keys(records[0]).map((column, index) => (
            <th key={column+index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={record.toString()+index} onClick={() => onRecordClick(record)}>
            {Object.values(record).map((data, index) => (
              <td key={record.toString()+index}>{data}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
