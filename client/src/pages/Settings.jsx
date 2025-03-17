import React, { useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'user', label: 'User Management' },
    { id: 'operational', label: 'Operational Settings' },
    { id: 'notification', label: 'Notification Settings' },
    { id: 'reports', label: 'Reports & Analytics Settings' },
    { id: 'security', label: 'Security & Privacy Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'user':
        return <UserManagementSettings />;
      case 'operational':
        return <OperationalSettings />;
      case 'notification':
        return <NotificationSettings />;
      case 'reports':
        return <ReportsSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-gray-700">
          System Updates & Version Control
          <IoInformationCircleOutline className="text-gray-500" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">General Settings</h2>
    {/* Add general settings form fields here */}
  </div>
);

const UserManagementSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">User Management Settings</h2>
    {/* Add user management settings form fields here */}
  </div>
);

const OperationalSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">Operational Settings</h2>
    {/* Add operational settings form fields here */}
  </div>
);

const NotificationSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">Notification Settings</h2>
    {/* Add notification settings form fields here */}
  </div>
);

const ReportsSettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">Reports & Analytics Settings</h2>
    {/* Add reports settings form fields here */}
  </div>
);

const SecuritySettings = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium">Security & Privacy Settings</h2>
    {/* Add security settings form fields here */}
  </div>
);

export default Settings;
