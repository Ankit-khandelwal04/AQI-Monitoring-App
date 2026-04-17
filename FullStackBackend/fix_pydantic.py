"""
Fix Pydantic Core Installation Issue
This script reinstalls pydantic and pydantic-core to fix the binary extension issue
"""

import subprocess
import sys

def run_command(cmd, description):
    """Run a command and print the result"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    print("🔧 Fixing Pydantic Core Installation Issue")
    print("="*60)
    
    # Step 1: Uninstall pydantic packages
    print("\n📦 Step 1: Uninstalling pydantic packages...")
    run_command(
        f"{sys.executable} -m pip uninstall -y pydantic pydantic-core pydantic-settings",
        "Uninstalling pydantic packages"
    )
    
    # Step 2: Clear pip cache
    print("\n🧹 Step 2: Clearing pip cache...")
    run_command(
        f"{sys.executable} -m pip cache remove pydantic*",
        "Clearing pip cache"
    )
    
    # Step 3: Reinstall pydantic-core first
    print("\n📥 Step 3: Reinstalling pydantic-core...")
    if not run_command(
        f"{sys.executable} -m pip install --no-cache-dir --force-reinstall pydantic-core",
        "Installing pydantic-core"
    ):
        print("\n⚠️  Failed to install pydantic-core. Trying with --upgrade...")
        run_command(
            f"{sys.executable} -m pip install --upgrade --force-reinstall pydantic-core",
            "Installing pydantic-core with upgrade"
        )
    
    # Step 4: Reinstall pydantic
    print("\n📥 Step 4: Reinstalling pydantic...")
    run_command(
        f"{sys.executable} -m pip install --no-cache-dir pydantic==2.10.3",
        "Installing pydantic"
    )
    
    # Step 5: Reinstall pydantic-settings
    print("\n📥 Step 5: Reinstalling pydantic-settings...")
    run_command(
        f"{sys.executable} -m pip install --no-cache-dir pydantic-settings==2.6.1",
        "Installing pydantic-settings"
    )
    
    # Step 6: Install pydantic email support
    print("\n📥 Step 6: Installing pydantic email support...")
    run_command(
        f'{sys.executable} -m pip install --no-cache-dir "pydantic[email]==2.10.3"',
        "Installing pydantic email support"
    )
    
    # Step 7: Verify installation
    print("\n✅ Step 7: Verifying installation...")
    try:
        import pydantic
        import pydantic_core
        print(f"\n✅ SUCCESS!")
        print(f"   Pydantic version: {pydantic.__version__}")
        print(f"   Pydantic Core version: {pydantic_core.__version__}")
        print(f"\n🎉 Installation fixed! You can now start the backend with:")
        print(f"   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    except ImportError as e:
        print(f"\n❌ Verification failed: {e}")
        print("\n🔄 Alternative solution: Recreate virtual environment")
        print("   1. Deactivate current venv")
        print("   2. Delete venv folder")
        print("   3. Run: python -m venv venv")
        print("   4. Activate: .\\venv\\Scripts\\Activate.ps1")
        print("   5. Install: pip install -r requirements.txt")

if __name__ == "__main__":
    main()
