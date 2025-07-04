# Business Adaptation Guide

## Overview

This guide shows how to adapt the Insurance Lead Feedback System for different industries and business models. The system is designed with modularity and configuration-driven customization in mind.

## Quick Adaptation Checklist

- [ ] Define your scoring factors and weights
- [ ] Customize status workflow for your industry
- [ ] Configure issue categories relevant to your business
- [ ] Update email templates and branding
- [ ] Modify form fields for your data needs
- [ ] Set up industry-specific analytics

## Industry-Specific Adaptations

### 1. Real Estate Lead Generation

#### Scoring Framework Adaptation
```javascript
// config/real-estate-scoring.js
const realEstateScoring = {
    businessName: "Elite Real Estate Leads",
    industry: "real-estate",
    
    // Scoring factors (total should equal 100)
    factors: [
        {
            name: "budget",
            label: "Budget Range", 
            maxPoints: 30,
            ranges: {
                "Above $1M": 30,
                "$750K-$1M": 25,
                "$500K-$750K": 20,
                "$300K-$500K": 15,
                "$200K-$300K": 10,
                "Under $200K": 5
            }
        },
        {
            name: "timeline",
            label: "Purchase Timeline",
            maxPoints: 25,
            ranges: {
                "Immediate (0-30 days)": 25,
                "1-3 months": 20,
                "3-6 months": 15,
                "6-12 months": 10,
                "Over 12 months": 5,
                "Just looking": 2
            }
        },
        {
            name: "preApproval",
            label: "Financing Status",
            maxPoints: 20,
            ranges: {
                "Pre-approved": 20,
                "Getting pre-approved": 15,
                "Good credit, stable income": 10,
                "Credit concerns": 5,
                "No financing plan": 0
            }
        },
        {
            name: "motivation",
            label: "Buying Motivation",
            maxPoints: 15,
            ranges: {
                "Must relocate": 15,
                "Outgrown current home": 12,
                "Investment purchase": 10,
                "First-time buyer": 8,
                "Upgrading lifestyle": 6,
                "Just curious": 2
            }
        },
        {
            name: "location",
            label: "Location Preference",
            maxPoints: 10,
            ranges: {
                "Specific target area": 10,
                "Flexible on location": 7,
                "Very specific requirements": 5,
                "Out of service area": 0
            }
        }
    ],
    
    // Status workflow for real estate
    statuses: [
        { value: "new", label: "New - Not contacted", emoji: "🆕", color: "#64748B" },
        { value: "contacted", label: "Initial contact made", emoji: "📞", color: "#3B82F6" },
        { value: "qualified", label: "Qualified buyer", emoji: "✅", color: "#22C55E" },
        { value: "viewing-scheduled", label: "Property viewing scheduled", emoji: "📅", color: "#F59E0B" },
        { value: "viewed-properties", label: "Shown properties", emoji: "🏠", color: "#8B5CF6" },
        { value: "offer-submitted", label: "Offer submitted", emoji: "📄", color: "#06B6D4" },
        { value: "negotiating", label: "Negotiating terms", emoji: "🤝", color: "#F97316" },
        { value: "under-contract", label: "Under contract", emoji: "📋", color: "#10B981" },
        { value: "closed", label: "Sale closed", emoji: "🎉", color: "#059669" },
        { value: "lost", label: "Lost to competitor/changed mind", emoji: "❌", color: "#EF4444" }
    ],
    
    // Common issues in real estate
    issues: [
        { value: "unrealistic-expectations", label: "Unrealistic price expectations", icon: "💰" },
        { value: "financing-issues", label: "Financing/pre-approval problems", icon: "🏦" },
        { value: "timeline-mismatch", label: "Timeline doesn't match urgency", icon: "⏰" },
        { value: "location-changed", label: "Changed location preference", icon: "📍" },
        { value: "another-agent", label: "Working with another agent", icon: "👥" },
        { value: "market-conditions", label: "Waiting for market changes", icon: "📈" },
        { value: "personal-circumstances", label: "Personal situation changed", icon: "👨‍👩‍👧‍👦" },
        { value: "fake-inquiry", label: "Fake or test inquiry", icon: "🚫" }
    ]
};

module.exports = realEstateScoring;
```

