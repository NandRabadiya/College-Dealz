import React from "react";
import { School, Package, Users, Shield, MessageSquare, ArchiveIcon } from "lucide-react";

const DashboardHeader = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "universities", icon: School, label: "Universities" },
    { id: "products", icon: Package, label: "Products" },
    { id: "archivedProducts", icon: ArchiveIcon, label: "Archived" },
    { id: "users", icon: Users, label: "Users" },
    { id: "admins", icon: Shield, label: "Admins" },
    { id: "feedback", icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm flex items-center transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <item.icon className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;