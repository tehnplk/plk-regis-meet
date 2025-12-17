'use client';

import { useEffect, useState } from 'react';
import { Header } from '../_components/event-ui';
import { getJWTToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';

interface TableSummary {
  name: string;
  count: number;
}

export default function DatabasePage() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<any[] | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<number | null>(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const token = await getJWTToken();
        if (!token) {
          throw new Error('Missing JWT token');
        }
        const res = await fetch(getApiUrl('/api/database'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load tables');
        }
        const data = await res.json();
        setTables(data.tables ?? []);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('ไม่สามารถโหลดรายการตารางได้');
      } finally {
        setLoadingTables(false);
      }
    };

    loadTables();
  }, []);

  const handleView = async (tableName: string) => {
    setSelectedTable(tableName);
    setRows(null);
    setRowsError(null);
    setLoadingRows(true);

    try {
      const token = await getJWTToken();
      if (!token) {
        throw new Error('Missing JWT token');
      }
      const res = await fetch(getApiUrl(`/api/database/${encodeURIComponent(tableName)}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setRowsError('ไม่พบตารางที่เลือก');
        } else {
          setRowsError('ไม่สามารถโหลดข้อมูลตารางได้');
        }
        setRows([]);
        return;
      }
      const data = await res.json();
      setRows(data.rows ?? []);
      setLimitInfo(typeof data.limit === 'number' ? data.limit : null);
    } catch (e) {
      console.error(e);
      setRowsError('ไม่สามารถโหลดข้อมูลตารางได้');
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  const renderRowsTable = () => {
    if (!selectedTable) return null;

    let content;

    if (loadingRows) {
      content = (
        <p className="text-sm text-gray-600">
          กำลังโหลดข้อมูลจากตาราง {selectedTable}...
        </p>
      );
    } else if (rowsError) {
      content = <p className="text-sm text-red-600">{rowsError}</p>;
    } else if (!rows || rows.length === 0) {
      content = <p className="text-sm text-gray-500">ไม่พบข้อมูลในตารางนี้</p>;
    } else {
      const columns = Object.keys(rows[0]);
      content = (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-700 font-medium">
            SELECT * FROM {selectedTable} (สูงสุด {limitInfo ?? 200} แถว)
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40">
                    {columns.map((col) => {
                      const value = row[col];
                      const isPrimitive =
                        value === null ||
                        ['string', 'number', 'boolean'].includes(typeof value);

                      return (
                        <td key={col} className="px-3 py-2 align-top">
                          <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
                            {isPrimitive ? String(value ?? '') : JSON.stringify(value)}
                          </pre>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-stretch md:items-center justify-center">
        <div className="bg-white w-full h-full md:h-[90vh] md:w-[90vw] rounded-none md:rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Table</p>
              <p className="text-sm font-semibold text-gray-900">{selectedTable}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTable(null);
                setRows(null);
                setRowsError(null);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              ปิด
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายการตารางข้อมูล</h2>
          <p className="text-gray-600 text-sm mt-1">เลือกตารางแล้วกด View เพื่อเปิดดูข้อมูลแบบเต็มจอ</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {loadingTables && <p className="text-sm text-gray-600">กำลังโหลดรายการตาราง...</p>}
          {!loadingTables && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!loadingTables && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-3 py-2 text-center w-14">ลำดับ</th>
                    <th className="px-3 py-2">ชื่อตาราง</th>
                    <th className="px-3 py-2 w-28">จำนวนแถว</th>
                    <th className="px-3 py-2 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tables.map((t, index) => (
                    <tr key={t.name} className="hover:bg-blue-50/40">
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.name}</td>
                      <td className="px-3 py-2">{t.count}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleView(t.name)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tables.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-500 text-sm">
                        ไม่พบตารางในฐานข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ข้อมูลตาราง</h3>
          <p className="text-sm text-gray-500">เลือกตารางจากด้านบนแล้วกดปุ่ม view เพื่อดูข้อมูล</p>
        </div>

        {renderRowsTable()}
      </main>
    </div>
  );
}
