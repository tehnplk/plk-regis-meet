'use client';

import { useEffect, useState } from 'react';
import { Header } from '../../_components/event-ui';
import { getJWTToken } from '@/lib/auth';
import Swal from 'sweetalert2';

interface LoginLogSummary {
  providerId: string;
  fullname: string;
  organization: any;
  lastLogin: string;
  loginCount: number;
}

export default function AdminApprovePage() {
  const [logs, setLogs] = useState<LoginLogSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const askPasswordAndLoad = async () => {
      try {
        const result = await Swal.fire({
          title: 'กรอกรหัสผ่าน',
          input: 'password',
          inputLabel: 'รหัสผ่านสำหรับเข้าหน้าจัดการผู้ใช้',
          inputPlaceholder: 'กรอกรหัสผ่าน',
          inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off',
          },
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
        });

        if (!result.isConfirmed) {
          setError('ยกเลิกการเข้าหน้าจัดการผู้ใช้');
          return;
        }

        const value = (result.value ?? '').trim();
        if (value !== '112233') {
          await Swal.fire({
            icon: 'error',
            title: 'รหัสผ่านไม่ถูกต้อง',
            text: 'กรุณาลองใหม่อีกครั้ง',
          });
          setError('รหัสผ่านไม่ถูกต้อง');
          return;
        }

        setLoading(true);
        const token = await getJWTToken();
        if (!token) {
          throw new Error('Missing JWT token');
        }
        const res = await fetch('/api/admin/approve', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load login logs');
        }
        const data = await res.json();
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('ไม่สามารถโหลดประวัติการเข้าสู่ระบบได้');
      } finally {
        setLoading(false);
      }
    };

    askPasswordAndLoad();
  }, []);

  const renderOrganization = (org: any) => {
    const list = Array.isArray(org) ? org : [];
    if (!list.length) return '-';
    const primary = list[0];
    const hcode = primary?.hcode ?? '';
    const hname = primary?.hname_th ?? '';
    const text = `${hcode ? hcode + ' ' : ''}${hname}`.trim();
    if (!text) return '-';
    if (list.length > 1) {
      return `${text} (+${list.length - 1})`;
    }
    return text;
  };

  const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายการผู้ใช้ที่เข้าสู่ระบบ (LoginLog)</h2>
          <p className="text-gray-600 text-sm mt-1">
            แสดงข้อมูลจากตาราง LoginLog แบบไม่ซ้ำตาม providerId, fullname, organization
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {loading && <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Provider ID</th>
                    <th className="px-3 py-2">ชื่อ-สกุล</th>
                    <th className="px-3 py-2">หน่วยงาน</th>
                    <th className="px-3 py-2">จำนวนครั้งที่เข้าใช้</th>
                    <th className="px-3 py-2">เข้าสู่ระบบล่าสุด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, index) => (
                    <tr key={`${log.providerId}-${index}`} className="hover:bg-blue-50/40">
                      <td className="px-3 py-2 align-top whitespace-nowrap">{index + 1}</td>
                      <td className="px-3 py-2 align-top font-mono text-xs whitespace-nowrap">{log.providerId}</td>
                      <td className="px-3 py-2 align-top">{log.fullname}</td>
                      <td className="px-3 py-2 align-top">{renderOrganization(log.organization)}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{log.loginCount}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{formatDateTime(log.lastLogin)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-gray-500 text-sm"
                      >
                        ไม่พบข้อมูล LoginLog
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
