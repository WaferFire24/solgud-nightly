import * as Label from '@radix-ui/react-label';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, User, Building2, Briefcase } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function RFQForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 1. Ambil data checkbox 'services' sebagai array
    const selectedServices = formData.getAll('services');

    // 2. Susun payload sesuai Field Key di Directus
    const payload = {
      firstName: formData.get('firstName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      industry: formData.get('industry'),
      services: selectedServices,
      details: formData.get('details'),
      status: 'published'
    };

    try {
      // 3. Menggunakan API Proxy Internal (Lebih Aman)
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Gagal mengirim data');
      }

      toast.success('Permintaan Terkirim!', {
        description: 'Terima kasih. Tim kami akan menghubungi Anda segera.',
      });
      form.reset();
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error('Gagal Mengirim', {
        description: error.message || 'Terjadi gangguan pada server email kantor.',
      });
    }
  };

  return (
    <form className="space-y-6" id="rfq-form" onSubmit={handleSubmit}>
      <Toaster position="top-center" richColors />

      {/* Bagian Form tetap sama sesuai struktur */}
      <div>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Informasi Kontak</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label.Root htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Anda <span className="text-red-500">*</span>
            </Label.Root>
            <input type="text" id="firstName" name="firstName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <Label.Root htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Email <span className="text-red-500">*</span>
            </Label.Root>
            <input type="email" id="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <Label.Root htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telpon <span className="text-red-500">*</span>
            </Label.Root>
            <input type="tel" id="phone" name="phone" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mr-3">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Informasi Perusahaan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label.Root htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Perusahaan <span className="text-red-500">*</span>
            </Label.Root>
            <input type="text" id="company" name="company" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <Label.Root htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Bidang Usaha <span className="text-red-500">*</span>
            </Label.Root>
            <select id="industry" name="industry" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition">
              <option value="">Select an industry</option>
              <option value="ecommerce">E-Commerce & Retail</option>
              <option value="healthcare">Healthcare & Pharmaceuticals</option>
              <option value="automotive">Automotive & Manufacturing</option>
              <option value="technology">Technology & Electronics</option>
              <option value="consumer-goods">Consumer Goods</option>
              <option value="food-beverage">Food & Beverage</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mr-3">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Kebutuhan Solusi</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'storage-optimization', label: 'Storage Optimization' },
            { id: 'vertical-storage', label: 'Vertical Storage' },
            { id: 'automated-sorting', label: 'Automated Sorting' },
            { id: 'intelligent-transport', label: 'Intelligent Transport' },
            { id: 'ergonomic-handling', label: 'Ergonomic Handling' },
            { id: 'transport-handling', label: 'Transport Handling' },
          ].map((service) => (
            <div key={service.id} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
              <Checkbox.Root id={service.id} name="services" value={service.id} className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors">
                <Checkbox.Indicator><Check className="w-4 h-4 text-white" /></Checkbox.Indicator>
              </Checkbox.Root>
              <Label.Root htmlFor={service.id} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">{service.label}</Label.Root>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Label.Root htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
            Detail Project <span className="text-red-500">*</span>
          </Label.Root>
          <textarea id="details" name="details" rows={6} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" placeholder="Jelaskan kebutuhan Anda..." />
        </div>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2">
        <span>Kirim Request</span>
      </button>
    </form>
  );
}