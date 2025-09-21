/**
 * Analytics Schema
 * 
 * Comprehensive analytics and metrics tracking system for
 * platform performance, user behavior, and business intelligence.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  // Analytics Identification
  analyticsId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Metric Information
  metric: {
    name: {
      type: String,
      required: [true, 'Metric name is required'],
      trim: true,
      index: true
    },
    
    category: {
      type: String,
      required: [true, 'Metric category is required'],
      enum: [
        'user_engagement', 'job_performance', 'application_funnel',
        'conversion_rates', 'platform_usage', 'financial_metrics',
        'system_performance', 'content_metrics', 'search_analytics',
        'notification_metrics', 'mobile_analytics', 'geographic_data'
      ],
      index: true
    },
    
    type: {
      type: String,
      required: [true, 'Metric type is required'],
      enum: [
        'counter', 'gauge', 'histogram', 'rate', 'percentage',
        'duration', 'frequency', 'distribution', 'trend'
      ],
      index: true
    },
    
    unit: {
      type: String,
      enum: [
        'count', 'percentage', 'seconds', 'minutes', 'hours', 'days',
        'bytes', 'kilobytes', 'megabytes', 'currency', 'ratio', 'score'
      ],
      default: 'count'
    }
  },
  
  // Time Dimensions
  time: {
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      index: true
    },
    
    period: {
      type: String,
      required: [true, 'Time period is required'],
      enum: ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'],
      index: true
    },
    
    periodStart: {
      type: Date,
      required: true,
      index: true
    },
    
    periodEnd: {
      type: Date,
      required: true,
      index: true
    },
    
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      index: true
    },
    
    hourOfDay: {
      type: Number,
      min: 0,
      max: 23,
      index: true
    },
    
    isWeekend: {
      type: Boolean,
      index: true
    },
    
    isHoliday: {
      type: Boolean,
      default: false
    }
  },
  
  // Metric Values
  values: {
    current: {
      type: Number,
      required: [true, 'Current value is required']
    },
    
    previous: {
      type: Number,
      default: 0
    },
    
    change: {
      absolute: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    
    // Statistical measures
    statistics: {
      min: Number,
      max: Number,
      mean: Number,
      median: Number,
      mode: Number,
      standardDeviation: Number,
      variance: Number,
      percentile25: Number,
      percentile75: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    // Aggregated values
    aggregations: {
      sum: Number,
      average: Number,
      count: Number,
      distinctCount: Number,
      movingAverage7d: Number,
      movingAverage30d: Number
    }
  },
  
  // Dimensional Data
  dimensions: {
    // User dimensions
    user: {
      role: {
        type: String,
        enum: ['applicant', 'recruiter', 'admin', 'all'],
        index: true
      },
      segment: {
        type: String,
        enum: ['new', 'returning', 'active', 'inactive', 'premium', 'free'],
        index: true
      },
      cohort: {
        type: String,
        trim: true,
        index: true
      }
    },
    
    // Geographic dimensions
    geography: {
      country: {
        type: String,
        trim: true,
        index: true
      },
      state: {
        type: String,
        trim: true,
        index: true
      },
      city: {
        type: String,
        trim: true,
        index: true
      },
      region: {
        type: String,
        enum: ['north', 'south', 'east', 'west', 'central', 'northeast'],
        index: true
      }
    },
    
    // Platform dimensions
    platform: {
      device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        index: true
      },
      os: {
        type: String,
        enum: ['windows', 'macos', 'linux', 'ios', 'android', 'other'],
        index: true
      },
      browser: {
        type: String,
        enum: ['chrome', 'firefox', 'safari', 'edge', 'other'],
        index: true
      },
      source: {
        type: String,
        enum: ['direct', 'search', 'social', 'email', 'referral', 'advertisement'],
        index: true
      }
    },
    
    // Business dimensions
    business: {
      industry: {
        type: String,
        trim: true,
        index: true
      },
      jobCategory: {
        type: String,
        trim: true,
        index: true
      },
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        index: true
      },
      experienceLevel: {
        type: String,
        enum: ['fresher', 'entry', 'mid', 'senior', 'executive'],
        index: true
      }
    },
    
    // Custom dimensions
    custom: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Event Context
  context: {
    eventType: {
      type: String,
      trim: true,
      index: true
    },
    
    resourceType: {
      type: String,
      enum: ['job', 'application', 'user', 'company', 'interview', 'notification'],
      index: true
    },
    
    resourceId: {
      type: String,
      trim: true,
      index: true
    },
    
    sessionId: {
      type: String,
      trim: true,
      index: true
    },
    
    campaignId: {
      type: String,
      trim: true,
      index: true
    },
    
    experimentId: {
      type: String,
      trim: true,
      index: true
    },
    
    variant: {
      type: String,
      trim: true,
      index: true
    }
  },
  
  // Data Quality & Metadata
  quality: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    
    completeness: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    
    freshness: {
      type: Number, // minutes since data was collected
      default: 0
    },
    
    source: {
      type: String,
      enum: ['real_time', 'batch', 'manual', 'estimated', 'calculated'],
      default: 'real_time'
    },
    
    methodology: {
      type: String,
      trim: true
    },
    
    sampleSize: {
      type: Number,
      min: 0
    }
  },
  
  // Alerts & Thresholds
  alerts: {
    thresholds: [{
      type: {
        type: String,
        enum: ['upper', 'lower', 'range', 'change'],
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'warning'
      },
      isTriggered: {
        type: Boolean,
        default: false
      },
      triggeredAt: Date,
      message: {
        type: String,
        trim: true
      }
    }],
    
    anomalyDetection: {
      isAnomaly: {
        type: Boolean,
        default: false
      },
      anomalyScore: {
        type: Number,
        min: 0,
        max: 1
      },
      anomalyType: {
        type: String,
        enum: ['spike', 'drop', 'trend_change', 'seasonal_deviation']
      },
      detectedAt: Date
    }
  },
  
  // Forecasting & Predictions
  forecasting: {
    predictions: [{
      horizon: {
        type: String,
        enum: ['1h', '1d', '1w', '1m', '3m', '6m', '1y'],
        required: true
      },
      predictedValue: {
        type: Number,
        required: true
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      upperBound: Number,
      lowerBound: Number,
      model: {
        type: String,
        enum: ['linear', 'exponential', 'seasonal', 'arima', 'ml'],
        default: 'linear'
      },
      accuracy: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    trends: {
      direction: {
        type: String,
        enum: ['up', 'down', 'stable', 'volatile']
      },
      strength: {
        type: Number,
        min: 0,
        max: 1
      },
      seasonality: {
        detected: Boolean,
        period: String,
        amplitude: Number
      }
    }
  },
  
  // Benchmarking
  benchmarks: {
    industry: {
      value: Number,
      percentile: Number,
      source: String,
      lastUpdated: Date
    },
    
    historical: {
      sameTimeLastYear: Number,
      sameTimeLastMonth: Number,
      sameTimeLastWeek: Number,
      bestEver: Number,
      worstEver: Number
    },
    
    targets: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      quarterly: Number,
      yearly: Number
    }
  },
  
  // Data Processing
  processing: {
    processedAt: {
      type: Date,
      default: Date.now
    },
    
    processingTime: {
      type: Number // milliseconds
    },
    
    dataSource: {
      type: String,
      required: true,
      trim: true
    },
    
    pipeline: {
      type: String,
      trim: true
    },
    
    version: {
      type: String,
      default: '1.0.0'
    },
    
    checksum: {
      type: String,
      trim: true
    }
  },
  
  // Tags & Labels
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  labels: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  versionKey: false,
  // Auto-delete old analytics data after 2 years
  expires: '730d'
});

// Indexes for better query performance
AnalyticsSchema.index({ analyticsId: 1 });
AnalyticsSchema.index({ 'metric.name': 1, 'time.period': 1, 'time.periodStart': -1 });
AnalyticsSchema.index({ 'metric.category': 1, 'time.timestamp': -1 });
AnalyticsSchema.index({ 'time.periodStart': -1, 'time.periodEnd': -1 });
AnalyticsSchema.index({ 'dimensions.user.role': 1, 'time.timestamp': -1 });
AnalyticsSchema.index({ 'dimensions.geography.country': 1, 'dimensions.geography.state': 1 });
AnalyticsSchema.index({ 'dimensions.platform.device': 1, 'dimensions.platform.source': 1 });
AnalyticsSchema.index({ 'context.eventType': 1, 'context.resourceType': 1 });
AnalyticsSchema.index({ 'alerts.thresholds.isTriggered': 1, 'alerts.anomalyDetection.isAnomaly': 1 });

// Compound indexes for common queries
AnalyticsSchema.index({ 
  'metric.name': 1, 
  'dimensions.user.role': 1, 
  'time.period': 1,
  'time.periodStart': -1 
});

AnalyticsSchema.index({ 
  'metric.category': 1, 
  'dimensions.geography.country': 1,
  'time.timestamp': -1 
});

// Text index for searching
AnalyticsSchema.index({ 
  'metric.name': 'text',
  'metric.category': 'text',
  tags: 'text'
});

// Virtual for growth rate
AnalyticsSchema.virtual('growthRate').get(function() {
  if (!this.values.previous || this.values.previous === 0) return null;
  return ((this.values.current - this.values.previous) / this.values.previous * 100).toFixed(2);
});

// Virtual for performance vs target
AnalyticsSchema.virtual('targetPerformance').get(function() {
  const target = this.benchmarks.targets[this.time.period];
  if (!target) return null;
  return ((this.values.current / target) * 100).toFixed(2);
});

// Pre-save middleware
AnalyticsSchema.pre('save', function(next) {
  // Generate analytics ID if not exists
  if (!this.analyticsId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.analyticsId = `ANA-${timestamp}-${random}`.toUpperCase();
  }
  
  // Calculate change values
  if (this.values.previous !== undefined) {
    this.values.change.absolute = this.values.current - this.values.previous;
    
    if (this.values.previous !== 0) {
      this.values.change.percentage = 
        ((this.values.current - this.values.previous) / Math.abs(this.values.previous)) * 100;
    }
  }
  
  // Set time dimensions
  const timestamp = new Date(this.time.timestamp);
  this.time.dayOfWeek = timestamp.getDay();
  this.time.hourOfDay = timestamp.getHours();
  this.time.isWeekend = (timestamp.getDay() === 0 || timestamp.getDay() === 6);
  
  // Check alert thresholds
  this.alerts.thresholds.forEach(threshold => {
    let isTriggered = false;
    
    switch (threshold.type) {
      case 'upper':
        isTriggered = this.values.current > threshold.value;
        break;
      case 'lower':
        isTriggered = this.values.current < threshold.value;
        break;
      case 'change':
        isTriggered = Math.abs(this.values.change.percentage) > threshold.value;
        break;
    }
    
    if (isTriggered && !threshold.isTriggered) {
      threshold.isTriggered = true;
      threshold.triggeredAt = new Date();
    } else if (!isTriggered && threshold.isTriggered) {
      threshold.isTriggered = false;
    }
  });
  
  next();
});

// Static methods
AnalyticsSchema.statics.getMetricTrend = function(metricName, period = 'day', days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        'metric.name': metricName,
        'time.period': period,
        'time.periodStart': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $sort: { 'time.periodStart': 1 }
    },
    {
      $project: {
        date: '$time.periodStart',
        value: '$values.current',
        change: '$values.change.percentage'
      }
    }
  ]);
};

AnalyticsSchema.statics.getTopMetrics = function(category, limit = 10) {
  return this.aggregate([
    {
      $match: {
        'metric.category': category,
        'time.period': 'day',
        'time.periodStart': {
          $gte: new Date(new Date().setDate(new Date().getDate() - 1))
        }
      }
    },
    {
      $group: {
        _id: '$metric.name',
        latestValue: { $last: '$values.current' },
        avgValue: { $avg: '$values.current' },
        totalValue: { $sum: '$values.current' },
        changePercentage: { $last: '$values.change.percentage' }
      }
    },
    {
      $sort: { latestValue: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

AnalyticsSchema.statics.getDashboardMetrics = function(role = 'all') {
  const matchCondition = {
    'time.period': 'day',
    'time.periodStart': {
      $gte: new Date(new Date().setDate(new Date().getDate() - 7))
    }
  };
  
  if (role !== 'all') {
    matchCondition['dimensions.user.role'] = role;
  }
  
  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          category: '$metric.category',
          name: '$metric.name'
        },
        currentValue: { $last: '$values.current' },
        previousValue: { $first: '$values.current' },
        avgValue: { $avg: '$values.current' },
        maxValue: { $max: '$values.current' },
        minValue: { $min: '$values.current' }
      }
    },
    {
      $addFields: {
        changePercentage: {
          $cond: [
            { $eq: ['$previousValue', 0] },
            0,
            {
              $multiply: [
                { $divide: [
                  { $subtract: ['$currentValue', '$previousValue'] },
                  '$previousValue'
                ]},
                100
              ]
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        metrics: {
          $push: {
            name: '$_id.name',
            current: '$currentValue',
            change: '$changePercentage',
            avg: '$avgValue',
            max: '$maxValue',
            min: '$minValue'
          }
        }
      }
    }
  ]);
};

// Instance methods
AnalyticsSchema.methods.addPrediction = function(horizon, predictedValue, confidence, model = 'linear') {
  this.forecasting.predictions.push({
    horizon,
    predictedValue,
    confidence,
    model,
    createdAt: new Date()
  });
  
  return this.save();
};

AnalyticsSchema.methods.updateBenchmark = function(type, value, source = null) {
  if (this.benchmarks[type]) {
    this.benchmarks[type].value = value;
    this.benchmarks[type].lastUpdated = new Date();
    if (source) {
      this.benchmarks[type].source = source;
    }
  }
  
  return this.save();
};

AnalyticsSchema.methods.detectAnomaly = function(threshold = 2) {
  // Simple anomaly detection using standard deviation
  if (this.values.statistics && this.values.statistics.standardDeviation) {
    const zScore = Math.abs(
      (this.values.current - this.values.statistics.mean) / this.values.statistics.standardDeviation
    );
    
    if (zScore > threshold) {
      this.alerts.anomalyDetection.isAnomaly = true;
      this.alerts.anomalyDetection.anomalyScore = Math.min(zScore / 3, 1); // Normalize to 0-1
      this.alerts.anomalyDetection.detectedAt = new Date();
      
      // Determine anomaly type
      if (this.values.current > this.values.statistics.mean) {
        this.alerts.anomalyDetection.anomalyType = 'spike';
      } else {
        this.alerts.anomalyDetection.anomalyType = 'drop';
      }
    }
  }
  
  return this.save();
};

export default AnalyticsSchema;
