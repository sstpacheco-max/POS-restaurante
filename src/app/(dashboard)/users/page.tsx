"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Shield, UserCog, UserCheck, Trash2, Edit2, Fingerprint, Lock, X } from "lucide-react";

type Role = "Admin" | "Cajero" | "Mesero";

const INITIAL_USERS = [
  { id: 1, name: "Carlos López", email: "carlos@pospro.com", role: "Admin", status: "Activo", lastLogin: "Hace 2 horas", password: "123", biometricEnabled: true },
  { id: 2, name: "Ana Gómez", email: "ana@pospro.com", role: "Cajero", status: "Activo", lastLogin: "Hace 5 mins", password: "123", biometricEnabled: false },
];

const ROLE_BADGES: Record<Role, { icon: any, color: string, bg: string }> = {
  "Admin": { icon: Shield, color: "text-purple-700", bg: "bg-purple-100" },
  "Cajero": { icon: UserCog, color: "text-blue-700", bg: "bg-blue-100" },
  "Mesero": { icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-100" },
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({ status: "Activo", role: "Cajero", biometricEnabled: false });

  useEffect(() => {
    const storedUsers = localStorage.getItem("punto_pos_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem("punto_pos_users", JSON.stringify(INITIAL_USERS));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("punto_pos_users", JSON.stringify(users));
    }
  }, [users, isLoaded]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({ status: "Activo", role: "Cajero", biometricEnabled: false, password: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: any) => {
    setFormData({ ...user });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Por favor completa el nombre, email y contraseña.");
      return;
    }

    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { ...formData, id: Date.now(), lastLogin: "Nunca" }]);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios y Roles</h1>
          <p className="text-slate-500 mt-1">Controla el acceso del personal mediante roles y biometría.</p>
        </div>
        
        <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/30">
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats/Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
               <span>Total Usuarios: {users.length}</span>
            </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol en el Sistema</th>
                <th className="px-6 py-4">Acceso</th>
                <th className="px-6 py-4">Último Acceso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const badge = ROLE_BADGES[(user.role as Role) || "Cajero"];
                const Icon = badge?.icon || UserCog;
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 relative overflow-hidden group border border-slate-300">
                          {user.name.charAt(0).toUpperCase()}
                          {user.biometricEnabled && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Fingerprint size={16} className="text-primary drop-shadow" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${badge?.bg} ${badge?.color}`}>
                        <Icon size={14} />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.status === 'Activo' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${user.status === 'Activo' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {user.status}
                        </span>
                        {user.biometricEnabled && (
                          <span className="flex items-center gap-1 text-[10px] text-primary/80 font-bold ml-3.5 uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                            <Fingerprint size={10} /> Biometría
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10 mr-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
             <div className="text-center py-12 text-slate-500">
               <Users size={48} className="mx-auto mb-4 opacity-50" />
               <p>No se encontraron usuarios.</p>
             </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.name || ""}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (Para Login)</label>
                  <input 
                    type="email" 
                    value={formData.email || ""}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select 
                    value={formData.role || "Cajero"}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
                  >
                    <option value="Admin">Administrador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Mesero">Mesero</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select 
                    value={formData.status || "Activo"}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Lock size={14} className="text-slate-400" />
                      Contraseña / PIN de Acceso
                    </label>
                    <input 
                      type="text" 
                      value={formData.password || ""}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary bg-slate-50"
                      placeholder="****"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Este será el código que usará para ingresar al sistema localmente.</p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.biometricEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                        <Fingerprint size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">Lector Biométrico</p>
                        <p className="text-xs text-slate-500">Permitir ingreso con huella digital</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!formData.biometricEnabled) {
                          // Simulate biometric scan
                          alert("Coloque el dedo en el lector biométrico ahora...");
                          setTimeout(() => {
                             alert("✅ Huella registrada exitosamente.");
                             setFormData({...formData, biometricEnabled: true});
                          }, 1000);
                        } else {
                          if (confirm("¿Desvincular huella de este usuario?")) {
                             setFormData({...formData, biometricEnabled: false});
                          }
                        }
                      }}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formData.biometricEnabled ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-primary text-white hover:bg-primary/90'}`}
                    >
                      {formData.biometricEnabled ? 'Desvincular' : 'Registrar Huella'}
                    </button>
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 shadow-md transition-colors">Guardar Usuario</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
