import React from 'react';

const companyData = [
  { label: "Nama Perusahaan", value: "PT Makitech Sistem Indonesia" },
  { label: "Bidang Usaha", value: "Warehouse Automation & System Integrator" },
  { label: "Tahun Berdiri", value: "2020" },
  { label: "Email Resmi", value: "info@solusigudang.id" },
  { label: "Nomor Telpon", value: "(+62)21-2851-8211 / (+62)811-1985-190 (WA)" },
  { label: "Alamat", value: "Kawasan Industri Jababeka Phase 5, Jl. Science Timur I Blok B3F No. 10, Sertajaya, Cikarang Timur, Bekasi, Jawa Barat" }
];

export default function CompanyTable() {
  return (
    <div className="overflow-hidden border border-slate-200 rounded-xl">
      <table className="w-full text-left">
        <tbody>
          {companyData.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                {item.label}
              </td>
              <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}