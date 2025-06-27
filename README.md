# Smart Travel Agency - Demo Application

**Note:** Since Docker Compose may not work reliably in all environments, we've provided a link to a demo video of our app on Google Drive:

👉 [Watch Demo on Google Drive](https://drive.google.com/drive/folders/1A3syCxz_6Ibi5YnbXvOu2LQbNZvOs8b6?usp=sharing)

## Running with Docker

This application consists of multiple microservices that can be run using Docker Compose:

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB of RAM available for containers

### Services Architecture
- **PostgreSQL** (port 5432) - Main database
- **Server** (port 3000) - NestJS backend API
- **Admin** (port 3002) - Admin dashboard (Next.js)
- **Client** (port 3003) - Client application (Next.js)
- **Frontend** (port 80, 3001) - Main frontend (Next.js)
- **AI Service** (port 8000) - AI/ML services
- **Tools Service** (port 8001) - Additional tools API
- **Fabrid Service** (port 8080) - Blockchain/Fabric service

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd agentic
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your preferred database credentials
   ```

3. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Or run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

6. **View logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```
### Troubleshooting
- If containers fail to start, check available system resources
- Ensure no other services are using the configured ports
- Check logs using `docker-compose logs [service-name]`
- Clear Docker cache: `docker system prune -a` (use with caution)o Application

**Note:** Since Docker Compose may not work reliably in all environments, we’ve provided a link to a demo video of our app on Google Drive:

👉 [Watch Demo on Google Drive](https://drive.google.com/drive/folders/1A3syCxz_6Ibi5YnbXvOu2LQbNZvOs8b6?usp=sharing)  