#### Real Estate Email Template
```html
<!-- templates/real-estate-lead-notification.html -->
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🏠 New Quality Property Lead</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Score: {{lead_score}}/100</p>
    </div>
    
    <div style="padding: 30px; background: #F8FAFC;">
        <h2 style="color: #1E293B; margin: 0 0 20px;">Lead Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Name:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{lead_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{lead_phone}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{lead_email}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Budget:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{budget_range}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Timeline:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{timeline}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Pre-approved:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{pre_approval_status}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Preferred Area:</td>
                <td style="padding: 8px 0; color: #1E293B;">{{preferred_location}}</td>
            </tr>
        </table>
    </div>
    
    <div style="padding: 30px; text-align: center;">
        <a href="{{feedback_url}}" 
           style="display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); 
                  color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                  font-weight: 600; font-size: 16px;">
            Provide Feedback on This Lead
        </a>
    </div>
</div>
```

### 2. B2B Software Lead Generation

#### B2B Software Configuration
```javascript
// config/b2b-software-scoring.js
const b2bSoftwareScoring = {
    businessName: "Enterprise Software Leads",
    industry: "b2b-software",
    
    factors: [
        {
            name: "companySize",
            label: "Company Size",
            maxPoints: 25,
            ranges: {
                "Enterprise (1000+ employees)": 25,
                "Large (500-1000 employees)": 20,
                "Mid-market (100-500 employees)": 15,
                "Small business (20-100 employees)": 10,
                "Startup (5-20 employees)": 5,
                "Solo/Freelancer": 2
            }
        },
        {
            name: "budget",
            label: "Annual Budget",
            maxPoints: 25,
            ranges: {
                "$500K+ annually": 25,
                "$100K-$500K annually": 20,
                "$50K-$100K annually": 15,
                "$10K-$50K annually": 10,
                "Under $10K annually": 5,
                "No budget allocated": 0
            }
        },
        {
            name: "authority",
            label: "Decision Making Authority",
            maxPoints: 20,
            ranges: {
                "C-level executive": 20,
                "VP/Director level": 17,
                "Manager with budget": 14,
                "Department head": 10,
                "Influencer/Evaluator": 7,
                "End user": 3,
                "Student/Researcher": 0
            }
        },
        {
            name: "need",
            label: "Business Need Urgency",
            maxPoints: 15,
            ranges: {
                "Critical business problem": 15,
                "Active project in progress": 12,
                "Planned for this quarter": 9,
                "Considering for future": 6,
                "General research": 3,
                "Just curious": 1
            }
        },
        {
            name: "timeline",
            label: "Implementation Timeline",
            maxPoints: 15,
            ranges: {
                "Immediate (within 30 days)": 15,
                "This quarter": 12,
                "Next quarter": 9,
                "This year": 6,
                "Next year": 3,
                "No specific timeline": 1
            }
        }
    ],
    
    statuses: [
        { value: "new", label: "New inquiry", emoji: "🆕" },
        { value: "contacted", label: "Initial contact made", emoji: "📞" },
        { value: "qualified", label: "BANT qualified", emoji: "✅" },
        { value: "demo-scheduled", label: "Demo scheduled", emoji: "📅" },
        { value: "demo-completed", label: "Demo completed", emoji: "💻" },
        { value: "proposal-sent", label: "Proposal sent", emoji: "📄" },
        { value: "negotiating", label: "Contract negotiation", emoji: "🤝" },
        { value: "closed-won", label: "Deal closed - won", emoji: "🎉" },
        { value: "closed-lost", label: "Deal closed - lost", emoji: "❌" }
    ],
    
    issues: [
        { value: "budget-insufficient", label: "Insufficient budget", icon: "💰" },
        { value: "no-authority", label: "Not decision maker", icon: "👤" },
        { value: "no-timeline", label: "No specific timeline", icon: "⏰" },
        { value: "competitor-chosen", label: "Chose competitor", icon: "🏢" },
        { value: "feature-gaps", label: "Missing required features", icon: "🔧" },
        { value: "integration-concerns", label: "Integration challenges", icon: "🔗" },
        { value: "internal-politics", label: "Internal politics/delays", icon: "🏛️" },
        { value: "fake-evaluation", label: "Not genuine buyer", icon: "🚫" }
    ]
};
```

