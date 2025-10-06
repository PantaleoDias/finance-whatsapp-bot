import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Goals() {
  const [config, setConfig] = useState(null)
  const [goals, setGoals] = useState(null)
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
      setGoals(response.data.data.goals)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setLoading(false)
    }
  }

  const handleTotalGoalChange = (value) => {
    setGoals({
      ...goals,
      totalMonthly: parseFloat(value) || 0
    })
  }

  const handleCategoryGoalChange = (category, value) => {
    setGoals({
      ...goals,
      byCategory: {
        ...goals.byCategory,
        [category]: parseFloat(value) || 0
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const updatedConfig = {
        ...config,
        goals
      }

      await axios.post('http://localhost:3000/api/config', updatedConfig)

      setMessage({ type: 'success', text: 'Metas atualizadas com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Erro ao salvar metas:', err)
      setMessage({ type: 'error', text: 'Erro ao salvar metas. Tente novamente.' })
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

  if (!goals) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar configurações
      </div>
    )
  }

  const getStatusColor = (spent, goal) => {
    if (goal === 0) return 'bg-gray-200'
    const percentage = (spent / goal) * 100
    if (percentage < 80) return 'bg-green-500'
    if (percentage < 100) return 'bg-yellow-500'
    return 'bg-red-500'
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

      {/* Meta Total Mensal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Meta de Gasto Total Mensal</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite mensal (R$)
            </label>
            <input
              type="number"
              value={goals.totalMonthly || 0}
              onChange={(e) => handleTotalGoalChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Metas por Categoria */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Metas por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.categories.map((category) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {category}
              </label>
              <input
                type="number"
                value={goals.byCategory[category] || 0}
                onChange={(e) => handleCategoryGoalChange(category, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          ))}
        </div>
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
          {saving ? 'Salvando...' : 'Salvar Metas'}
        </button>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dica</h4>
        <p className="text-sm text-blue-800">
          Defina metas realistas baseadas na sua renda mensal. Uma boa prática é seguir a regra 50/30/20:
          50% para necessidades, 30% para desejos e 20% para poupança.
        </p>
      </div>
    </div>
  )
}
