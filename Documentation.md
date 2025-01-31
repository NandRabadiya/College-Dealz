# College Dealz Project Documentation

## I. Project Description

### 1. Project Overview
**College Dealz** is a reselling platform designed for college students to buy and sell items within their university communities. The website is being developed using Spring Boot for the backend, React for the frontend, and MySQL for data storage. 

### 2. Purpose of the Project
The platform streamlines the process of buying and selling items within college communities by offering a secure, user-friendly, and scalable solution tailored to the needs of students.

## II. Technical Stack

### 1. Frontend
- React 18.x
- Redux for state management
- Material-UI/Tailwind CSS for components
- Axios for API communication
- Socket.io client for real-time chat

### 2. Backend
- Spring Boot 3.x
- Spring Security for authentication
- Spring Data JPA for database operations
- WebSocket for real-time communication
- JWT for stateless authentication

### 3. Database
- MySQL 8.x
  
## III. Functional Requirements

### 1. User Authentication
- Secure login/signup with email verification
- OAuth integration (Google)
- Session management with JWT
- Role-based access control (Student, Admin)

### 2. Product Management
- CRUD operations for product listings
- Multi-image upload support
- Product categorization

### 3. Wishlist 
- Add/remove products from wishlist

### 4. Wantlist
- Add product 

### 5. Chat Functionality
- Real-time messaging using WebSocket
- Message history persistence

### 6. Admin Dashboard
- User management (block/unblock)
- Product moderation
- Complaint handling system

### 7. Search & Filter
- Full-text search functionality
- Advanced filtering options
- Sort by relevance, price, date

## IV. Non-Functional Requirements

### 1. Performance
- Page load time < 3 seconds
- API response time < 500ms
- Support for 5000 concurrent users
- Database query optimization
- Client-side caching implementation

### 2. Security
- HTTPS implementation
- Data encryption at rest and in transit
- Input validation and sanitization
- Rate limiting
- CORS policy implementation
- SQL injection prevention
- XSS protection

### 3. Scalability
- Horizontal scaling capability
- Microservices architecture consideration
- Caching strategy
- Load balancing implementation
- Database sharding strategy

### 4. Reliability
- 99.9% uptime guarantee
- Automated backup system
- Error logging and monitoring
- Failover mechanisms
- Data recovery procedures

## V. Database Schema

### Core Tables
1. Admins
2. Chats
3. Images
4. Messages
5. Notification
6. Products
7. Reports
8. Roles
9. University
10. Users
11. Wantlist
12. Wishlist


## VI. API Documentation

### Authentication Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token

### Product Endpoints
- GET /api/products
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}

### User Endpoints
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/wishlist

## VII. Deployment

### 1. Development Environment
- Docker containers for services
- GitLab CI/CD pipeline
- Development, Staging, and Production environments

### 2. Production Environment
- AWS infrastructure
- Auto-scaling configuration
- CDN integration
- Monitoring tools setup

## VIII. Testing Strategy

### 1. Unit Testing
- JUnit for backend
- Jest for frontend
- 80% minimum code coverage

### 2. Integration Testing
- API testing with Postman
- End-to-end testing with Cypress
- Performance testing with JMeter

## IX. Future Enhancements
- Mobile application development
- Payment gateway integration
- AI-powered recommendation system
- Multi-language support
- Advanced analytics dashboard

