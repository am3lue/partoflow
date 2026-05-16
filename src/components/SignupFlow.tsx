import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Users, Lock, ChevronRight, ChevronLeft, Plus, X, Globe, Map as MapIcon, Navigation, Search } from 'lucide-react';
import { Logo } from './Logo';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  age: string;
  id_number: string;
  health_facility_name: string;
  facility_type: string;
  location: { lat: number; lng: number } | null;
  physical_address: string;
  team_members: { name: string; role: string }[];
  password: string;
}

export interface SignupFlowProps {
  onComplete: (data: SignupData) => void;
  onBack: () => void;
  isDark?: boolean;
  key?: string | number;
  isLoading?: boolean;
}

function LocationMarker({ position, onPositionChange }: { position: { lat: number, lng: number } | null, onPositionChange: (pos: { lat: number, lng: number }) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={DefaultIcon} />
  );
}

export function SignupFlow({ onComplete, onBack, isDark, isLoading }: SignupFlowProps) {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    age: '',
    id_number: '',
    health_facility_name: '',
    facility_type: 'Dispensary',
    location: { lat: -6.7924, lng: 39.2083 }, // Default to Dar es Salaam
    physical_address: '',
    team_members: [],
    password: ''
  });

  useEffect(() => {
    // Only attempt IP location when entering facility step for the first time
    if (step === 2 && !formData.health_facility_name && isLocating === false) {
      detectLocation();
    }
  }, [step]);

  const detectLocation = async () => {
    setIsLocating(true);
    
    const setCoords = (lat: number, lng: number) => {
      setFormData(prev => ({
        ...prev,
        location: { lat, lng }
      }));
      setIsLocating(false);
    };

    try {
      // 1. Try Browser Geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => setCoords(position.coords.latitude, position.coords.longitude),
          async (err) => {
            console.warn("Browser geolocation failed, trying IP fallbacks...", err.message);
            // 2. IP Fallbacks
            const apis = [
              { url: 'https://ipapi.co/json/', lat: 'latitude', lng: 'longitude' },
              { url: 'https://geolocation-db.com/json/', lat: 'latitude', lng: 'longitude' },
              { url: 'https://freeipapi.com/api/json', lat: 'latitude', lng: 'longitude' }
            ];

            for (const api of apis) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                
                const res = await fetch(api.url, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (!res.ok) continue;
                const data = await res.json();
                
                const lat = data[api.lat];
                const lng = data[api.lng];
                
                if (lat && lng) {
                  setCoords(Number(lat), Number(lng));
                  return;
                }
              } catch (e) {
                console.warn(`Failed to fetch from ${api.url}:`, e);
              }
            }
            setIsLocating(false);
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      } else {
        setIsLocating(false);
      }
    } catch (err) {
      console.error("Location detection error", err);
      setIsLocating(false);
    }
  };

  const handleMapPositionChange = (pos: { lat: number, lng: number }) => {
    setFormData(prev => ({ ...prev, location: pos }));
    // Reverse geocoding with Nominatim if needed
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setFormData(prev => ({ ...prev, physical_address: data.display_name }));
        }
      })
      .catch(err => console.warn("Reverse geocode failed", err));
  };
  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team_members: [...formData.team_members, { name: '', role: 'Nurse' }]
    });
  };

  const removeMember = (index: number) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((_, i) => i !== index)
    });
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...formData.team_members];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, team_members: updated });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input isDark={isDark} label="First Name" value={formData.first_name} onChange={v => setFormData({...formData, first_name: v})} />
                <Input isDark={isDark} label="Middle Name" value={formData.middle_name} onChange={v => setFormData({...formData, middle_name: v})} />
                <Input isDark={isDark} label="Last Name" value={formData.last_name} onChange={v => setFormData({...formData, last_name: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input isDark={isDark} label="Age" type="number" value={formData.age} onChange={v => setFormData({...formData, age: v})} />
                <Input isDark={isDark} label="Staff ID / Govt ID" value={formData.id_number} onChange={v => setFormData({...formData, id_number: v})} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input isDark={isDark} label="Facility Name" value={formData.health_facility_name} onChange={v => setFormData({...formData, health_facility_name: v})} />
              <div>
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                <select 
                  className="w-full p-3 border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  style={{ 
                    backgroundColor: '#e4e4e4',
                    borderColor: isDark ? '#475569' : '#005b5c',
                    color: '#005b5c',
                    borderWidth: '1px'
                  }}
                  value={formData.facility_type}
                  onChange={e => setFormData({...formData, facility_type: e.target.value})}
                >
                  <option>Clinic</option>
                  <option>Dispensary</option>
                  <option>Health Center</option>
                  <option>Hospital</option>
                </select>
              </div>
            </div>
            <Input 
              isDark={isDark}
              label="Physical Address / Street / Near" 
              placeholder="Search or enter address..."
              value={formData.physical_address} 
              onChange={v => {
                setFormData({...formData, physical_address: v});
                // Debounced forward geocoding using Nominatim
                if (v.length > 5) {
                  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.length > 0) {
                        setFormData(prev => ({ 
                          ...prev, 
                          location: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } 
                        }));
                      }
                    })
                    .catch(e => console.warn("Geocode failed", e));
                }
              }} 
            />
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1.5 ml-1">
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest">Location on Map</label>
                <button 
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-pulse' : ''}`} />
                  {isLocating ? 'Locating...' : 'Detect Me'}
                </button>
              </div>
              <div className="h-48 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 relative z-0">
                <MapContainer 
                  center={formData.location || { lat: -6.7924, lng: 39.2083 }} 
                  zoom={13} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker 
                    position={formData.location} 
                    onPositionChange={(pos) => handleMapPositionChange({ lat: pos.lat, lng: pos.lng })} 
                  />
                </MapContainer>
              </div>
              <p className="text-[9px] text-slate-400 italic text-center">Tap map or search to set: {formData.location?.lat.toFixed(4)}, {formData.location?.lng.toFixed(4)}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Medical Staff Team</p>
              <button 
                onClick={addTeamMember}
                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {formData.team_members.map((member, i) => (
                <div key={i} className="flex gap-2 items-end p-3 rounded-xl border relative group transition-colors"
                  style={{ 
                    backgroundColor: '#e4e4e4',
                    borderColor: isDark ? '#475569' : '#005b5c',
                    borderWidth: '1px'
                  }}
                >
                  <div className="flex-1">
                    <label className="block text-[8px] font-black uppercase mb-1" style={{ color: '#005b5c' }}>Full Name</label>
                    <input 
                      className="w-full bg-transparent text-xs font-bold outline-none placeholder:text-[#005b5c]/50"
                      style={{ color: '#005b5c' }}
                      value={member.name}
                      onChange={e => updateMember(i, 'name', e.target.value)}
                      placeholder="e.g. Dr. Jane Doe"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase mb-1">Role</label>
                    <select 
                      className="w-full bg-transparent text-xs font-bold outline-none"
                      style={{ color: '#005b5c' }}
                      value={member.role}
                      onChange={e => updateMember(i, 'role', e.target.value)}
                    >
                      <option>Nurse</option>
                      <option>Midwife</option>
                      <option>MO</option>
                      <option>AMO</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => removeMember(i)}
                    className="absolute -top-2 -right-2 bg-white dark:bg-slate-600 p-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-500 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <X className="w-3 h-3 text-slate-400 dark:text-slate-200" />
                  </button>
                </div>
              ))}
              {formData.team_members.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
                  <p className="text-[9px] text-slate-300 dark:text-slate-600 font-black uppercase py-4">Add your support staff</p>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10 dark:border-primary/20 text-center space-y-2 transition-colors">
              <Lock className="w-8 h-8 text-primary mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-primary">Secure Access</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[200px] mx-auto italic">
                Set a strong password to protect sensitive patient records and clinical history.
              </p>
            </div>
            <Input isDark={isDark} label="Access Password" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-10 relative overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center mb-10">
        <Logo size="lg" className="mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Institutional Onboarding</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol v2.0.4</p>
      </div>

      <div className="flex justify-between items-center mb-8">
                <div className="flex gap-1.5">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <button onClick={onBack} disabled={isLoading} className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-700 disabled:opacity-30">Cancel</button>
      </div>

      <div className="mb-8">
        <h2 
          className="text-2xl font-black tracking-tight leading-none mb-2 transition-colors duration-300"
          style={{ color: '#005b5c' }}
        >
          {step === 1 && "Personal ID"}
          {step === 2 && "Clinical Facility"}
          {step === 3 && "Medical Team"}
          {step === 4 && "Final Security"}
        </h2>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Step 0{step} of 04</p>
      </div>

      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      <div className="mt-10 flex gap-3">
        {step > 1 && (
          <button 
            disabled={isLoading}
            onClick={prevStep}
            className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-100 dark:border-slate-600 shadow-sm disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <button 
          disabled={isLoading}
          onClick={step === 4 ? () => onComplete(formData) : nextStep}
          className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-teal hover:opacity-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 4 ? (
            isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </div>
            ) : "Complete Setup"
          ) : "Next Protocol"}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, isDark }: { label: string, type?: string, value: string, onChange: (v: string) => void, placeholder?: string, isDark?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full p-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
        style={{ 
          backgroundColor: '#e4e4e4',
          borderColor: isDark ? '#475569' : '#005b5c',
          color: '#005b5c',
          borderWidth: '1px'
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
