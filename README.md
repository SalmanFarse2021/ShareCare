# ShareCare 🤝
> **Connecting Communities, One Donation at a Time.**

ShareCare is a modern web application designed to bridge the gap between resource abundance and scarcity. It serves as a hyperlocal platform where individuals and organizations can coordinate the donation of essential items like food, clothing, and medical supplies to those in need.

## 🌟 Key Features

### 📍 Donation Hubs (Points)
- **Interactive Map**: Discover nearby collection points using Google Maps integration.
- **Hub Management**: Managers can register donation points, track inventory, and view impact analytics.
- **Urgent Needs Board**: Real-time alerts for critical items needed at specific locations.

### 📡 Live Social Feed
- **Geo-Fenced Updates**: See donation requests and offers within your customized radius (default 50km).
- **Smart Filtering**: Sort by urgency, distance, or item category.
- **Interactive Posts**: Request items directly or claim donations with a single click.

### 💬 Real-Time Communication
- **Messenger**: Built-in chat system with WebSocket (Socket.io) support.
- **Features**: Typing indicators, online status, read receipts, and image sharing.
- **Privacy First**: Secure, direct communication between donors, recipients, and hub managers.

### 🛡️ Secure & Verified
- **Role-Based Access**: Specialized dashboards for Hub Managers, Volunteers, and General Users.
- **Verification**: Points and posts undergo checks to ensure safety and authenticity.

## 🛠️ Technology Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React
- **Backend API**: Next.js Server Actions & API Routes
- **Database**: [MongoDB](https://www.mongodb.com/) (Data persistence), [Firebase](https://firebase.google.com/) (Auth & User Sync)
- **Real-Time**: [Socket.IO](https://socket.io/) (Messaging & Notifications)
- **Maps**: Google Maps JavaScript API
- **Styling**: CSS Modules with responsive design

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js 18+
- MongoDB Instance
- Firebase Project
- Google Maps API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SalmanFarse2021/ShareCare.git
   cd ShareCare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://...

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   # ... other firebase config

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

   # App Secrets
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
Top-level folders are mapped directly to Next.js App Router:

app/
├── api/             # Backend API Routes (Database & Logic)
├── dashboard/       # Protected User/Manager Dashboard
├── login/           # Authentication Pages
├── points/          # Public Donation Point Views
└── ...
components/          # Reusable UI Components
lib/                 # Utility functions & Database configuration
models/              # Mongoose Data Models (User, Point, Post, Chat)
context/             # React Context (Auth, Language)
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
