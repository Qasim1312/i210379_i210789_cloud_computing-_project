# AWS Deployment Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                    VPC                                                 │
│  ┌───────────────────┐           ┌───────────────────┐          ┌──────────────────┐  │
│  │     Public        │           │    Private        │          │    Private       │  │
│  │     Subnet        │           │    Subnet 1       │          │    Subnet 2      │  │
│  │                   │           │                   │          │                  │  │
│  │  ┌─────────────┐  │           │  ┌─────────────┐  │          │ ┌─────────────┐ │  │
│  │  │ Elastic     │  │           │  │ EC2 Instance│  │          │ │ RDS Database│ │  │
│  │  │ Beanstalk   │  │           │  │ (Backend)   │  │          │ │ (Optional)  │ │  │
│  │  │ (Frontend)  │  │           │  │             │  │          │ │             │ │  │
│  │  └─────────────┘  │           │  └─────────────┘  │          │ └─────────────┘ │  │
│  │        │          │           │        │          │          │        ▲        │  │
│  └────────┼──────────┘           └────────┼──────────┘          └────────┼────────┘  │
│           │                               │                              │           │
│           ▼                               │                              │           │
│  ┌──────────────────┐                     │                              │           │
│  │    Internet      │                     │                              │           │
│  │    Gateway       │                     │                              │           │
│  └──────────────────┘                     │                              │           │
│           │                               │                              │           │
└───────────┼───────────────────────────────┼──────────────────────────────┼───────────┘
            │                               │                              │
            ▼                               ▼                              │
   ┌──────────────────┐         ┌──────────────────────┐                   │
   │     Route 53     │         │                      │                   │
   │    (Optional)    │         │      Amazon S3       │                   │
   └──────────────────┘         │   (File Storage)     │                   │
            │                   │                      │                   │
            ▼                   └──────────────────────┘                   │
   ┌──────────────────┐                                                    │
   │       Users      │                                                    │
   └──────────────────┘                                                    │
                                 ┌───────────────────────┐                 │
                                 │                       │                 │
                                 │    MongoDB Atlas      │─────────────────┘
                                 │    (Cloud Database)   │
                                 │                       │
                                 └───────────────────────┘
```

## Architecture Explanation

### Frontend (Elastic Beanstalk)
- Deployed in a public subnet with internet access
- Serves the React application to users
- Communicates with the backend API for data

### Backend (EC2 with Docker)
- Deployed in a private subnet for security
- Runs the Node.js application in a Docker container
- Handles API requests, authentication, and business logic
- Communicates with MongoDB Atlas or RDS for data persistence
- Uploads/downloads files to/from S3

### Database Options
- **MongoDB Atlas**: Cloud-hosted MongoDB service
- **Amazon RDS** (Optional): For PostgreSQL or MySQL in a private subnet

### Storage
- **Amazon S3**: Stores file attachments and profile images
- Configured with appropriate bucket policies

### Networking
- **VPC**: Isolates the application resources
- **Public Subnet**: Contains resources that need internet access
- **Private Subnets**: Houses database and application logic for security
- **Internet Gateway**: Provides internet access to the VPC

### Optional Components
- **Route 53**: For custom domain management
- **ACM**: For SSL certificates
- **CloudFront**: For content delivery network capabilities

### Security Measures
- Security Groups restrict access between components
- IAM roles provide necessary permissions
- Private subnets protect sensitive resources
- HTTPS encryption for all communications 