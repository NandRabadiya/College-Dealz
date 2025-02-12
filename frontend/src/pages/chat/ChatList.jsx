import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiMessages } from "react-icons/ti";

const ChatList = ({ onSelectConversation }) => {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            // Fetch conversation list from backend API
            const response = await fetch("http://localhost:8080/api/conversations");
            const data = await response.json();
            setConversations(data);
        };
        fetchConversations();
    }, []);

    return (
        <Card className="bg-[#1a1425] border-purple-600/20">
            <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                    <TiMessages className="mr-2 h-7 w-7 flex-shrink-0" />
                    <span className="truncate">Chats</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {conversations.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No conversations yet</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.chatId}
                                className="p-3 rounded-lg hover:bg-[#2a2435] cursor-pointer transition-colors duration-200 border border-purple-600/20"
                                onClick={() => onSelectConversation(conv.chatId)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-white font-medium">
                                        {conv.participantName}
                                    </h3>
                                    <small className="text-gray-400 text-xs">
                                        {new Date(conv.lastMessage.createdAt).toLocaleString()}
                                    </small>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-1">
                                    {conv.lastMessage.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatList;
