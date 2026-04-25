"""Get user credentials from database"""
from app.database.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

print("\n" + "="*60)
print("LOGIN CREDENTIALS")
print("="*60)

for user in users:
    print(f"\n{user.role.upper()}: {user.name}")
    print(f"  Email: {user.email}")
    print(f"  Role: {user.role}")
    print(f"  Created: {user.created_at}")

db.close()

print("\n" + "="*60)
print("DEFAULT PASSWORDS (from seed script):")
print("="*60)
print("\nADMIN:")
print("  Email: admin@nashikaqi.in")
print("  Password: admin@123")
print("\nUSERS:")
print("  Email: ankit@nashikaqi.in")
print("  Password: user@1234")
print("\n  Email: priya@nashikaqi.in")
print("  Password: user@1234")
print("\n" + "="*60)
