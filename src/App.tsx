import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm hover:shadow-xl transition">
        <h2 className="text-xl font-bold text-gray-800">Truck #204</h2>
        <p className="text-gray-500 mt-1">Status: On Route</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          View Details
        </button>
      </div>
    </div>
  )
}

export default App
