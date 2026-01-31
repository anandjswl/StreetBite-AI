# StreetBite AI Platform

## Overview
StreetBite AI is a platform for discovering and managing street food vendors through an interactive map interface, vendor registration system, and administrative analytics dashboard.

## Core Features

### Interactive Map Discovery
- Live map displaying nearby street vendors based on user's GPS location
- Real-time vendor location tracking with continuous geolocation updates using `navigator.geolocation.watchPosition` on vendor side
- Automatic vendor coordinate updates as vendors move with short-interval polling (3 seconds) on user map view
- Real-time vendor location updates with automatic marker refresh
- Live position indicator labels showing that vendor locations are updated in real-time
- Vendor markers showing basic information (name, food type, availability status)
- Click on markers to view detailed vendor profiles
- Search and filter vendors by food type, ratings, or distance
- No authentication required for browsing, searching, and map viewing

### Vendor Registration System
- Open vendor registration for all users (no authentication required)
- Two registration methods:
  - GPS-based: Automatic location detection and continuous position tracking updates
  - Voice-based: Speech-to-text input for feature phone users
- Vendor profile creation with business details
- Menu management (add/edit food items with prices in Indian Rupees ₹)
- Real-time availability toggle (open/closed status)
- QR code generation for each vendor's unique digital identity
- Guest users can register vendors but cannot edit or manage them later
- Authenticated users retain full vendor management rights (edit, update, delete)
- Notice displayed informing users that login provides vendor management capabilities
- "Return to Home Page" button allowing users to navigate back to main map at any time
- Automatic redirect to homepage after successful registration with success notification

### Vendor Profiles
- Display vendor information: name, location, contact details
- Menu with food items and prices displayed in Indian Rupees (₹)
- Customer ratings and reviews system
- Hygiene scores display
- Real-time availability status
- Generated QR code for vendor identification

### AI-Powered Recommendations
- Personalized food recommendations based on user preferences
- Vendor suggestions based on location, ratings, and popularity
- Trending food items and popular vendors in the area

### Admin Authentication & Access
- Admin Login page accessible to all users for development and testing purposes
- Direct admin dashboard access without permission verification requirements
- All users granted administrative privileges when accessing admin features
- "Return to Home Page" functionality available on both admin login and dashboard views

### Admin Dashboard
- Open access admin dashboard for development and testing
- Full administrative functionality available to all users
- Analytics and insights:
  - Vendor density mapping and statistics
  - Demand hotspots identification
  - Hygiene score trends and compliance monitoring
  - Revenue and activity analytics
- Vendor management (approve/reject registrations)
- Generate reports for policy making

### Language Support
- Application content language: English
- UI labels, buttons, and interface elements in English
- Existing Hindi toggle functionality maintained

### External Integrations
- Google Maps API for mapping functionality
- Google Speech-to-Text API for voice registration
- Vertex AI for recommendation algorithms

## Data Storage (Backend)
- Vendor profiles and business information with owner identification
- Anonymous vendor registrations marked with placeholder principal
- Real-time vendor location coordinates with continuous timestamp tracking for movement updates (3-second intervals)
- Menu items and pricing in Indian Rupees
- User ratings and reviews
- Hygiene scores and compliance data
- Location coordinates and availability status
- Analytics data and usage statistics

## User Interface
- Mobile-first responsive design
- Accessible interface following web accessibility standards
- Clean, intuitive navigation
- English language interface with Hindi toggle support
- Touch-friendly controls for mobile devices
- Currency display in Indian Rupees (₹) throughout the application
- No mandatory login requirements for basic functionality or vendor registration
- Registration form accessible to all users with informational notice about login benefits
- "Return to Home Page" navigation button on vendor registration page
- Admin Login page with direct access for development and testing
- Open admin dashboard access without permission restrictions
- Success notifications and toast messages for user feedback
- Live location indicators and real-time update labels
- Footer component without attribution line
