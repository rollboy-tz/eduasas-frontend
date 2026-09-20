import React, { useState, useMemo } from 'react';

interface StudentRow {
  id: string;
  examNumber: string;
  studentName: string;
  hisabati: number;
  fizikia: number;
  kemia: number;
  [key: string]: string | number;
}

export default function GradeGridEditor() {
  const [data, setData] = useState<StudentRow[]>([
    { id: '1', examNumber: 'TZ0101-001', studentName: 'Juma Ally Hamisi', hisabati: 75, fizikia: 80, kemia: 68 },
    { id: '2', examNumber: 'TZ0101-002', studentName: 'Aisha Ramadhan Juma', hisabati: 82, fizikia: 90, kemia: 77 },
    { id: '3', examNumber: 'TZ0101-003', studentName: 'Baraka Selemani Kingazi', hisabati: 60, fizikia: 65, kemia: 70 },
  ]);

  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[index],
            [columnId]: isNaN(Number(value)) ? value : Number(value),
          };
        }
        return row;
      })
    );
  };

  const columns = useMemo(
    () => [
      { id: 'examNumber', header: 'Namba ya Mtihani' },
      { id: 'studentName', header: 'Jina la Mwanafunzi' },
      { id: 'hisabati', header: 'Hisabati' },
      { id: 'fizikia', header: 'Fizikia' },
      { id: 'kemia', header: 'Kemia' },
    ],
    []
  );

  const numericFields = useMemo(() => new Set(['hisabati', 'fizikia', 'kemia']), []);

  const handlePreviewAndGenerate = () => {
    console.log("Data za Darasa kwa ajili ya Canvas / PDF:", data);
    alert('Data zimesomwa kikamilifu! Angalia Console.');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Uingizaji Alama (TanStack Spreadsheet)</h2>
            <p className="text-sm text-slate-500">Badilisha alama moja kwa moja kwenye seli kwa mtindo mwepesi.</p>
          </div>
          <button
            onClick={handlePreviewAndGenerate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            Tengeneza Ripoti (Canvas Preview)
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-100 border-b border-slate-200 uppercase text-xs font-semibold text-slate-600">
              <tr>
                {columns.map((col) => (
                  <th key={col.id} className="p-3 border-r border-slate-200 last:border-none">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.map((row, rowIndex) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col) => (
                    <td key={col.id} className="p-none border-r border-slate-200 last:border-none">
                      <input
                        type={numericFields.has(col.id) ? 'number' : 'text'}
                        value={String(row[col.id])}
                        onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)}
                        className="w-full bg-transparent p-1 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}