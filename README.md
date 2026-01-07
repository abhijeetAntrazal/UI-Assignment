# 🏥 HealthSure Policy Operations Portal

A modern, full-stack web application for managing health insurance policies and patient records. Built with vanilla JavaScript frontend and Node.js/Express backend with MySQL database.

## ✨ Features

### Patient Management
- ✅ **Onboard New Patients** - 3-step wizard with form validation
- ✅ **Profile Pictures** - Upload and display patient photos (max 5MB)
- ✅ **Advanced Search** - Search by name, phone (prefix match), or email
- ✅ **Patient Summary Cards** - View complete patient information with gradient avatars
- ✅ **Responsive Design** - Mobile-first design that works on all devices

### Policy Operations
- ✅ **Create Policies** - Multiple insurance plans (Gold, Silver, Active, Premium)
- ✅ **Cancel Policies** - With mandatory cancellation reason
- ✅ **Renew Policies** - Extend policy validity for active/expired policies
- ✅ **Policy Status Tracking** - Visual badges (Active, Cancelled, Expired)
- ✅ **Dashboard Statistics** - Real-time policy counts and expiring policies alerts

### Technical Features
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Gradient backgrounds, smooth animations, hover effects
- 🔍 **Real-time Search** - Instant search results without page reload
- 📊 **Data Visualization** - Stats cards with policy metrics
- 🖼️ **Image Upload** - Multer integration for file handling
- ✅ **Form Validation** - Client-side validation with error messages
- 🔄 **RESTful API** - Clean API architecture with proper error handling

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)** - Modular architecture
- **FileReader API** - Image preview functionality

### Backend
- **Node.js** (v16+) - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** (v8.0+) - Relational database
- **Multer** - File upload middleware
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

### Architecture
- **DOM Helper** - Custom DOM manipulation framework
- **Validation Framework** - Reusable validation rules

## 📁 Project Structure

healthsure-portal/
├── backend/
│ ├── config/
│ │ └── database.js # MySQL connection pool
│ ├── controllers/
│ │ ├── patient.js # Patient CRUD operations
│ │ └── policies.js # Policy CRUD operations
│ ├── routes/
│ │ ├── patient.js # Patient API routes
│ │ └── policies.js # Policy API routes
│ ├── middleware/
│ │ └── upload.js # Multer configuration
│ ├── uploads/
│ │ └── patients/ # Uploaded patient images
│ ├── .env # Environment variables
│ ├── index.js # Express server entry point
│ └── package.json
├── frontend/
│ ├── modules/
│ │ ├── domHelper.js # DOM manipulation utilities
│ │ ├── validation.js # Form validation framework
│ │ ├── patientService.js # Patient API calls
│ │ ├── policyService.js # Policy API calls
│ │ └── uiManager.js # UI rendering logic
│ ├── index.html # Main HTML file
│ ├── index.css # Responsive styles
│ └── index.js # Application entry point
├── .gitignore
└── README.md

# Database Setup

CREATE DATABASE healthsure;
USE healthsure;

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT,
  dob DATE,
  city VARCHAR(100),
  address VARCHAR(255),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
);

CREATE TABLE policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  policy_number VARCHAR(50) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  sum_insured DECIMAL(15,2) NOT NULL,
  status ENUM('ACTIVE','CANCELLED','EXPIRED') DEFAULT 'ACTIVE',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);


