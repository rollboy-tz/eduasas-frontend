import React, { useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef } from 'ag-grid-community';

// Sajili moduli za AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

// Muundo wa Data ya Mwanafunzi (Interface)
interface StudentRow {
  id: string;
  examNumber: string;
  studentName: string;
  hisabati: number;
  fizikia: number;
  kemia: number;
  biolojia: number;
  kiswahili: number;
  kiingereza: number;
  [key: string]: any; // Kuruhusu dynamic fields kama ikihitajika baadaye
}

export default function GradeGridEditor() {
  // 1. Tumia AgGridReact kwenye useRef na weka null sahihi
  const gridRef = useRef<AgGridReact<StudentRow>>(null);

  // 2. Fafanua ColumnDefs kwa kutumia ColDef<StudentRow> ili kuondoa makosa ya Type
  const [columnDefs] = useState<ColDef<StudentRow>[]>([
    { 
      field: 'examNumber', 
      headerName: 'Namba ya Mtihani', 
      editable: false, 
      pinned: 'left' as const,  
      width: 150 
    },
    { 
      field: 'studentName', 
      headerName: 'Jina la Mwanafunzi', 
      editable: false, 
      pinned: 'left' as const, 
      width: 200 
    },
    { field: 'hisabati', headerName: 'Hisabati', editable: true, width: 110 },
    { field: 'fizikia', headerName: 'Fizikia', editable: true, width: 110 },
    { field: 'kemia', headerName: 'Kemia', editable: true, width: 110 },
    { field: 'biolojia', headerName: 'Biolojia', editable: true, width: 110 },
    { field: 'kiswahili', headerName: 'Kiswahili', editable: true, width: 120 },
    { field: 'kiingereza', headerName: 'Kiingereza', editable: true, width: 120 },
  ]);

  // 3. Data za Wanafunzi
  const [rowData] = useState<StudentRow[]>([
    { id: '1', examNumber: 'TZ0101-001', studentName: 'Juma Ally Hamisi', hisabati: 75, fizikia: 80, kemia: 68, biolojia: 85, kiswahili: 90, kiingereza: 78 },
    { id: '2', examNumber: 'TZ0101-002', studentName: 'Aisha Ramadhan Juma', hisabati: 82, fizikia: 90, kemia: 77, biolojia: 88, kiswahili: 95, kiingereza: 85 },
    { id: '3', examNumber: 'TZ0101-003', studentName: 'Baraka Selemani Kingazi', hisabati: 60, fizikia: 65, kemia: 70, biolojia: 62, kiswahili: 70, kiingereza: 64 },
  ]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // 4. Kazi ya kuchota data bila makosa ya TypeScript (`?.` na aina ya node)
  const handlePreviewAndGenerate = () => {
    if (!gridRef.current || !gridRef.current.api) return;

    const allRowsData: StudentRow[] = [];
    
    gridRef.current.api.forEachNode((node) => {
      if (node.data) {
        allRowsData.push(node.data);
      }
    });

    console.log("Data za Darasa kwa ajili ya Canvas / PDF:", allRowsData);
    alert('Data zimesomwa kikamilifu! Angalia Console.');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Uingizaji Alama wa Darasa (Spreadsheet View)</h2>
            <p className="text-sm text-slate-500">Badilisha alama moja kwa moja kwenye seli kwa urahisi.</p>
          </div>
          <button
            onClick={handlePreviewAndGenerate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            Tengeneza Ripoti (Canvas Preview)
          </button>
        </div>

        <div className="ag-theme-alpine w-full h-[450px] rounded-lg overflow-hidden border border-slate-300">
          <AgGridReact<StudentRow>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            animateRows={true}
          />
        </div>

      </div>
    </div>
  );
}