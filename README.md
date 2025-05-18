# CARTESIA - Smart Product Sorting E-commerce Platform

CARTESIA is a modern e-commerce platform that offers a seamless and personalized shopping experience with efficient product sorting, filtering, and recommendation systems. It supports multiple product categories and provides users with intelligent search capabilities, dynamic pricing, and personalized suggestions.

## Features

- **Product Aggregation**: Products from multiple online stores in one place
- **Intelligent Search**: Powered by Elasticsearch and Algolia
- **Personalized Recommendations**: Smart suggestions based on user preferences
- **Dynamic Filtering**: Advanced filtering options for better product discovery
- **Responsive Design**: Works seamlessly on all devices
- **User Authentication**: Secure login and registration
- **Shopping Cart**: Add products to cart, manage quantities, and checkout
- **Order Management**: Track order status and history

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Styled Components for styling
- React Icons for iconography

### Backend
- Node.js with Express
- MongoDB with Mongoose for data storage
- JWT for authentication
- Elasticsearch and Algolia for search functionality

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- Elasticsearch (optional, for advanced search)
- Algolia account (optional, for advanced search)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cartesia.git
cd cartesia
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Configure your MongoDB connection, JWT secret, etc.

5. Start the backend server:
```bash
npm run dev
```

6. Start the frontend development server:
```bash
cd ../frontend
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
cartesia/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   └── src/                 # Source files
│       ├── components/      # Reusable components
│       ├── context/         # Context providers
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Utility functions
├── backend/                 # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── services/            # Business logic
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
