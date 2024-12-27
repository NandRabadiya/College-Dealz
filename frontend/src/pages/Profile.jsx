import React from 'react';

const Dashboard = () => {
    const user = {
        profilePicture: 'https://via.placeholder.com/150',
        name: 'John Doe',
        email: 'john.doe@example.com'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto"
                />
                <h2 className="text-2xl font-semibold mt-4 text-center">{user.name}</h2>
                <p className="text-gray-600 mt-2 text-center">{user.email}</p>
            </div>
        </div>
    );
};

export default Dashboard;