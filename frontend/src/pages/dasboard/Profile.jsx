import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
    const [user, setUser] = useState({
        profilePicture: 'account.png',
        name: 'John Doe',
        email: 'john.doe@example.com',
        university: 'University of Nadiad',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user.name);
    const [editedImage, setEditedImage] = useState(null);

    const [deals] = useState([
        {
            id: 1,
            name: "Sample Product",
            price: "$99",
            image: "product1.jpg",
            seller_name: user.name,
            post_date: "2 days ago",
        },
        {
            id: 2,
            name: "Another Product",
            price: "$149",
            image: "product2.jpg",
            seller_name: user.name,
            post_date: "3 days ago",
        },
    ]);

    const handleProfileUpdate = () => {
        setUser((prev) => ({
            ...prev,
            name: editedName,
            profilePicture: editedImage || prev.profilePicture,
        }));
        setIsEditing(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteDeal = (dealId) => {
        console.log('Deleting deal:', dealId);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Section */}
                    <div className="md:col-span-1">
                        <Card className="shadow-lg rounded-xl bg-background">
                            <CardContent className="p-6">
                                <div className="relative mb-6">
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                                        <img
                                            src={user.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -bottom-2 -right-2 bg-background shadow-lg rounded-full"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Pencil className="h-4 w-4 text-primary" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                                        {user.university}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deals Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Posted Deals</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {deals.map((deal) => (
                                <Card key={deal.id} className="shadow-md rounded-lg group">
                                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                                        <img
                                            src={`/${deal.image}`}
                                            alt={deal.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg text-gray-800 truncate">{deal.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-semibold text-primary">{deal.price}</span>
                                            <span className="text-sm text-gray-500">{deal.post_date}</span>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-primary"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-red-600"
                                                onClick={() => handleDeleteDeal(deal.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-lg bg-white rounded-lg p-6 shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-800">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Profile Picture</label>
                            <Input type="file" onChange={handleImageChange} accept="image/*" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                            <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="border-gray-300 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <Button onClick={handleProfileUpdate} className="w-full bg-primary text-white">
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Dashboard;