### 3. Automotive Lead Generation

#### Automotive Configuration
```javascript
// config/automotive-scoring.js
const automotiveScoring = {
    businessName: "Premium Auto Leads",
    industry: "automotive",
    
    factors: [
        {
            name: "budget",
            label: "Budget Range",
            maxPoints: 30,
            ranges: {
                "$80K+ (Luxury)": 30,
                "$50K-$80K (Premium)": 25,
                "$30K-$50K (Mid-range)": 20,
                "$20K-$30K (Economy)": 15,
                "$10K-$20K (Used)": 10,
                "Under $10K": 5
            }
        },
        {
            name: "timeline",
            label: "Purchase Timeline",
            maxPoints: 25,
            ranges: {
                "This week": 25,
                "This month": 20,
                "Next 3 months": 15,
                "Next 6 months": 10,
                "Eventually": 5
            }
        },
        {
            name: "financing",
            label: "Financing Readiness",
            maxPoints: 20,
            ranges: {
                "Pre-approved": 20,
                "Good credit": 15,
                "Need financing help": 10,
                "Cash purchase": 20,
                "Poor credit": 5
            }
        },
        {
            name: "tradeIn",
            label: "Trade-in Vehicle",
            maxPoints: 15,
            ranges: {
                "High-value trade": 15,
                "Standard trade": 10,
                "Low-value trade": 5,
                "No trade": 0
            }
        },
        {
            name: "intent",
            label: "Purchase Intent",
            maxPoints: 10,
            ranges: {
                "Ready to buy": 10,
                "Serious shopper": 7,
                "Comparing options": 5,
                "Just browsing": 2
            }
        }
    ],
    
    statuses: [
        { value: "new", label: "New inquiry", emoji: "🆕" },
        { value: "contacted", label: "Initial contact", emoji: "📞" },
        { value: "appointment-set", label: "Appointment scheduled", emoji: "📅" },
        { value: "showed-up", label: "Showed for appointment", emoji: "🏪" },
        { value: "test-drive", label: "Test drive completed", emoji: "🚗" },
        { value: "negotiating", label: "Price negotiation", emoji: "💰" },
        { value: "financing", label: "Financing approval", emoji: "🏦" },
        { value: "sold", label: "Vehicle sold", emoji: "🎉" },
        { value: "lost", label: "Lost sale", emoji: "❌" }
    ],
    
    issues: [
        { value: "price-too-high", label: "Price expectations too low", icon: "💰" },
        { value: "financing-denied", label: "Financing denied", icon: "🏦" },
        { value: "wrong-vehicle", label: "Looking for different vehicle", icon: "🚗" },
        { value: "timing-changed", label: "Timeline changed", icon: "⏰" },
        { value: "bought-elsewhere", label: "Purchased from competitor", icon: "🏪" },
        { value: "changed-mind", label: "Decided not to buy", icon: "🤔" },
        { value: "fake-inquiry", label: "Not serious buyer", icon: "🚫" }
    ]
};
```

## Configuration-Driven Customization

### Master Configuration System

