import React from 'react'
import { Link } from 'wouter'

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
                <Link to="/" className="btn-primary">Go Home</Link>
            </div>
        </div>
    )
}

export default NotFound
