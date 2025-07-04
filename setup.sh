#!/bin/bash

# Insurance Feedback System - PostgreSQL Setup Script
echo "🚀 Setting up Insurance Feedback System with PostgreSQL..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "📋 .env file already exists."
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Database setup
echo "🗄️ Setting up PostgreSQL database..."

# Check if database exists and create if needed
DB_NAME=${DB_NAME:-feedback_db}
DB_USER=${DB_USER:-feedback_user}
DB_PASSWORD=${DB_PASSWORD:-secure_password}

echo "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed the database with sample data
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env file with your email service credentials (SendGrid/AWS SES)"
echo "2. Start the development server: npm run dev"
echo "3. Visit: http://localhost:3000"
echo "4. Dashboard: http://localhost:3000/dashboard"
echo ""
echo "📝 Database connection:"
echo "   Host: localhost"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""
echo "🚀 Ready to launch!"