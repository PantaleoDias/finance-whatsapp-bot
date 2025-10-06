import { useState, useEffect } from 'react'
import axios from 'axios'
import Charts from './Charts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/api/analytics')
      setData(response.data.data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar dados. Verifique se o servidor está rodando.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'exceeded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ok':
        return '✅ Dentro da meta'
      case 'warning':
        return '⚠️ Atenção'
      case 'exceeded':
        return '❌ Meta ultrapassada'
      default:
        return 'Sem meta definida'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Gasto</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            R$ {data.summary?.totalSpent?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Número de Gastos</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {data.summary?.expenseCount || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Média Diária</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            R$ {data.summary?.dailyAverage?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Dias Restantes</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {data.summary?.daysRemaining || 0}
          </div>
        </div>
      </div>

      {/* Status das Metas */}
      {data.goals && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Status das Metas</h3>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(data.goals.total.status)}`}>
            {getStatusText(data.goals.total.status)}
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Meta mensal: R$ {data.goals.total.goal?.toFixed(2)} |
              Gasto: R$ {data.goals.total.spent?.toFixed(2)} |
              Restante: R$ {data.goals.total.remaining?.toFixed(2)}
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  data.goals.total.status === 'exceeded' ? 'bg-red-600' :
                  data.goals.total.status === 'warning' ? 'bg-yellow-500' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(data.goals.total.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <Charts
        categoryData={data.categoryChart}
        lineData={data.lineChart}
      />

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">💡 Insights</h3>
          <ul className="space-y-2">
            {data.insights.map((insight, index) => (
              <li key={index} className="text-gray-700">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Últimos Gastos */}
      {data.recentExpenses && data.recentExpenses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Últimos Gastos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentExpenses.map((expense, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.Data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.Categoria}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expense.Descrição}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      R$ {expense.Valor?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
