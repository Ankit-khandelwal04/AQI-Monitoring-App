"""
AQI Prediction ML Pipeline for Nashik City
Complete automated pipeline from data collection to model training
"""

import pandas as pd
import numpy as np
import requests
import pickle
import json
from datetime import datetime, timedelta
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, classification_report

# Visualization
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

# Create directories
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = BASE_DIR / 'models'
PLOTS_DIR = BASE_DIR / 'plots'

for dir_path in [DATA_DIR, MODELS_DIR, PLOTS_DIR]:
    dir_path.mkdir(exist_ok=True, parents=True)

print("🚀 AQI Prediction ML Pipeline for Nashik City")
print("=" * 60)


class AQIPipeline:
    """Complete ML Pipeline for AQI Prediction"""
    
    def __init__(self):
        self.df = None
        self.regressor = None
        self.classifier = None
        self.label_encoder = None
        self.feature_columns = []
        
    def calculate_aqi(self, pm25, pm10, no2, so2, co, o3=None):
        """Calculate AQI based on pollutant concentrations"""
        # Simplified AQI calculation (Indian standards)
        aqi_values = []
        
        # PM2.5 breakpoints (µg/m³)
        if pm25 is not None and not np.isnan(pm25):
            if pm25 <= 30: aqi_pm25 = pm25 * 50 / 30
            elif pm25 <= 60: aqi_pm25 = 50 + (pm25 - 30) * 50 / 30
            elif pm25 <= 90: aqi_pm25 = 100 + (pm25 - 60) * 100 / 30
            elif pm25 <= 120: aqi_pm25 = 200 + (pm25 - 90) * 100 / 30
            elif pm25 <= 250: aqi_pm25 = 300 + (pm25 - 120) * 100 / 130
            else: aqi_pm25 = 400 + (pm25 - 250) * 100 / 130
            aqi_values.append(aqi_pm25)
        
        # PM10 breakpoints (µg/m³)
        if pm10 is not None and not np.isnan(pm10):
            if pm10 <= 50: aqi_pm10 = pm10 * 50 / 50
            elif pm10 <= 100: aqi_pm10 = 50 + (pm10 - 50) * 50 / 50
            elif pm10 <= 250: aqi_pm10 = 100 + (pm10 - 100) * 100 / 150
            elif pm10 <= 350: aqi_pm10 = 200 + (pm10 - 250) * 100 / 100
            elif pm10 <= 430: aqi_pm10 = 300 + (pm10 - 350) * 100 / 80
            else: aqi_pm10 = 400 + (pm10 - 430) * 100 / 80
            aqi_values.append(aqi_pm10)
        
        # NO2 breakpoints (µg/m³)
        if no2 is not None and not np.isnan(no2):
            if no2 <= 40: aqi_no2 = no2 * 50 / 40
            elif no2 <= 80: aqi_no2 = 50 + (no2 - 40) * 50 / 40
            elif no2 <= 180: aqi_no2 = 100 + (no2 - 80) * 100 / 100
            elif no2 <= 280: aqi_no2 = 200 + (no2 - 180) * 100 / 100
            elif no2 <= 400: aqi_no2 = 300 + (no2 - 280) * 100 / 120
            else: aqi_no2 = 400 + (no2 - 400) * 100 / 120
            aqi_values.append(aqi_no2)
        
        return max(aqi_values) if aqi_values else None
    
    def generate_synthetic_data(self):
        """Generate synthetic AQI data for Nashik city"""
        print("\n📊 Generating synthetic AQI data for Nashik...")
        
        # Generate 2 years of hourly data
        start_date = datetime.now() - timedelta(days=730)
        dates = pd.date_range(start=start_date, periods=17520, freq='H')
        
        # Nashik zones
        zones = ['Satpur', 'MIDC Industrial', 'Panchavati', 'Nashik Road', 
                 'Cidco', 'College Road', 'Gangapur', 'Old Nashik', 'Deolali']
        
        data = []
        for zone in zones:
            # Base pollution levels (higher for industrial areas)
            base_pm25 = 80 if 'Industrial' in zone or 'MIDC' in zone else 60
            base_pm10 = 120 if 'Industrial' in zone or 'MIDC' in zone else 90
            
            for date in dates:
                hour = date.hour
                month = date.month
                
                # Seasonal variation (winter has higher pollution)
                seasonal_factor = 1.4 if month in [11, 12, 1, 2] else 1.0
                
                # Daily pattern (higher during morning and evening rush hours)
                if hour in [7, 8, 9, 18, 19, 20]:
                    time_factor = 1.3
                elif hour in [0, 1, 2, 3, 4, 5]:
                    time_factor = 0.7
                else:
                    time_factor = 1.0
                
                # Add random variation
                pm25 = base_pm25 * seasonal_factor * time_factor * np.random.uniform(0.8, 1.2)
                pm10 = base_pm10 * seasonal_factor * time_factor * np.random.uniform(0.8, 1.2)
                no2 = np.random.uniform(30, 80) * seasonal_factor * time_factor
                so2 = np.random.uniform(10, 40) * seasonal_factor
                co = np.random.uniform(0.5, 2.0) * seasonal_factor * time_factor
                o3 = np.random.uniform(20, 60)
                
                # Calculate AQI
                aqi = self.calculate_aqi(pm25, pm10, no2, so2, co, o3)
                
                data.append({
                    'datetime': date,
                    'city': 'Nashik',
                    'station': zone,
                    'pm2_5': round(pm25, 2),
                    'pm10': round(pm10, 2),
                    'no2': round(no2, 2),
                    'so2': round(so2, 2),
                    'co': round(co, 2),
                    'o3': round(o3, 2),
                    'aqi': round(aqi, 2) if aqi else None
                })
        
        self.df = pd.DataFrame(data)
        print(f"✅ Generated {len(self.df)} records for {len(zones)} zones")
        return self.df
    
    def clean_and_preprocess(self):
        """Clean and preprocess the dataset"""
        print("\n🧹 Cleaning and preprocessing data...")
        
        # Remove duplicates
        initial_count = len(self.df)
        self.df = self.df.drop_duplicates()
        print(f"   Removed {initial_count - len(self.df)} duplicates")
        
        # Handle missing values
        numeric_cols = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3', 'aqi']
        for col in numeric_cols:
            if col in self.df.columns:
                missing_count = self.df[col].isna().sum()
                if missing_count > 0:
                    self.df[col] = self.df[col].fillna(method='ffill').fillna(method='bfill')
                    print(f"   Filled {missing_count} missing values in {col}")
        
        # Sort by datetime
        self.df = self.df.sort_values('datetime').reset_index(drop=True)
        
        # Save cleaned dataset
        output_path = DATA_DIR / 'nashik_aqi_cleaned.csv'
        self.df.to_csv(output_path, index=False)
        print(f"✅ Cleaned dataset saved: {output_path}")
        
        return self.df
    
    def feature_engineering(self):
        """Extract features from datetime and create AQI categories"""
        print("\n🧠 Feature engineering...")
        
        # Extract datetime features
        self.df['hour'] = self.df['datetime'].dt.hour
        self.df['day'] = self.df['datetime'].dt.day
        self.df['month'] = self.df['datetime'].dt.month
        self.df['day_of_week'] = self.df['datetime'].dt.dayofweek
        self.df['is_weekend'] = (self.df['day_of_week'] >= 5).astype(int)
        
        # Create AQI category
        def categorize_aqi(aqi):
            if aqi <= 50: return 'Good'
            elif aqi <= 100: return 'Satisfactory'
            elif aqi <= 200: return 'Moderate'
            elif aqi <= 300: return 'Poor'
            elif aqi <= 400: return 'Very Poor'
            else: return 'Severe'
        
        self.df['aqi_category'] = self.df['aqi'].apply(categorize_aqi)
        
        # Encode station names
        self.label_encoder = LabelEncoder()
        self.df['station_encoded'] = self.label_encoder.fit_transform(self.df['station'])
        
        # Define feature columns
        self.feature_columns = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3', 
                                'hour', 'month', 'day_of_week', 'is_weekend', 'station_encoded']
        
        print(f"✅ Created {len(self.feature_columns)} features")
        print(f"   Features: {', '.join(self.feature_columns)}")
        
        return self.df
    
    def train_regression_model(self):
        """Train Random Forest Regressor for AQI prediction"""
        print("\n🤖 Training Regression Model (Random Forest)...")
        
        # Prepare data
        X = self.df[self.feature_columns]
        y = self.df['aqi']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.regressor.fit(X_train, y_train)
        
        # Predictions
        y_pred = self.regressor.predict(X_test)
        
        # Evaluation
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n📊 Regression Model Evaluation:")
        print(f"   MAE:  {mae:.2f}")
        print(f"   RMSE: {rmse:.2f}")
        print(f"   R²:   {r2:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.regressor.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 5 Important Features:")
        for idx, row in feature_importance.head(5).iterrows():
            print(f"   {row['feature']}: {row['importance']:.4f}")
        
        # Save model
        model_path = MODELS_DIR / 'aqi_regressor.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(self.regressor, f)
        print(f"\n✅ Regression model saved: {model_path}")
        
        # Plot: Predicted vs Actual
        plt.figure(figsize=(10, 6))
        plt.scatter(y_test, y_pred, alpha=0.5, s=10)
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        plt.xlabel('Actual AQI')
        plt.ylabel('Predicted AQI')
        plt.title(f'Regression Model: Predicted vs Actual AQI\nR² = {r2:.4f}')
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / 'regression_pred_vs_actual.png', dpi=150)
        plt.close()
        
        # Plot: Feature Importance
        plt.figure(figsize=(10, 6))
        sns.barplot(data=feature_importance.head(10), x='importance', y='feature', palette='viridis')
        plt.xlabel('Importance')
        plt.ylabel('Feature')
        plt.title('Top 10 Feature Importance (Regression)')
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / 'regression_feature_importance.png', dpi=150)
        plt.close()
        
        return self.regressor, {'mae': mae, 'rmse': rmse, 'r2': r2}
    
    def train_classification_model(self):
        """Train Random Forest Classifier for AQI category prediction"""
        print("\n🤖 Training Classification Model (Random Forest)...")
        
        # Prepare data
        X = self.df[self.feature_columns]
        y = self.df['aqi_category']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.classifier.fit(X_train, y_train)
        
        # Predictions
        y_pred = self.classifier.predict(X_test)
        
        # Evaluation
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        print(f"\n📊 Classification Model Evaluation:")
        print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"   F1 Score: {f1:.4f}")
        
        print(f"\n📋 Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save model
        model_path = MODELS_DIR / 'aqi_classifier.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(self.classifier, f)
        print(f"✅ Classification model saved: {model_path}")
        
        # Plot: Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=self.classifier.classes_,
                    yticklabels=self.classifier.classes_)
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.title(f'Confusion Matrix\nAccuracy = {accuracy:.4f}')
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / 'classification_confusion_matrix.png', dpi=150)
        plt.close()
        
        return self.classifier, {'accuracy': accuracy, 'f1_score': f1}
    
    def plot_aqi_trends(self):
        """Plot AQI trends over time"""
        print("\n📈 Generating AQI trend visualizations...")
        
        # Daily average AQI
        daily_aqi = self.df.groupby(self.df['datetime'].dt.date)['aqi'].mean()
        
        plt.figure(figsize=(14, 6))
        plt.plot(daily_aqi.index, daily_aqi.values, linewidth=1, alpha=0.7)
        plt.xlabel('Date')
        plt.ylabel('Average AQI')
        plt.title('Daily Average AQI Trend - Nashik City')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / 'aqi_trend_over_time.png', dpi=150)
        plt.close()
        
        # Hourly pattern
        hourly_aqi = self.df.groupby('hour')['aqi'].mean()
        
        plt.figure(figsize=(12, 6))
        plt.bar(hourly_aqi.index, hourly_aqi.values, color='steelblue', alpha=0.7)
        plt.xlabel('Hour of Day')
        plt.ylabel('Average AQI')
        plt.title('Average AQI by Hour of Day')
        plt.xticks(range(24))
        plt.grid(True, alpha=0.3, axis='y')
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / 'aqi_hourly_pattern.png', dpi=150)
        plt.close()
        
        print("✅ Visualizations saved")
    
    def save_metadata(self, reg_metrics, clf_metrics):
        """Save model metadata and configuration"""
        metadata = {
            'created_at': datetime.now().isoformat(),
            'city': 'Nashik',
            'total_records': len(self.df),
            'date_range': {
                'start': self.df['datetime'].min().isoformat(),
                'end': self.df['datetime'].max().isoformat()
            },
            'stations': self.label_encoder.classes_.tolist(),
            'feature_columns': self.feature_columns,
            'regression_metrics': reg_metrics,
            'classification_metrics': clf_metrics,
            'aqi_categories': ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']
        }
        
        metadata_path = MODELS_DIR / 'model_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"\n✅ Metadata saved: {metadata_path}")
        
        # Save label encoder
        encoder_path = MODELS_DIR / 'label_encoder.pkl'
        with open(encoder_path, 'wb') as f:
            pickle.dump(self.label_encoder, f)
        print(f"✅ Label encoder saved: {encoder_path}")
    
    def run_complete_pipeline(self):
        """Execute the complete ML pipeline"""
        print("\n" + "="*60)
        print("🚀 Starting Complete ML Pipeline")
        print("="*60)
        
        # Step 1: Generate data
        self.generate_synthetic_data()
        
        # Step 2: Clean and preprocess
        self.clean_and_preprocess()
        
        # Step 3: Feature engineering
        self.feature_engineering()
        
        # Step 4: Train regression model
        reg_metrics = self.train_regression_model()[1]
        
        # Step 5: Train classification model
        clf_metrics = self.train_classification_model()[1]
        
        # Step 6: Visualizations
        self.plot_aqi_trends()
        
        # Step 7: Save metadata
        self.save_metadata(reg_metrics, clf_metrics)
        
        print("\n" + "="*60)
        print("✅ ML Pipeline Completed Successfully!")
        print("="*60)
        print(f"\n📁 Output Files:")
        print(f"   Data:   {DATA_DIR / 'nashik_aqi_cleaned.csv'}")
        print(f"   Models: {MODELS_DIR}")
        print(f"   Plots:  {PLOTS_DIR}")
        print("\n🎯 Models are ready for deployment!")


