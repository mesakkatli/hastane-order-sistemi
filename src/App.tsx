import { useState, useEffect } from 'react';
import { supabase, type Patient, type Order, type Doctor } from './lib/supabase';
import { CircleUser as UserCircle, Users, ClipboardList, Plus, X, Check, Stethoscope, Activity } from 'lucide-react';

type UserRole = 'doctor' | 'nurse';

function App() {
  const [role, setRole] = useState<UserRole>('doctor');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const [newOrder, setNewOrder] = useState({
    ilaclar: '',
    serum: '',
    kontroller: '',
    notlar: ''
  });

  const [newPatient, setNewPatient] = useState({
    ad_soyad: '',
    oda_no: '',
    doktor_id: ''
  });

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadOrders(selectedPatient.id);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*, doctors(ad_soyad)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPatients(data);
    }
  };

  const loadDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('ad_soyad');

    if (!error && data) {
      setDoctors(data);
    }
  };

  const loadOrders = async (hastaId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, doctors(ad_soyad)')
      .eq('hasta_id', hastaId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const createOrder = async () => {
    if (!selectedPatient) return;

    const { error } = await supabase
      .from('orders')
      .insert([{
        hasta_id: selectedPatient.id,
        doktor_id: selectedPatient.doktor_id || doctors[0]?.id,
        ...newOrder
      }]);

    if (!error) {
      setNewOrder({ ilaclar: '', serum: '', kontroller: '', notlar: '' });
      setShowNewOrderForm(false);
      loadOrders(selectedPatient.id);
    }
  };

  const createPatient = async () => {
    const { error } = await supabase
      .from('patients')
      .insert([newPatient]);

    if (!error) {
      setNewPatient({ ad_soyad: '', oda_no: '', doktor_id: '' });
      setShowNewPatientForm(false);
      loadPatients();
    }
  };

  const toggleTaskCompletion = async (order: Order, taskKey: string) => {
    const currentTasks = order.tamamlanan_gorevler || [];
    const newTasks = currentTasks.includes(taskKey)
      ? currentTasks.filter(t => t !== taskKey)
      : [...currentTasks, taskKey];

    const { error } = await supabase
      .from('orders')
      .update({ tamamlanan_gorevler: newTasks })
      .eq('id', order.id);

    if (!error && selectedPatient) {
      loadOrders(selectedPatient.id);
    }
  };

  const isTaskCompleted = (order: Order, taskKey: string) => {
    return (order.tamamlanan_gorevler || []).includes(taskKey);
  };

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-800">Hastane Order Yönetim Sistemi</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-lg shadow-sm p-1">
                <button
                  onClick={() => setRole('doctor')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                    role === 'doctor'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Doktor
                </button>
                <button
                  onClick={() => setRole('nurse')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                    role === 'nurse'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Hemşire
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Hasta Listesi
            </h2>
            {role === 'doctor' && (
              <button
                onClick={() => setShowNewPatientForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Yeni Hasta Ekle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(patient => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-slate-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <UserCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{patient.ad_soyad}</h3>
                      <p className="text-sm text-slate-500">Oda: {patient.oda_no}</p>
                    </div>
                  </div>
                </div>
                {patient.doctors && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Dr. {patient.doctors.ad_soyad}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {showNewPatientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Yeni Hasta Ekle</h3>
                <button
                  onClick={() => setShowNewPatientForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={newPatient.ad_soyad}
                    onChange={(e) => setNewPatient({ ...newPatient, ad_soyad: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hasta adı ve soyadı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Oda Numarası
                  </label>
                  <input
                    type="text"
                    value={newPatient.oda_no}
                    onChange={(e) => setNewPatient({ ...newPatient, oda_no: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sorumlu Doktor
                  </label>
                  <select
                    value={newPatient.doktor_id}
                    onChange={(e) => setNewPatient({ ...newPatient, doktor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Doktor seçin</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.ad_soyad}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={createPatient}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Hasta Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Hasta Detay</h1>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Hasta listesine dön
              </button>
            </div>
          </div>
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setRole('doctor')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                role === 'doctor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doktor
            </button>
            <button
              onClick={() => setRole('nurse')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                role === 'nurse'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Hemşire
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <UserCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">{selectedPatient.ad_soyad}</h2>
                <p className="text-slate-600">Oda: {selectedPatient.oda_no}</p>
                {selectedPatient.doctors && (
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Stethoscope className="w-4 h-4" />
                    Dr. {selectedPatient.doctors.ad_soyad}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Order Listesi
          </h3>
          {role === 'doctor' && (
            <button
              onClick={() => setShowNewOrderForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Yeni Order Oluştur
            </button>
          )}
        </div>

        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleString('tr-TR')}
                  </p>
                  {order.doctors && (
                    <p className="text-sm text-slate-600 mt-1">
                      Dr. {order.doctors.ad_soyad}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {order.ilaclar && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 mb-1">İlaçlar</h4>
                        <p className={`text-slate-600 ${isTaskCompleted(order, 'ilaclar') ? 'line-through opacity-60' : ''}`}>
                          {order.ilaclar}
                        </p>
                      </div>
                      {role === 'nurse' && (
                        <button
                          onClick={() => toggleTaskCompletion(order, 'ilaclar')}
                          className={`ml-4 p-2 rounded-lg transition-all ${
                            isTaskCompleted(order, 'ilaclar')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {order.serum && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 mb-1">Serum</h4>
                        <p className={`text-slate-600 ${isTaskCompleted(order, 'serum') ? 'line-through opacity-60' : ''}`}>
                          {order.serum}
                        </p>
                      </div>
                      {role === 'nurse' && (
                        <button
                          onClick={() => toggleTaskCompletion(order, 'serum')}
                          className={`ml-4 p-2 rounded-lg transition-all ${
                            isTaskCompleted(order, 'serum')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {order.kontroller && (
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 mb-1">Kontroller</h4>
                        <p className={`text-slate-600 ${isTaskCompleted(order, 'kontroller') ? 'line-through opacity-60' : ''}`}>
                          {order.kontroller}
                        </p>
                      </div>
                      {role === 'nurse' && (
                        <button
                          onClick={() => toggleTaskCompletion(order, 'kontroller')}
                          className={`ml-4 p-2 rounded-lg transition-all ${
                            isTaskCompleted(order, 'kontroller')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {order.notlar && (
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h4 className="font-semibold text-slate-700 mb-1">Notlar</h4>
                    <p className="text-slate-600">{order.notlar}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
              <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Bu hasta için henüz order oluşturulmamış</p>
            </div>
          )}
        </div>
      </div>

      {showNewOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Yeni Order Oluştur</h3>
              <button
                onClick={() => setShowNewOrderForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  İlaçlar
                </label>
                <textarea
                  value={newOrder.ilaclar}
                  onChange={(e) => setNewOrder({ ...newOrder, ilaclar: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Örn: Parol 500mg, sabah 8:00, akşam 20:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Serum
                </label>
                <textarea
                  value={newOrder.serum}
                  onChange={(e) => setNewOrder({ ...newOrder, serum: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Örn: 100ml İzosel, 4 saatte bitecek şekilde"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kontroller
                </label>
                <textarea
                  value={newOrder.kontroller}
                  onChange={(e) => setNewOrder({ ...newOrder, kontroller: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Örn: Her 4 saatte tansiyon, ateş, nabız kontrolü"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ek Notlar
                </label>
                <textarea
                  value={newOrder.notlar}
                  onChange={(e) => setNewOrder({ ...newOrder, notlar: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Hemşire için özel talimatlar veya uyarılar..."
                />
              </div>
              <button
                onClick={createOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                Order Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
