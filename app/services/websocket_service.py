# WebSocket service
from fastapi import WebSocket
from typing import Set
import logging

logger = logging.getLogger(__name__)

class WebSocketService:
    def __init__(self):
        self.connected_clients: Set[WebSocket] = set()
    
    def add_client(self, websocket: WebSocket):
        """Add a new client connection"""
        self.connected_clients.add(websocket)
    
    def remove_client(self, websocket: WebSocket):
        """Remove a client connection"""
        self.connected_clients.discard(websocket)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = set()
        for client in self.connected_clients:
            try:
                await client.send_json(message)
            except:
                disconnected.add(client)
        
        # Remove disconnected clients
        for client in disconnected:
            self.remove_client(client)
