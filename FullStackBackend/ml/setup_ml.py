"""
Quick setup script for ML system
Checks dependencies and trains models
"""

import subprocess
import sys
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed"""
    print("🔍 Checking dependencies...")
    
    required = [
        'sklearn',
        'pandas',
        'numpy',
        'matplotlib',
        'seaborn'
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - MISSING")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("\n📦 Installing missing packages...")
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install',
            'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn'
        ])
        print("✅ Dependencies installed!")
    else:
        print("\n✅ All dependencies satisfied!")
    
    return True

def train_models():
    """Run the ML pipeline"""
    print("\n" + "="*60)
    print("🚀 Starting ML Pipeline")
    print("="*60)
    
    # Import and run pipeline
    from aqi_ml_pipeline import AQIPipeline
    
    pipeline = AQIPipeline()
    pipeline.run_complete_pipeline()
    
    print("\n" + "="*60)
    print("✅ Setup Complete!")
    print("="*60)
    print("\n📁 Generated Files:")
    print("   - ml/data/nashik_aqi_cleaned.csv")
    print("   - ml/models/aqi_regressor.pkl")
    print("   - ml/models/aqi_classifier.pkl")
    print("   - ml/models/label_encoder.pkl")
    print("   - ml/models/model_metadata.json")
    print("   - ml/plots/*.png")
    
    print("\n🔌 API Endpoints Available:")
    print("   - POST /ml/predict")
    print("   - GET  /ml/forecast/{station}?hours=24")
    print("   - GET  /ml/model-info")
    print("   - GET  /ml/feature-importance")
    print("   - GET  /ml/stations")
    print("   - GET  /ml/health")
    
    print("\n🎯 Next Steps:")
    print("   1. Start the backend: uvicorn app.main:app --reload")
    print("   2. Visit: http://localhost:8000/docs")
    print("   3. Test ML endpoints")
    print("   4. Open mobile app and check Admin Prediction Page")

if __name__ == '__main__':
    print("🤖 AQI ML System Setup")
    print("="*60)
    
    try:
        # Check dependencies
        check_dependencies()
        
        # Train models
        train_models()
        
        print("\n✨ All done! ML system is ready.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease check the error and try again.")
        sys.exit(1)