```javascript
// config/business-config.js
class BusinessConfiguration {
    constructor(industryConfig) {
        this.config = {
            // Business Information
            business: {
                name: industryConfig.businessName,
                industry: industryConfig.industry,
                logo: industryConfig.logo || "/assets/default-logo.png",
                primaryColor: industryConfig.primaryColor || "#3B82F6",
                secondaryColor: industryConfig.secondaryColor || "#64748B",
                website: industryConfig.website,
                supportEmail: industryConfig.supportEmail
            },
            
            // Scoring Configuration
            scoring: {
                factors: industryConfig.factors,
                maxScore: 100,
                passingScore: industryConfig.passingScore || 60
            },
            
            // Workflow Configuration
            workflow: {
                statuses: industryConfig.statuses,
                issues: industryConfig.issues,
                defaultStatus: "new"
            },
            
            // UI Configuration
            ui: {
                formTitle: industryConfig.formTitle || "Lead Feedback",
                successMessage: industryConfig.successMessage || "Thank you for your feedback!",
                fields: this.generateFormFields(industryConfig),
                colors: this.generateColorScheme(industryConfig)
            },
            
            // Email Configuration
            email: {
                templates: industryConfig.emailTemplates || {},
                fromName: industryConfig.business?.name || "Lead Generation System",
                replyTo: industryConfig.supportEmail
            },
            
            // Analytics Configuration
            analytics: {
                kpis: this.generateKPIs(industryConfig),
                reportingPeriods: ["daily", "weekly", "monthly", "quarterly"]
            }
        };
    }
    
    generateFormFields(config) {
        return {
            leadInfo: [
                { name: "name", label: "Name", type: "text", required: true },
                { name: "email", label: "Email", type: "email", required: false },
                { name: "phone", label: "Phone", type: "tel", required: false },
                ...config.customFields || []
            ],
            rating: {
                scale: config.ratingScale || 5,
                labels: config.ratingLabels || ["Poor", "Fair", "Good", "Great", "Excellent"]
            },
            status: {
                options: config.statuses,
                allowMultiple: false
            },
            issues: {
                options: config.issues,
                allowMultiple: true
            }
        };
    }
    
    generateColorScheme(config) {
        const primary = config.primaryColor || "#3B82F6";
        return {
            primary: primary,
            secondary: config.secondaryColor || "#64748B",
            success: "#22C55E",
            warning: "#F59E0B",
            error: "#EF4444",
            background: "#F8FAFC",
            surface: "#FFFFFF",
            text: "#1E293B"
        };
    }
    
    generateKPIs(config) {
        const baseKPIs = [
            { name: "totalFeedback", label: "Total Feedback", type: "count" },
            { name: "averageRating", label: "Average Rating", type: "average" },
            { name: "conversionRate", label: "Conversion Rate", type: "percentage" },
            { name: "responseTime", label: "Avg Response Time", type: "duration" }
        ];
        
        return [...baseKPIs, ...(config.customKPIs || [])];
    }
    
    // Dynamic form generation
    generateHTML() {
        return new FormGenerator(this.config).generate();
    }
    
    // Dynamic CSS generation
    generateCSS() {
        return new StyleGenerator(this.config).generate();
    }
    
    // Validate against configuration
    validateData(data) {
        return new DataValidator(this.config).validate(data);
    }
}

module.exports = BusinessConfiguration;
```

### Dynamic Form Generation

```javascript
// utils/form-generator.js
class FormGenerator {
    constructor(config) {
        this.config = config;
    }
    
    generate() {
        return `
        <div class="feedback-form-container" style="--primary-color: ${this.config.ui.colors.primary}">
            ${this.generateHeader()}
            ${this.generateLeadInfo()}
            ${this.generateRatingSection()}
            ${this.generateStatusSection()}
            ${this.generateIssuesSection()}
            ${this.generateCommentsSection()}
            ${this.generateSubmitSection()}
        </div>
        `;
    }
    
    generateHeader() {
        return `
        <header class="form-header">
            <h1>${this.config.ui.formTitle}</h1>
            <p>Help us improve our ${this.config.business.industry} lead quality</p>
        </header>
        `;
    }
    
    generateRatingSection() {
        const labels = this.config.ui.fields.rating.labels;
        const stars = Array.from({ length: 5 }, (_, i) => `
            <button type="button" class="star" data-rating="${i + 1}" aria-label="${labels[i]}">
                ⭐
            </button>
        `).join('');
        
        return `
        <section class="rating-section">
            <label class="section-label">Rate Lead Quality</label>
            <div class="star-rating">${stars}</div>
            <div class="rating-labels">
                ${labels.map(label => `<span>${label}</span>`).join('')}
            </div>
        </section>
        `;
    }
    
    generateStatusSection() {
        const options = this.config.workflow.statuses.map(status => `
            <option value="${status.value}">
                ${status.emoji} ${status.label}
            </option>
        `).join('');
        
        return `
        <section class="status-section">
            <label class="section-label">Current Status</label>
            <select class="status-dropdown" required>
                <option value="">Select status...</option>
                ${options}
            </select>
        </section>
        `;
    }
    
    generateIssuesSection() {
        const buttons = this.config.workflow.issues.map(issue => `
            <button type="button" class="issue-btn" data-issue="${issue.value}">
                <span class="issue-icon">${issue.icon}</span>
                <span class="issue-label">${issue.label}</span>
            </button>
        `).join('');
        
        return `
        <section class="issues-section">
            <label class="section-label">Common Issues (Optional)</label>
            <div class="issue-buttons">
                ${buttons}
            </div>
        </section>
        `;
    }
}
```

