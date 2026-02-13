import React from 'react';
import { Image } from 'astro:assets';


interface Data {
  _id: string;
  nama: string;
  bidang: string;
  tahun: string;
  cakupan: string;
  url: string;
}

interface Props {
  companyData: Data[];
}

export default function CompanyTables({ companyData }: Props) {
  return (
    <>
      {companyData.map((dataCompany, index) => (
        <div id={dataCompany._id} className="flex flex-col md:flex-row gap-12 items-start mb-15">
          <div className="md:w-1/3">
            <div className="relative h-[300px] group overflow-hidden rounded-2xl shadow-lg">
              <img src={dataCompany.url} alt={dataCompany.nama} class="w-full h-full object-fit" width={1200} height={800} loading="lazy" decoding="async" />
            </div>
          </div>
          <div class="md:w-2/3 w-full">
            <div key={index} className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <tbody>
                  <tr className='bg-white'>
                    <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                      Nama Perusahaan
                    </td>
                    <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                      {dataCompany.nama}
                    </td>
                  </tr>
                  <tr className='bg-slate-50'>
                    <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                      Bidang Usaha
                    </td>
                    <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                      {dataCompany.bidang}
                    </td>
                  </tr>
                  <tr className='bg-white'>
                    <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                      Tahun Berdiri
                    </td>
                    <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                      {dataCompany.tahun}
                    </td>
                  </tr>
                  <tr className='bg-slate-50'>
                    <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                      Cakupan Layanan
                    </td>
                    <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                      {dataCompany.cakupan}
                    </td>
                  </tr>
                  <tr className='bg-white'>
                    <td className="px-6 py-4 font-bold text-slate-700 w-1/3 border-b border-slate-100 italic">
                      Website
                    </td>
                    <td className="px-6 py-4 text-slate-600 border-b border-slate-100">
                      <a href={dataCompany.web} target="_blank" rel="noopener noreferrer">
                        {dataCompany.web}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}