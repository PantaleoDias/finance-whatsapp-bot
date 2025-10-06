import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Goals from './components/Goals'
import Profile from './components/Profile'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">💰 Finance Bot</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`${
                    currentPage === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('goals')}
                  className={`${
                    currentPage === 'goals'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Metas
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`${
                    currentPage === 'profile'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'goals' && <Goals />}
        {currentPage === 'profile' && <Profile />}
      </main>
    </div>
  )
}

export default App
