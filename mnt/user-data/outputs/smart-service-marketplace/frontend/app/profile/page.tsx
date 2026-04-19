'use client';
import React, { useState } from 'react';
import { User, Mail, Phone, Lock, MapPin, Camera, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI, authAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/layout/Sidebar';
import { getInitials } from '@/lib/auth';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error }    = useNotification();
  const [saving, setSaving]   = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [activeTab, setActiveTab]   = useState<'profile' | 'password'>('profile');

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.location?.address || '',
    city:    user?.location?.city    || '',
    state:   user?.location?.state   || '',
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  const setF  = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPF = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => { setPassForm((p) => ({ ...p, [k]: e.target.value })); setPassErrors((p) => ({ ...p, [k]: '' })); };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({
        name:     form.name,
        phone:    form.phone,
        location: { address: form.address, city: form.city, state: form.state },
      });
      await refreshUser();
      success('Profile Updated', 'Your profile has been saved.');
    } catch (err) { error('Save Failed', (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (!passForm.currentPassword)                   errs.currentPassword = 'Required';
    if (!passForm.newPassword || passForm.newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    if (passForm.newPassword !== passForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPassErrors(errs); return; }

    setPassSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      success('Password Changed', 'Your password has been updated.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { error('Change Failed', (err as Error).message); }
    finally { setPassSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 p-6">
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-2">Profile & Settings</h1>
        <p className="text-[#9090A0] text-sm mb-8">Manage your account information.</p>

        <div className="max-w-2xl flex flex-col gap-6">
          {/* Avatar */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[rgba(212,175,55,0.3)]">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center text-[#0A0A0F] text-xl font-bold">{getInitials(user?.name || 'U')}</div>
                }
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#D4AF37] text-[#0A0A0F] rounded-full flex items-center justify-center hover:bg-[#F0D060] transition-colors shadow-lg">
                <Camera size={13} />
              </button>
            </div>
            <div>
              <p className="text-[#F5F5F5] font-semibold text-lg">{user?.name}</p>
              <p className="text-[#9090A0] text-sm">{user?.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 bg-[rgba(212,175,55,0.1)] text-[#D4AF37] text-xs font-semibold rounded-full capitalize border border-[rgba(212,175,55,0.2)]">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-xl p-1">
            {(['profile', 'password'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border border-[rgba(212,175,55,0.2)]' : 'text-[#9090A0] hover:text-[#F5F5F5]'}`}>
                {t === 'profile' ? 'Personal Info' : 'Change Password'}
              </button>
            ))}
          </div>

          {activeTab === 'profile' ? (
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 flex flex-col gap-4">
              <Input label="Full Name"     value={form.name}    onChange={setF('name')}    icon={<User  size={16} />} required />
              <Input label="Phone Number"  value={form.phone}   onChange={setF('phone')}   icon={<Phone size={16} />} type="tel" />
              <Input label="City"          value={form.city}    onChange={setF('city')}    icon={<MapPin size={16} />} />
              <Input label="State"         value={form.state}   onChange={setF('state')}   icon={<MapPin size={16} />} />
              <Input label="Full Address"  value={form.address} onChange={setF('address')} icon={<MapPin size={16} />} />
              <Button variant="primary" size="md" loading={saving} onClick={handleSaveProfile} icon={<Save size={15} />}>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 flex flex-col gap-4">
              <Input label="Current Password" type="password" value={passForm.currentPassword} onChange={setPF('currentPassword')} error={passErrors.currentPassword} icon={<Lock size={16} />} />
              <Input label="New Password"     type="password" value={passForm.newPassword}     onChange={setPF('newPassword')}     error={passErrors.newPassword}     icon={<Lock size={16} />} hint="Min. 8 characters" />
              <Input label="Confirm Password" type="password" value={passForm.confirmPassword} onChange={setPF('confirmPassword')} error={passErrors.confirmPassword} icon={<Lock size={16} />} />
              <Button variant="primary" size="md" loading={passSaving} onClick={handleChangePassword} icon={<Lock size={15} />}>
                Update Password
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
