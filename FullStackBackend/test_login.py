"""Test login functionality"""
from app.database.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password, hash_password

db = SessionLocal()

# Test admin user
admin = db.query(User).filter(User.email == "admin@nashikaqi.in").first()
if admin:
    print(f"\n✅ Admin user found:")
    print(f"   Name: {admin.name}")
    print(f"   Email: {admin.email}")
    print(f"   Role: {admin.role}")
    print(f"   Password Hash: {admin.password_hash[:50]}...")
    
    # Test password verification
    test_password = "admin@123"
    is_valid = verify_password(test_password, admin.password_hash)
    print(f"\n   Testing password '{test_password}': {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Try with different variations
    for pwd in ["admin@123", "Admin@123", "admin123", "admin@1234"]:
        is_valid = verify_password(pwd, admin.password_hash)
        print(f"   Testing '{pwd}': {'✅' if is_valid else '❌'}")
else:
    print("\n❌ Admin user NOT found!")

print("\n" + "="*60)

# Test regular user
user = db.query(User).filter(User.email == "ankit@nashikaqi.in").first()
if user:
    print(f"\n✅ User found:")
    print(f"   Name: {user.name}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Password Hash: {user.password_hash[:50]}...")
    
    # Test password verification
    test_password = "user@1234"
    is_valid = verify_password(test_password, user.password_hash)
    print(f"\n   Testing password '{test_password}': {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Try with different variations
    for pwd in ["user@1234", "User@1234", "user1234", "user@123"]:
        is_valid = verify_password(pwd, user.password_hash)
        print(f"   Testing '{pwd}': {'✅' if is_valid else '❌'}")
else:
    print("\n❌ User NOT found!")

db.close()
