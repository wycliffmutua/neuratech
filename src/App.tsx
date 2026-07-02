import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">NeuraTech</h1>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to NeuraTech</h1>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  )
}

export default App