### Dynamic Styling Generation

```javascript
// utils/style-generator.js
class StyleGenerator {
    constructor(config) {
        this.config = config;
    }
    
    generate() {
        const colors = this.config.ui.colors;
        
        return `
        :root {
            --primary-color: ${colors.primary};
            --secondary-color: ${colors.secondary};
            --success-color: ${colors.success};
            --warning-color: ${colors.warning};
            --error-color: ${colors.error};
            --background-color: ${colors.background};
            --surface-color: ${colors.surface};
            --text-color: ${colors.text};
        }
        
        .feedback-form-container {
            background: var(--background-color);
            color: var(--text-color);
        }
        
        .form-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, ${this.lighten(colors.primary, 20)} 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .star.active {
            color: var(--warning-color);
        }
        
        .issue-btn.selected {
            background: var(--primary-color);
            color: white;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, var(--success-color) 0%, ${this.darken(colors.success, 10)} 100%);
            color: white;
        }
        
        ${this.generateStatusColors()}
        `;
    }
    
    generateStatusColors() {
        return this.config.workflow.statuses
            .filter(status => status.color)
            .map(status => `
                .status-${status.value} {
                    border-color: ${status.color};
                    background: ${this.lighten(status.color, 95)};
                }
            `).join('\n');
    }
    
    lighten(color, percent) {
        // Simple color lightening function
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    darken(color, percent) {
        return this.lighten(color, -percent);
    }
}
```

## Email Template Customization

### Template Engine Integration

```javascript
// services/email-template-service.js
class EmailTemplateService {
    constructor(config) {
        this.config = config;
        this.handlebars = require('handlebars');
        this.loadTemplates();
    }
    
    loadTemplates() {
        this.templates = {
            leadNotification: this.compileTemplate('lead-notification'),
            followUpReminder: this.compileTemplate('follow-up-reminder'),
            thankYou: this.compileTemplate('thank-you')
        };
    }
    
    compileTemplate(templateName) {
        const templatePath = `./templates/${this.config.business.industry}/${templateName}.hbs`;
        const fallbackPath = `./templates/default/${templateName}.hbs`;
        
        try {
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            return this.handlebars.compile(templateSource);
        } catch (error) {
            console.warn(`Industry-specific template not found, using fallback: ${templateName}`);
            const fallbackSource = fs.readFileSync(fallbackPath, 'utf8');
            return this.handlebars.compile(fallbackSource);
        }
    }
    
    generateEmail(templateName, data) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }
        
        const mergedData = {
            ...data,
            business: this.config.business,
            colors: this.config.ui.colors,
            industry: this.config.business.industry
        };
        
        return template(mergedData);
    }
    
    // Helper functions for templates
    registerHelpers() {
        this.handlebars.registerHelper('formatCurrency', (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });
        
        this.handlebars.registerHelper('formatDate', (date) => {
            return new Date(date).toLocaleDateString();
        });
        
        this.handlebars.registerHelper('statusColor', (status) => {
            const statusConfig = this.config.workflow.statuses.find(s => s.value === status);
            return statusConfig?.color || '#64748B';
        });
    }
}
```

