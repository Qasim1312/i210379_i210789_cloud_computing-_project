# Task Manager - AWS Cloud Deployment Project

A cloud-based task management application built using React for the frontend and Node.js for the backend, designed to be deployed on AWS infrastructure.

## Features

- **User Authentication**: Register and login to manage your tasks securely
- **CRUD Operations**: Create, read, update, and delete tasks
- **File Uploads**: Attach files to tasks (stored in AWS S3)
- **Priority & Status Tracking**: Organize tasks by priority and track completion status
- **Responsive UI**: Works well on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- React Router
- Bootstrap
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB (or can be modified to use AWS RDS PostgreSQL/MySQL)
- JWT Authentication
- Multer for file handling
- AWS SDK for S3 integration

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cloud_project
   JWT_SECRET=your_jwt_secret_key
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   ```

4. Start the backend server in development mode:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

## AWS Deployment Instructions

### Backend Deployment (EC2 with Docker)

1. Launch an EC2 instance inside a VPC with proper security groups
2. Install Docker on the EC2 instance
3. Clone the repository to the EC2 instance
4. Build the Docker image:
   ```
   cd backend
   docker build -t task-manager-backend .
   ```
5. Run the Docker container with environment variables:
   ```
   docker run -d -p 5000:5000 \
   -e MONGODB_URI=your_mongodb_uri \
   -e JWT_SECRET=your_jwt_secret \
   -e AWS_ACCESS_KEY_ID=your_access_key \
   -e AWS_SECRET_ACCESS_KEY=your_secret_key \
   -e AWS_REGION=your_region \
   -e S3_BUCKET_NAME=your_bucket_name \
   --name task-manager-backend \
   task-manager-backend
   ```

### Frontend Deployment (Elastic Beanstalk)

1. Create an Elastic Beanstalk environment for a web application
2. Update the `.env` file to point to your backend API endpoint
3. Build the React application:
   ```
   cd frontend
   npm run build
   ```
4. Deploy the build folder to Elastic Beanstalk using the AWS Management Console or EB CLI

### Database Setup

For MongoDB:
- Set up a MongoDB Atlas cluster
- Configure network access to allow connections from EC2

For PostgreSQL/MySQL:
- Create an Amazon RDS instance
- Configure security groups to allow connections from EC2

### S3 Setup for File Storage

1. Create an S3 bucket for file storage
2. Configure CORS for the S3 bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```
3. Set up the appropriate bucket policy for public/private access

### IAM Roles and Policies

1. Create an IAM role for EC2 with the following permissions:
   - AmazonS3FullAccess (or a more restrictive custom policy)
   - AmazonRDSReadOnlyAccess (if using RDS)
   
2. Attach the IAM role to your EC2 instance

## Security Considerations

- All communications should be over HTTPS
- Implement proper bucket policies to restrict S3 access
- Use security groups to limit access to EC2 and RDS
- Follow the principle of least privilege for IAM roles

## License

MIT License

## Contributors

Your Name 