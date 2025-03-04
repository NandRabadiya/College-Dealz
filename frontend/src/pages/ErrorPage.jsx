import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

const ErrorPage = ({ statusCode = 404, title = "Page not found", message = "Sorry, we couldn't find the page you're looking for." }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <AlertCircle className="h-24 w-24 text-red-500 dark:text-red-400" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-white dark:text-gray-900 text-xl">
              {statusCode}
            </span>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Home className="mr-2 h-5 w-5" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
