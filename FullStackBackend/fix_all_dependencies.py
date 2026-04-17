"""
Fix All Binary Dependencies Issues
This script fixes psycopg2 and other binary extension issues
"""

import subprocess
import sys
import os

def run_command(cmd, description, ignore_errors=False):
    """Run a command and print the result"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    
    # Handle paths with spaces by using sys.executable directly
    if cmd.startswith(f"{sys.executable}"):
        # Already using sys.executable, just run it
        pass
    
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            check=not ignore_errors,
            capture_output=True, 
            text=True,
            cwd=os.getcwd()
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr and not ignore_errors:
            print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        if not ignore_errors:
            print(f"❌ Error: {e}")
            if e.stdout:
                print(e.stdout)
            if e.stderr:
                print(e.stderr)
        return False

def main():
    print("🔧 Fixing All Binary Dependencies")
    print("="*60)
    
    # Get the pip executable path
    pip_exe = os.path.join(os.path.dirname(sys.executable), "pip.exe")
    if not os.path.exists(pip_exe):
        pip_exe = "pip"
    
    print(f"\n📍 Using Python: {sys.executable}")
    print(f"📍 Using Pip: {pip_exe}")
    
    # Step 1: Upgrade pip, setuptools, and wheel
    print("\n📦 Step 1: Upgrading pip, setuptools, and wheel...")
    run_command(
        f'"{sys.executable}" -m pip install --upgrade pip setuptools wheel',
        "Upgrading build tools"
    )
    
    # Step 2: Uninstall psycopg2-binary
    print("\n🗑️  Step 2: Uninstalling psycopg2-binary...")
    run_command(
        f'"{sys.executable}" -m pip uninstall -y psycopg2-binary psycopg2',
        "Uninstalling psycopg2",
        ignore_errors=True
    )
    
    # Step 3: Clear pip cache for psycopg2
    print("\n🧹 Step 3: Clearing pip cache...")
    run_command(
        f'"{sys.executable}" -m pip cache remove psycopg2*',
        "Clearing psycopg2 cache",
        ignore_errors=True
    )
    
    # Step 4: Reinstall psycopg2-binary with force
    print("\n📥 Step 4: Reinstalling psycopg2-binary...")
    if not run_command(
        f'"{sys.executable}" -m pip install --no-cache-dir --force-reinstall psycopg2-binary==2.9.10',
        "Installing psycopg2-binary"
    ):
        print("\n⚠️  Failed with specific version. Trying latest version...")
        run_command(
            f'"{sys.executable}" -m pip install --no-cache-dir --force-reinstall psycopg2-binary',
            "Installing latest psycopg2-binary"
        )
    
    # Step 5: Verify psycopg2 installation
    print("\n✅ Step 5: Verifying psycopg2...")
    try:
        import psycopg2
        print(f"✅ psycopg2 version: {psycopg2.__version__}")
    except ImportError as e:
        print(f"❌ psycopg2 import failed: {e}")
        print("\n🔄 Trying alternative: installing from wheel...")
        run_command(
            f'"{sys.executable}" -m pip install --only-binary :all: psycopg2-binary',
            "Installing psycopg2-binary from wheel"
        )
    
    # Step 6: Verify all critical imports
    print("\n✅ Step 6: Verifying all critical dependencies...")
    
    dependencies = [
        ("pydantic", "Pydantic"),
        ("pydantic_core", "Pydantic Core"),
        ("fastapi", "FastAPI"),
        ("sqlalchemy", "SQLAlchemy"),
        ("psycopg2", "psycopg2"),
    ]
    
    all_ok = True
    for module_name, display_name in dependencies:
        try:
            module = __import__(module_name)
            version = getattr(module, "__version__", "unknown")
            print(f"   ✅ {display_name}: {version}")
        except ImportError as e:
            print(f"   ❌ {display_name}: FAILED - {e}")
            all_ok = False
    
    # Final result
    print("\n" + "="*60)
    if all_ok:
        print("🎉 SUCCESS! All dependencies are working!")
        print("\n🚀 Start your backend with:")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("⚠️  Some dependencies failed. See errors above.")
        print("\n🔄 Try recreating the virtual environment:")
        print("   1. deactivate")
        print("   2. Remove-Item -Recurse -Force venv")
        print("   3. python -m venv venv")
        print("   4. .\\venv\\Scripts\\Activate.ps1")
        print("   5. pip install -r requirements.txt")
    print("="*60)

if __name__ == "__main__":
    main()
