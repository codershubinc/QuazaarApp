# Communication Protocol

The Quazaar app communicates with the server using a combination of WebSockets for real-time control and HTTP for file sharing.

## WebSocket Communication

The app uses WebSockets for real-time, bidirectional communication with the server. The `WebSocketManager` class handles the connection, disconnection, and message parsing.

### Server Response Format

The server sends JSON messages with the following structure:

```json
{
  "status": "player",
  "message": "Current player status",
  "data": {
    "Title": "Track Title",
    "Artist": "Artist Name",
    "Album": "Album Name",
    "Artwork": "https://.../artwork.jpg",
    "Position": "61485025",
    "Length": "223000000",
    "Status": "Playing",
    "Player": "spotify"
  }
}
```

*   **`status`**: The type of response (e.g., "player", "bluetooth", "wifi").
*   **`message`**: A human-readable message about the response.
*   **`data`**: The actual payload data.

The app routes messages based on the `status` field to update the appropriate UI components.

## HTTP File Sharing

For file sharing, the app uses Retrofit to make HTTP requests to the server. The `FileShareManager` class handles the file upload process. The process is a secure two-step operation:

1.  The app obtains a temporary, unique upload URL from the server.
2.  The app sends a POST request with the file to the temporary URL.

The Retrofit API for file sharing is defined in the `FileShareApi` interface.
