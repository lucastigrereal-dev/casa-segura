'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Avatar, Modal, Loading } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { addressesApi, api } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Briefcase,
  Check,
  LogOut,
} from 'lucide-react';

interface Address {
  id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
  zip_code: string;
  is_default: boolean;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, token, refreshUser, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  const [addressData, setAddressData] = useState({
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'RS',
    zip_code: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone,
      });
    }
  }, [user]);

  useEffect(() => {
    async function loadAddresses() {
      if (!token) return;
      try {
        const data = await addressesApi.list(token) as Address[];
        setAddresses(data);
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    }

    if (isAuthenticated && token) {
      loadAddresses();
    }
  }, [isAuthenticated, token]);

  const handleSaveProfile = async () => {
    if (!token) return;
    setIsSaving(true);

    try {
      await api.patch('/users/profile', profileData, { token });
      await refreshUser();
      setIsEditingProfile(false);
      toast.success('Perfil atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressData({
        label: address.label || '',
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state || 'RS',
        zip_code: address.zip_code,
      });
    } else {
      setEditingAddress(null);
      setAddressData({
        label: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: 'RS',
        zip_code: '',
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!token) return;
    setIsSaving(true);

    try {
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, addressData, token);
        toast.success('Endereco atualizado');
      } else {
        await addressesApi.create(addressData, token);
        toast.success('Endereco adicionado');
      }

      const data = await addressesApi.list(token) as Address[];
      setAddresses(data);
      setIsAddressModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar endereco');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!token || !confirm('Deseja realmente excluir este endereco?')) return;

    try {
      await addressesApi.delete(id, token);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success('Endereco excluido');
    } catch (error) {
      toast.error('Erro ao excluir endereco');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!token) return;

    try {
      await addressesApi.setDefault(id, token);
      const data = await addressesApi.list(token) as Address[];
      setAddresses(data);
      toast.success('Endereco padrao definido');
    } catch (error) {
      toast.error('Erro ao definir endereco padrao');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

      {/* Profile Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar_url} name={user.name} size="xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                  user.role === 'PROFESSIONAL'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role === 'PROFESSIONAL' ? 'Profissional' : 'Cliente'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="(54) 99999-9999"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-5 w-5 text-gray-400" />
              <span>{user.phone}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Professional Info */}
      {user.professional && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Dados Profissionais</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Avaliacao</p>
                <p className="font-semibold">
                  {user.professional.rating_avg.toFixed(1)} / 5.0
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de servicos</p>
              <p className="font-semibold">{user.professional.total_jobs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nivel</p>
              <p className="font-semibold capitalize">{user.professional.level.toLowerCase()}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Become Professional CTA */}
      {user.role === 'CLIENT' && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Torne-se um profissional</h3>
              <p className="text-primary-100 mt-1">
                Ofereca seus servicos e ganhe dinheiro na plataforma
              </p>
            </div>
            <Button variant="secondary">
              <Briefcase className="h-4 w-4 mr-2" />
              Comecar
            </Button>
          </div>
        </Card>
      )}

      {/* Addresses */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Meus Enderecos</h3>
          </div>
          <Button size="sm" onClick={() => handleOpenAddressModal()}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {isLoadingAddresses ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum endereco cadastrado</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => handleOpenAddressModal()}
            >
              Adicionar endereco
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-xl border ${
                  address.is_default ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {address.label && (
                        <span className="font-medium text-gray-900">{address.label}</span>
                      )}
                      {address.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          Padrao
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p className="text-gray-400 text-sm">{address.zip_code}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Definir como padrao"
                      >
                        <Check className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenAddressModal(address)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Logout */}
      <Card className="p-6">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </Card>

      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? 'Editar Endereco' : 'Novo Endereco'}
      >
        <div className="space-y-4">
          <Input
            label="Apelido (opcional)"
            placeholder="Ex: Casa, Trabalho"
            value={addressData.label}
            onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
          />

          <Input
            label="CEP"
            placeholder="95000-000"
            value={addressData.zip_code}
            onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })}
          />

          <Input
            label="Rua"
            placeholder="Nome da rua"
            value={addressData.street}
            onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Numero"
              placeholder="123"
              value={addressData.number}
              onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
            />
            <Input
              label="Complemento"
              placeholder="Apto 101"
              value={addressData.complement}
              onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
            />
          </div>

          <Input
            label="Bairro"
            placeholder="Centro"
            value={addressData.neighborhood}
            onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade"
              placeholder="Caxias do Sul"
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
            />
            <Input
              label="Estado"
              placeholder="RS"
              value={addressData.state}
              onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveAddress} disabled={isSaving} className="flex-1">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsAddressModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
