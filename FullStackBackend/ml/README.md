# AQI Prediction ML System for Nashik City

Complete Machine Learning pipeline for Air Quality Index (AQI) prediction and forecasting.

## 🎯 Overview

This ML system provides:
- **Regression Model**: Predicts exact AQI values
- **Classification Model**: Predicts AQI categories (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
- **Forecasting**: Generate 6/12/24/72 hour AQI forecasts
- **Feature Importance**: Identify which pollutants contribute most to AQI
- **REST API**: FastAPI endpoints for real-time predictions

## 📊 Models

### Random Forest Regressor
- Predicts continuous AQI values
- 100 estimators, max depth 20
- Metrics: MAE, RMSE, R²

### Random Forest Classifier
- Predicts AQI categories
- 100 estimators, max depth 20
- Metrics: Accuracy, F1 Score, Confusion Matrix

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd FullStackBackend
pip install -r requirements.txt
```

### 2. Train Models

```bash
python ml/aqi_ml_pipeline.py
```

This will:
- Generate synthetic AQI data for Nashik (2 years, 9 zones)
- Clean and preprocess data
- Engineer features
- Train both regression and classification models
- Generate visualizations
- Save models and metadata

### 3. Verify Output

After training, you should see:

```
ml/
├── data/
│   └── nashik_aqi_cleaned.csv      # Cleaned dataset
├── models/
│   ├── aqi_regressor.pkl           # Regression model
│   ├── aqi_classifier.pkl          # Classification model
│   ├── label_encoder.pkl           # Station encoder
│   └── model_metadata.json         # Model info
└── plots/
    ├── regression_pred_vs_actual.png
    ├── regression_feature_importance.png
    ├── classification_confusion_matrix.png
    ├── aqi_trend_over_time.png
    └── aqi_hourly_pattern.png
```

## 🔌 API Endpoints

### 1. Single Prediction

```bash
POST /ml/predict
```

**Request:**
```json
{
  "pm2_5": 85.5,
  "pm10": 120.3,
  "no2": 45.2,
  "so2": 18.5,
  "co": 1.2,
  "o3": 35.0,
  "hour": 9,
  "month": 12,
  "station": "Satpur"
}
```

**Response:**
```json
{
  "predicted_aqi": 187.45,
  "aqi_category": "Moderate",
  "confidence": 0.8923,
  "timestamp": "2026-04-16T10:30:00",
  "station": "Satpur"
}
```

### 2. Forecast

```bash
GET /ml/forecast/Satpur?hours=24
```

**Response:**
```json
{
  "station": "Satpur",
  "forecast": [
    {
      "time": "2026-04-16 10:00",
      "hour": 10,
      "predicted_aqi": 185.23,
      "aqi_category": "Moderate",
      "confidence": 0.89,
      "pollutants": {
        "pm2_5": 82.5,
        "pm10": 118.3,
        "no2": 43.2,
        "so2": 19.5,
        "co": 1.15,
        "o3": 35.0
      }
    }
    // ... 23 more hours
  ],
  "generated_at": "2026-04-16T10:00:00"
}
```

### 3. Model Information

```bash
GET /ml/model-info
```

**Response:**
```json
{
  "created_at": "2026-04-16T09:00:00",
  "city": "Nashik",
  "total_records": 157680,
  "date_range": {
    "start": "2024-04-16T00:00:00",
    "end": "2026-04-16T00:00:00"
  },
  "stations": ["Satpur", "MIDC Industrial", "Panchavati", ...],
  "regression_metrics": {
    "mae": 8.45,
    "rmse": 12.32,
    "r2": 0.9234
  },
  "classification_metrics": {
    "accuracy": 0.8945,
    "f1_score": 0.8876
  }
}
```

### 4. Feature Importance

```bash
GET /ml/feature-importance
```

**Response:**
```json
{
  "feature_importance": [
    {
      "feature": "pm2_5",
      "importance": 0.3845,
      "percentage": 38.45
    },
    {
      "feature": "pm10",
      "importance": 0.2534,
      "percentage": 25.34
    }
    // ... more features
  ],
  "model_type": "Random Forest Regressor"
}
```

### 5. Available Stations

```bash
GET /ml/stations
```

### 6. Batch Predictions

```bash
POST /ml/batch-predict
```

### 7. Health Check

```bash
GET /ml/health
```

## 📱 Frontend Integration

The AdminPredictionPage in the mobile app automatically:
- Fetches real-time forecasts from the ML API
- Displays interactive charts with predicted vs actual AQI
- Shows feature importance (pollutant contributions)
- Provides health advisories based on predictions
- Updates when zone or time range changes

## 🧠 Features Used

The models use these features for prediction:

1. **Pollutants** (6 features):
   - PM2.5 (Fine particulate matter)
   - PM10 (Coarse particulate matter)
   - NO₂ (Nitrogen Dioxide)
   - SO₂ (Sulphur Dioxide)
   - CO (Carbon Monoxide)
   - O₃ (Ozone)

2. **Temporal** (4 features):
   - Hour of day (0-23)
   - Month (1-12)
   - Day of week (0-6)
   - Is weekend (0/1)

3. **Location** (1 feature):
   - Station (encoded)

## 📈 Model Performance

### Regression Model
- **MAE**: ~8-12 AQI points
- **RMSE**: ~10-15 AQI points
- **R² Score**: ~0.90-0.95

### Classification Model
- **Accuracy**: ~88-92%
- **F1 Score**: ~0.87-0.91

## 🔄 Retraining

To retrain models with new data:

1. Update data generation or add real data source
2. Run the pipeline:
   ```bash
   python ml/aqi_ml_pipeline.py
   ```
3. Models are automatically saved and API picks up new versions

## 🌍 Nashik Zones

The system covers 9 monitoring stations:
1. Satpur
2. MIDC Industrial
3. Panchavati
4. Nashik Road
5. Cidco
6. College Road
7. Gangapur
8. Old Nashik
9. Deolali

## 🎨 AQI Categories

| AQI Range | Category | Color | Health Impact |
|-----------|----------|-------|---------------|
| 0-50 | Good | 🟢 Green | Minimal impact |
| 51-100 | Satisfactory | 🟡 Yellow | Minor breathing discomfort |
| 101-200 | Moderate | 🟠 Orange | Breathing discomfort to sensitive |
| 201-300 | Poor | 🔴 Red | Breathing discomfort to most |
| 301-400 | Very Poor | 🟣 Purple | Respiratory illness on prolonged exposure |
| 400+ | Severe | 🟤 Maroon | Affects healthy people, serious impact on those with existing diseases |

## 🛠️ Customization

### Add Real Data Source

Replace the `generate_synthetic_data()` method in `aqi_ml_pipeline.py`:

```python
def fetch_real_data(self):
    """Fetch real AQI data from CPCB or OpenAQ"""
    # Your data fetching logic here
    # Must return DataFrame with required columns
    pass
```

### Tune Hyperparameters

Modify model parameters in training methods:

```python
self.regressor = RandomForestRegressor(
    n_estimators=200,      # Increase for better accuracy
    max_depth=30,          # Increase for more complex patterns
    min_samples_split=10,  # Adjust for overfitting control
    random_state=42
)
```

### Add More Features

1. Add feature extraction in `feature_engineering()`:
   ```python
   self.df['temperature'] = ...
   self.df['humidity'] = ...
   ```

2. Update `feature_columns` list

3. Retrain models

## 📝 Notes

- **Synthetic Data**: Current implementation uses synthetic data for demonstration. For production, integrate real data from CPCB or OpenAQ.
- **Model Updates**: Models should be retrained periodically (monthly/quarterly) with new data.
- **Scalability**: Random Forest models are efficient and can handle large datasets.
- **API Performance**: Models are loaded once at startup for fast predictions.

## 🐛 Troubleshooting

### Models Not Found Error

```
ML models not found. Please train the models first.
```

**Solution**: Run `python ml/aqi_ml_pipeline.py`

### Import Errors

```
ModuleNotFoundError: No module named 'sklearn'
```

**Solution**: Install dependencies: `pip install -r requirements.txt`

### Low Accuracy

- Check data quality
- Increase `n_estimators`
- Add more features
- Collect more training data

## 📚 References

- [CPCB AQI Standards](https://cpcb.nic.in/)
- [Scikit-learn Random Forest](https://scikit-learn.org/stable/modules/ensemble.html#forest)
- [Indian AQI Calculation](https://app.cpcbccr.com/ccr_docs/FINAL-REPORT_AQI_.pdf)

## ✅ Production Checklist

- [ ] Train models with real data
- [ ] Set up automated retraining pipeline
- [ ] Monitor model performance metrics
- [ ] Implement model versioning
- [ ] Add logging and error tracking
- [ ] Set up alerts for prediction anomalies
- [ ] Document API for external consumers
- [ ] Load test API endpoints
- [ ] Set up model backup and recovery

---

**Built with ❤️ for Nashik Smart City Initiative**