## Multi-Language Support

### Internationalization Setup

```javascript
// i18n/index.js
class I18nManager {
    constructor(config) {
        this.config = config;
        this.currentLanguage = config.defaultLanguage || 'en';
        this.translations = {};
        this.loadTranslations();
    }
    
    loadTranslations() {
        const languages = ['en', 'es', 'fr', 'de', 'zh'];
        
        languages.forEach(lang => {
            try {
                this.translations[lang] = {
                    ...require(`./locales/${lang}/common.json`),
                    ...require(`./locales/${lang}/${this.config.business.industry}.json`)
                };
            } catch (error) {
                // Fallback to English if industry-specific translation doesn't exist
                this.translations[lang] = require(`./locales/${lang}/common.json`);
            }
        });
    }
    
    t(key, params = {}) {
        const keys = key.split('.');
        let translation = keys.reduce((obj, k) => obj && obj[k], 
            this.translations[this.currentLanguage]);
        
        if (!translation) {
            // Fallback to English
            translation = keys.reduce((obj, k) => obj && obj[k], 
                this.translations['en']);
        }
        
        if (!translation) {
            return key; // Return key if no translation found
        }
        
        // Replace parameters
        return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] || match;
        });
    }
    
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
        }
    }
    
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// Usage in templates
const i18n = new I18nManager(config);

// In form generation
const formTitle = i18n.t('form.title');
const ratingLabel = i18n.t('rating.label');
const submitButton = i18n.t('buttons.submit');
```

### Language Files

```json
// i18n/locales/en/real-estate.json
{
    "form": {
        "title": "Property Lead Feedback",
        "subtitle": "Help us improve our property leads"
    },
    "fields": {
        "budget": "Budget Range",
        "timeline": "Purchase Timeline", 
        "preApproval": "Financing Status",
        "location": "Preferred Location"
    },
    "statuses": {
        "viewing-scheduled": "Property viewing scheduled",
        "viewed-properties": "Shown properties",
        "offer-submitted": "Offer submitted",
        "under-contract": "Under contract",
        "closed": "Sale closed"
    },
    "issues": {
        "unrealistic-expectations": "Unrealistic price expectations",
        "financing-issues": "Financing/pre-approval problems",
        "location-changed": "Changed location preference"
    }
}
```

```json
// i18n/locales/es/real-estate.json
{
    "form": {
        "title": "Comentarios sobre Propiedades",
        "subtitle": "Ayúdanos a mejorar nuestras propiedades"
    },
    "fields": {
        "budget": "Rango de Presupuesto",
        "timeline": "Cronograma de Compra",
        "preApproval": "Estado de Financiamiento",
        "location": "Ubicación Preferida"
    },
    "statuses": {
        "viewing-scheduled": "Visita de propiedad programada",
        "viewed-properties": "Propiedades mostradas",
        "offer-submitted": "Oferta enviada",
        "under-contract": "Bajo contrato",
        "closed": "Venta cerrada"
    }
}
```

## Analytics Customization

### Industry-Specific KPIs