def predict_aqi(pm2_5, pm10, no2, so2, co, o3, hour, month, day_of_week=0, is_weekend=0, station='Satpur'):
    """
    API-ready prediction function
    
    Args:
        pm2_5: PM2.5 concentration (µg/m³)
        pm10: PM10 concentration (µg/m³)
        no2: NO2 concentration (µg/m³)
        so2: SO2 concentration (µg/m³)
        co: CO concentration (mg/m³)
        o3: O3 concentration (µg/m³)
        hour: Hour of day (0-23)
        month: Month (1-12)
        day_of_week: Day of week (0=Monday, 6=Sunday)
        is_weekend: 1 if weekend, 0 otherwise
        station: Station name
    
    Returns:
        dict: {
            'predicted_aqi': float,
            'aqi_category': str,
            'confidence': float
        }
    """
    # Load models
    with open(MODELS_DIR / 'aqi_regressor.pkl', 'rb') as f:
        regressor = pickle.load(f)
    
    with open(MODELS_DIR / 'aqi_classifier.pkl', 'rb') as f:
        classifier = pickle.load(f)
    
    with open(MODELS_DIR / 'label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    
    # Encode station
    try:
        station_encoded = label_encoder.transform([station])[0]
    except:
        station_encoded = 0  # Default to first station
    
    # Prepare features
    features = np.array([[pm2_5, pm10, no2, so2, co, o3, hour, month, day_of_week, is_weekend, station_encoded]])
    
    # Predict AQI value
    predicted_aqi = regressor.predict(features)[0]
    
    # Predict AQI category
    predicted_category = classifier.predict(features)[0]
    
    # Get confidence (probability)
    confidence = classifier.predict_proba(features).max()
    
    return {
        'predicted_aqi': round(float(predicted_aqi), 2),
        'aqi_category': predicted_category,
        'confidence': round(float(confidence), 4)
    }


if __name__ == '__main__':
    # Run the complete pipeline
    pipeline = AQIPipeline()
    pipeline.run_complete_pipeline()
    
    # Test prediction function
    print("\n" + "="*60)
    print("🧪 Testing Prediction Function")
    print("="*60)
    
    test_input = {
        'pm2_5': 85.5,
        'pm10': 120.3,
        'no2': 45.2,
        'so2': 18.5,
        'co': 1.2,
        'o3': 35.0,
        'hour': 9,
        'month': 12,
        'day_of_week': 1,
        'is_weekend': 0,
        'station': 'Satpur'
    }
    
    result = predict_aqi(**test_input)
    print(f"\n📊 Test Prediction:")
    print(f"   Input: PM2.5={test_input['pm2_5']}, PM10={test_input['pm10']}, Hour={test_input['hour']}")
    print(f"   Predicted AQI: {result['predicted_aqi']}")
    print(f"   Category: {result['aqi_category']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    
    print("\n✅ All systems operational!")
