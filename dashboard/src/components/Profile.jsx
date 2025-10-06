import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Profile() {
  const [config, setConfig] = useState(null)
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/config')
      setConfig(response.data.data)
      setProfile(response.data.data.profile)
      setCategories(response.data.data.categories)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setLoading(false)
    }
  }

  const handleProfileChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    })
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.toLowerCase())) {
      setCategories([...categories, newCategory.toLowerCase()])
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (category) => {
    setCategories(categories.filter(c => c !== category))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Atualizar metas para incluir novas categorias
      const updatedGoals = { ...config.goals }
      categories.forEach(category => {
        if (!updatedGoals.byCategory[category]) {
          updatedGoals.byCategory[category] = 0
        }
      })

      // Remover categorias deletadas das metas
      Object.keys(updatedGoals.byCategory).forEach(category => {
        if (!categories.includes(category)) {
          delete updatedGoals.byCategory[category]
        }
      })

      const updatedConfig = {
        ...config,
        profile,
        categories,
        goals: updatedGoals
      }

      await axios.post('http://localhost:3000/api/config', updatedConfig)
      setConfig(updatedConfig)

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar configurações
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensagem de feedback */}
      {message && (
        <div className={`${
          message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        } border px-4 py-3 rounded`}>
          {message.text}
        </div>
      )}

      {/* Informações do Perfil */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Informações do Perfil</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renda Mensal (R$)
            </label>
            <input
              type="number"
              value={profile.monthlyIncome || 0}
              onChange={(e) => handleProfileChange('monthlyIncome', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Grupo do WhatsApp
            </label>
            <input
              type="text"
              value={profile.whatsappGroupName || ''}
              onChange={(e) => handleProfileChange('whatsappGroupName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Controle Financeiro"
            />
            <p className="mt-1 text-sm text-gray-500">
              O bot monitorará apenas mensagens deste grupo
            </p>
          </div>
        </div>
      </div>

      {/* Categorias Personalizadas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Categorias Personalizadas</h3>

        {/* Adicionar nova categoria */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nova categoria"
          />
          <button
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de categorias */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              <span className="capitalize">{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhuma categoria adicionada</p>
        )}
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${
            saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium py-2 px-6 rounded-lg transition duration-200`}
        >
          {saving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>

      {/* Informações sobre o Bot */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">🤖 Sobre o Bot</h4>
        <div className="text-sm text-purple-800 space-y-2">
          <p>
            <strong>Como usar:</strong> Envie mensagens no grupo do WhatsApp configurado com o formato:
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>"gastei 50 no almoço"</li>
            <li>"200 reais mercado"</li>
            <li>"uber 25"</li>
          </ul>
          <p className="mt-2">
            <strong>Comandos disponíveis:</strong>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>/saldo - Mostra total gasto no mês</li>
            <li>/categorias - Lista gastos por categoria</li>
            <li>/ajuda - Mostra ajuda</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