```javascript
// analytics/industry-kpis.js
const industryKPIs = {
    'real-estate': [
        {
            name: 'averageDaysToClose',
            label: 'Average Days to Close',
            calculation: 'avg',
            field: 'days_to_close',
            format: 'number',
            suffix: ' days'
        },
        {
            name: 'averageCommission',
            label: 'Average Commission',
            calculation: 'avg',
            field: 'commission_amount',
            format: 'currency'
        },
        {
            name: 'showingToOfferRate',
            label: 'Showing to Offer Rate',
            calculation: 'percentage',
            numerator: 'offer-submitted',
            denominator: 'viewed-properties',
            format: 'percentage'
        }
    ],
    
    'b2b-software': [
        {
            name: 'salesCycleLength',
            label: 'Average Sales Cycle',
            calculation: 'avg',
            field: 'sales_cycle_days',
            format: 'number',
            suffix: ' days'
        },
        {
            name: 'demoToCloseRate',
            label: 'Demo to Close Rate',
            calculation: 'percentage',
            numerator: 'closed-won',
            denominator: 'demo-completed',
            format: 'percentage'
        },
        {
            name: 'averageDealSize',
            label: 'Average Deal Size',
            calculation: 'avg',
            field: 'deal_amount',
            format: 'currency'
        }
    ],
    
    'automotive': [
        {
            name: 'testDriveToSaleRate',
            label: 'Test Drive to Sale Rate',
            calculation: 'percentage',
            numerator: 'sold',
            denominator: 'test-drive',
            format: 'percentage'
        },
        {
            name: 'averageGrossProfit',
            label: 'Average Gross Profit',
            calculation: 'avg',
            field: 'gross_profit',
            format: 'currency'
        },
        {
            name: 'financeRate',
            label: 'Finance Penetration',
            calculation: 'percentage',
            numerator: 'financing',
            denominator: 'sold',
            format: 'percentage'
        }
    ]
};

class IndustryAnalytics {
    constructor(industry) {
        this.industry = industry;
        this.kpis = industryKPIs[industry] || [];
    }
    
    async calculateKPIs(dateRange, filters = {}) {
        const results = {};
        
        for (const kpi of this.kpis) {
            try {
                results[kpi.name] = await this.calculateKPI(kpi, dateRange, filters);
            } catch (error) {
                console.error(`Error calculating KPI ${kpi.name}:`, error);
                results[kpi.name] = null;
            }
        }
        
        return results;
    }
    
    async calculateKPI(kpi, dateRange, filters) {
        switch (kpi.calculation) {
            case 'avg':
                return await this.calculateAverage(kpi, dateRange, filters);
            case 'percentage':
                return await this.calculatePercentage(kpi, dateRange, filters);
            case 'sum':
                return await this.calculateSum(kpi, dateRange, filters);
            default:
                throw new Error(`Unknown calculation type: ${kpi.calculation}`);
        }
    }
    
    formatKPIValue(kpi, value) {
        if (value === null || value === undefined) return 'N/A';
        
        switch (kpi.format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'number':
                return value.toFixed(kpi.decimals || 0) + (kpi.suffix || '');
            default:
                return value.toString();
        }
    }
}
```

## Testing Configuration

### Industry-Specific Test Data

```javascript
// tests/fixtures/industry-data.js
const industryTestData = {
    'real-estate': {
        sampleLead: {
            name: "Sarah Johnson",
            email: "sarah.johnson@email.com",
            phone: "+1-555-0123",
            budget: "$500K-$750K",
            timeline: "1-3 months",
            preApproval: "Pre-approved",
            location: "Downtown Seattle",
            motivation: "Outgrown current home",
            score: 85
        },
        sampleFeedback: {
            rating: 4,
            status: "viewed-properties",
            issues: [],
            comments: "Great lead, very motivated buyer"
        }
    },
    
    'b2b-software': {
        sampleLead: {
            name: "Michael Chen",
            email: "m.chen@techcorp.com",
            phone: "+1-555-0456",
            company: "TechCorp Inc",
            title: "CTO",
            companySize: "Mid-market (100-500 employees)",
            budget: "$100K-$500K annually",
            authority: "C-level executive",
            need: "Critical business problem",
            timeline: "This quarter",
            score: 92
        },
        sampleFeedback: {
            rating: 5,
            status: "demo-scheduled",
            issues: [],
            comments: "Excellent prospect, clear business need"
        }
    }
};

function generateTestData(industry, count = 10) {
    const template = industryTestData[industry];
    if (!template) {
        throw new Error(`No test data template for industry: ${industry}`);
    }
    
    return Array.from({ length: count }, (_, i) => ({
        ...template.sampleLead,
        name: `Test Lead ${i + 1}`,
        email: `testlead${i + 1}@example.com`,
        score: Math.floor(Math.random() * 40) + 60 // 60-100 range
    }));
}

module.exports = { industryTestData, generateTestData };
```

This adaptation guide provides a comprehensive framework for customizing the feedback system for different industries, with complete configuration management, dynamic form generation, multi-language support, and industry-specific analytics.