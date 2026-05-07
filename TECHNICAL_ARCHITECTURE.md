# 🏗️ Technical Architecture Documentation

## Table of Contents

1. [Tech Stack & Advantages](#1-tech-stack--advantages)
2. [API Calls - File Locations](#2-api-calls---file-locations)
3. [JWT & Bcrypt Implementation](#3-jwt--bcrypt-implementation)
4. [Error Codes & HTTP Status](#4-error-codes--http-status)
5. [Session & Cookies](#5-session--cookies)

---

## 1. Tech Stack & Advantages

### Backend Stack

#### **FastAPI (Python)**
**Why we chose it:**
- ✅ **High Performance**: Built on Starlette and Pydantic, one of the fastest Python frameworks
- ✅ **Automatic API Documentation**: Auto-generates Swagger UI and ReDoc
- ✅ **Type Safety**: Built-in Pydantic validation catches errors at runtime
- ✅ **Async Support**: Native async/await for concurrent operations
- ✅ **Easy to Learn**: Intuitive syntax, similar to Flask but more powerful
- ✅ **Modern**: Uses Python 3.10+ features like type hints

**Advantages:**
```python
# Automatic validation and documentation
@router.post("/login")
def login(payload: UserLogin):  # Pydantic validates automatically
    return authenticate_user(payload)
```

#### **PostgreSQL**
**Why we chose it:**
- ✅ **Reliability**: ACID compliant, data integrity guaranteed
- ✅ **Scalability**: Handles millions of records efficiently
- ✅ **JSON Support**: Native JSONB for GeoJSON polygons
- ✅ **Free & Open Source**: No licensing costs
- ✅ **Cloud Ready**: Supported by all major cloud providers

**Advantages:**
- Stores complex GeoJSON polygons for zone boundaries
- Efficient indexing for time-series AQI data
- Supports spatial queries for map features

#### **SQLAlchemy ORM**
**Why we chose it:**
- ✅ **Database Abstraction**: Write Python instead of SQL
- ✅ **Migration Support**: Alembic for version control
- ✅ **Relationship Management**: Easy foreign key handling
- ✅ **Query Optimization**: Lazy loading, eager loading

**Advantages:**
```python
# Clean, readable queries
user = db.query(User).filter(User.email == email).first()
```

#### **Bcrypt (Password Hashing)**
**Why we chose it:**
- ✅ **Industry Standard**: Used by major companies
- ✅ **Adaptive**: Configurable rounds (we use 12)
- ✅ **Salt Built-in**: Automatic salt generation
- ✅ **Slow by Design**: Resistant to brute-force attacks

**Advantages:**
- Each password takes ~100ms to hash (prevents rapid guessing)
- Salts prevent rainbow table attacks
- Future-proof: can increase rounds as hardware improves

#### **JWT (JSON Web Tokens)**
**Why we chose it:**
- ✅ **Stateless**: No server-side session storage needed
- ✅ **Scalable**: Works across multiple servers
- ✅ **Self-Contained**: Token includes user info
- ✅ **Cross-Platform**: Works with mobile, web, desktop

**Advantages:**
```python
# Token contains user data - no database lookup needed
token = jwt.encode({"sub": user.email, "role": "admin"}, SECRET_KEY)
```

#### **Scikit-learn (Machine Learning)**
**Why we chose it:**
- ✅ **Easy to Use**: Simple API for complex algorithms
- ✅ **Well Documented**: Extensive tutorials and examples
- ✅ **Production Ready**: Used by industry leaders
- ✅ **Random Forest**: Excellent for AQI prediction (99.98% accuracy)

**Advantages:**
- No need for deep learning complexity
- Fast training and prediction
- Built-in feature importance analysis

---

### Frontend Stack

#### **React Native + Expo**
**Why we chose it:**
- ✅ **Cross-Platform**: One codebase for iOS, Android, Web
- ✅ **Fast Development**: Hot reload, instant updates
- ✅ **Native Performance**: Compiles to native code
- ✅ **Large Ecosystem**: Thousands of packages available
- ✅ **Easy Deployment**: EAS Build for APK/IPA generation

**Advantages:**
```typescript
// Same code runs on iOS, Android, and Web
<View style={styles.container}>
  <Text>Works everywhere!</Text>
</View>
```

#### **TypeScript**
**Why we chose it:**
- ✅ **Type Safety**: Catch errors before runtime
- ✅ **Better IDE Support**: Autocomplete, refactoring
- ✅ **Self-Documenting**: Types serve as documentation
- ✅ **Easier Refactoring**: Compiler catches breaking changes

**Advantages:**
```typescript
// Compiler catches typos and type errors
interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';  // Only these values allowed
}
```

#### **NativeWind (Tailwind CSS)**
**Why we chose it:**
- ✅ **Utility-First**: Fast styling without CSS files
- ✅ **Consistent Design**: Predefined spacing, colors
- ✅ **Responsive**: Easy breakpoints for different screens
- ✅ **Small Bundle**: Only used classes included

**Advantages:**
```typescript
// Inline styling with Tailwind classes
<View className="flex-1 bg-blue-500 p-4 rounded-lg">
```

#### **AsyncStorage**
**Why we chose it:**
- ✅ **Persistent Storage**: Data survives app restarts
- ✅ **Simple API**: Key-value store
- ✅ **Cross-Platform**: Works on iOS, Android, Web
- ✅ **Async**: Non-blocking operations

**Advantages:**
- Stores JWT tokens securely
- Caches user data for offline access
- No complex database setup needed

---

## 2. API Calls - File Locations

### Frontend API Client

**Main API File:**
```
FullStackMobile/src/utils/api.ts
```

This single file contains **ALL** API calls for the entire application.

#### Structure:

```typescript
// ── Configuration ──
export const BASE_URL = getApiUrl();  // From .env

// ── Token Management ──
export const saveToken = async (token: string) => {...}
export const getToken = async () => {...}
export const clearToken = async () => {...}

// ── Core Request Function ──
export async function request<T>(path: string, options: RequestOptions): Promise<T> {
  // Handles all HTTP requests
  // Adds JWT token automatically
  // Parses JSON responses
  // Throws errors with details
}

// ── API Functions ──
// Authentication
export async function apiLogin(params) {...}
export async function apiRegister(params) {...}
export async function apiMe() {...}

// AQI Data
export async function apiGetCurrentAQI(city, zone) {...}
export async function apiGetAQIHistory(zoneId, startDate, endDate) {...}
export async function apiPredictAQI(zoneId, hours) {...}

// Zones & Cities
export async function apiGetCities() {...}
export async function apiGetZones(cityId) {...}
export async function apiGetMapZones() {...}

// Admin
export async function apiGetDashboard() {...}
export async function apiCreateZone(payload) {...}
export async function apiDeleteZone(zoneId) {...}

// Alerts
export async function apiSendAlert(payload) {...}
export async function apiGetAlertHistory(zoneId, limit) {...}

// Reports
export async function apiGenerateReport(city, reportType) {...}

// Machine Learning
export async function apiMLPredict(input) {...}
export async function apiMLForecast(station, hours) {...}
export async function apiMLModelInfo() {...}
export async function apiMLFeatureImportance() {...}
export async function apiMLStations() {...}
export async function apiMLHealth() {...}
```

#### How API Calls Work:

**Example: Login Flow**

```typescript
// 1. User enters credentials in LoginScreen.tsx
const handleLogin = async () => {
  try {
    // 2. Call apiLogin from api.ts
    const response = await apiLogin({
      email: 'admin@nashikaqi.in',
      password: 'admin@123'
    });
    
    // 3. apiLogin internally:
    //    - Calls request('/auth/login', { method: 'POST', body: {...} })
    //    - request() adds headers, makes fetch call
    //    - Saves JWT token to AsyncStorage
    //    - Returns user data
    
    // 4. Navigate to dashboard
    navigation.navigate('Dashboard');
  } catch (error) {
    // 5. Show error message
    Alert.alert('Login Failed', error.message);
  }
};
```

#### Usage in Screens:

```typescript
// In any screen component
import { apiGetCurrentAQI, apiGetDashboard } from '@/utils/api';

// Fetch data
const data = await apiGetCurrentAQI('Nashik', 'Satpur');
const stats = await apiGetDashboard();
```

---

### Backend API Routes

**Route Files:**

```
FullStackBackend/app/routers/
├── auth_routes.py          # /auth/* endpoints
├── aqi_routes.py           # /aqi/* endpoints
├── zone_routes.py          # /zones/* endpoints
├── admin_routes.py         # /admin/* endpoints
├── alert_routes.py         # /alerts/* endpoints
├── maps_routes.py          # /maps/* endpoints
├── report_routes.py        # /reports/* endpoints
├── ml_routes.py            # /ml/* endpoints
└── setup_routes.py         # /setup/* endpoints
```

**Example: Authentication Routes**

```python
# FullStackBackend/app/routers/auth_routes.py

@router.post("/register")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, payload)
    return success(UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user, token = authenticate_user(db, payload.email, payload.password)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return success(UserResponse.model_validate(current_user))
```

---

## 3. JWT & Bcrypt Implementation

### JWT (JSON Web Tokens)

**File:** `FullStackBackend/app/utils/security.py`

#### Token Creation:

```python
from jose import jwt
from datetime import datetime, timedelta, timezone

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT token with user data
    
    Args:
        data: Dictionary with user info (email, role)
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token string
    """
    payload = data.copy()
    
    # Set expiration time (default: 30 minutes)
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload.update({"exp": expire})
    
    # Encode with secret key
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

**Usage:**
```python
# In auth_service.py
token = create_access_token({"sub": user.email, "role": user.role.value})
```

**Token Structure:**
```json
{
  "sub": "admin@nashikaqi.in",
  "role": "admin",
  "exp": 1714502400
}
```

#### Token Verification:

```python
def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload or None if invalid
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None  # Invalid or expired token
```

#### Protected Routes:

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that extracts and validates JWT token
    Automatically applied to protected routes
    """
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise exc
    
    # Extract email
    email: Optional[str] = payload.get("sub")
    if email is None:
        raise exc
    
    # Fetch user from database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise exc
    
    return user
```

**Usage in Routes:**
```python
@router.get("/admin/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    # current_user is automatically populated from JWT
    return get_dashboard_stats(current_user)
```

---

### Bcrypt (Password Hashing)

**File:** `FullStackBackend/app/utils/security.py`

#### Password Hashing:

```python
import bcrypt as _bcrypt

_ROUNDS = 12  # Cost factor (higher = slower but more secure)
_BCRYPT_LIMIT = 72  # Bcrypt's maximum password length

def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password string
    
    Process:
        1. Convert password to bytes
        2. Generate random salt
        3. Hash password with salt
        4. Return as string
    """
    # Convert to bytes (limit to 72 chars)
    pwd_bytes = password.encode("utf-8")[:_BCRYPT_LIMIT]
    
    # Generate salt (12 rounds = ~100ms to hash)
    salt = _bcrypt.gensalt(rounds=_ROUNDS)
    
    # Hash password with salt
    hashed = _bcrypt.hashpw(pwd_bytes, salt)
    
    # Return as string
    return hashed.decode("utf-8")
```

**Example:**
```python
plain_password = "admin@123"
hashed = hash_password(plain_password)
# Result: "$2b$12$KIXxJ3vN8..."  (60 characters)
```

**Why 12 rounds?**
- 10 rounds = ~50ms (too fast, vulnerable to brute force)
- 12 rounds = ~100ms (good balance)
- 14 rounds = ~400ms (too slow for user experience)

#### Password Verification:

```python
def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifies a password against its hash
    
    Args:
        plain: Plain text password from user
        hashed: Stored hashed password
    
    Returns:
        True if password matches, False otherwise
    """
    try:
        pwd_bytes = plain.encode("utf-8")[:_BCRYPT_LIMIT]
        return _bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False  # Invalid hash format or other error
```

**Usage in Authentication:**
```python
# In auth_service.py
def authenticate_user(db: Session, email: str, password: str) -> tuple[User, str]:
    # Fetch user
    user = db.query(User).filter(User.email == email).first()
    
    # Verify password
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Create JWT token
    token = create_access_token({"sub": user.email, "role": user.role.value})
    return user, token
```

#### Registration Flow:

```python
# In auth_service.py
def register_user(db: Session, payload: UserRegister) -> User:
    # Check if email exists
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create user with hashed password
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),  # Hash here!
        role=payload.role,
    )
    
    db.add(user)
    db.commit()
    return user
```

---

## 4. Error Codes & HTTP Status

### HTTP Status Codes Used

**File:** `FullStackBackend/app/services/auth_service.py` and `FullStackBackend/app/utils/security.py`

#### Status Code Reference:

| Code | Name | Usage | File |
|------|------|-------|------|
| **200** | OK | Successful requests | All routes (default) |
| **401** | Unauthorized | Invalid credentials, expired token | `auth_service.py`, `security.py` |
| **403** | Forbidden | User lacks permissions (not admin) | `security.py` |
| **409** | Conflict | Email already registered | `auth_service.py` |
| **422** | Unprocessable Entity | Validation errors | FastAPI (automatic) |
| **500** | Internal Server Error | Server crashes | FastAPI (automatic) |

---

### 401 Unauthorized

**Used when:**
- Wrong email or password
- Missing JWT token
- Expired JWT token
- Invalid JWT token

**Locations:**

**1. Login with wrong credentials:**
```python
# File: FullStackBackend/app/services/auth_service.py
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,  # ← HERE
            detail="Invalid email or password",
        )
```

**2. Invalid/missing JWT token:**
```python
# File: FullStackBackend/app/utils/security.py
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,  # ← HERE
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise exc  # Invalid token
    
    email = payload.get("sub")
    if email is None:
        raise exc  # Missing email in token
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise exc  # User not found
```

---

### 403 Forbidden

**Used when:**
- User tries to access admin-only endpoints
- User has valid token but insufficient permissions

**Location:**
```python
# File: FullStackBackend/app/utils/security.py
def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,  # ← HERE
            detail="Admin privileges required",
        )
    return current_user
```

**Usage:**
```python
# In admin_routes.py
@router.get("/admin/dashboard")
def dashboard(admin: User = Depends(get_current_admin)):  # ← Requires admin
    return get_stats()
```

---

### 409 Conflict

**Used when:**
- Email already exists during registration

**Location:**
```python
# File: FullStackBackend/app/services/auth_service.py
def register_user(db: Session, payload: UserRegister) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,  # ← HERE
            detail="Email already registered",
        )
```

---

### 422 Unprocessable Entity

**Automatically raised by FastAPI when:**
- Request body doesn't match Pydantic schema
- Missing required fields
- Wrong data types

**Example:**
```python
# Schema definition
class UserLogin(BaseModel):
    email: EmailStr  # Must be valid email
    password: str    # Required

# If user sends:
{
  "email": "not-an-email",  # Invalid format
  "password": 123           # Wrong type (should be string)
}

# FastAPI automatically returns 422 with details:
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    },
    {
      "loc": ["body", "password"],
      "msg": "str type expected",
      "type": "type_error.str"
    }
  ]
}
```

---

### Frontend Error Handling

**File:** `FullStackMobile/src/utils/api.ts`

```typescript
export async function request<T>(path: string, options: RequestOptions): Promise<T> {
  try {
    const res = await fetch(url, { method, headers, body });
    const json = await res.json();

    if (!res.ok) {
      // Handle FastAPI validation errors (422)
      const detail = json?.detail;
      if (Array.isArray(detail)) {
        // Multiple validation errors
        throw new Error(detail.map((d: any) => d.msg).join(', '));
      }
      // Single error (401, 403, 409, etc.)
      throw new Error(detail || json?.message || 'Request failed');
    }

    return json;
  } catch (error: any) {
    // Network errors
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      throw new Error(
        `Cannot connect to backend at ${BASE_URL}. ` +
        `Please ensure:\n` +
        `1. Backend is running\n` +
        `2. IP address is correct (check .env file)\n` +
        `3. You're on the same WiFi network`
      );
    }
    throw error;
  }
}
```

**Error Display:**
```typescript
// In LoginScreen.tsx
try {
  await apiLogin({ email, password });
} catch (error: any) {
  // Shows user-friendly error message
  Alert.alert('Login Failed', error.message);
  // Examples:
  // - "Invalid email or password" (401)
  // - "Email already registered" (409)
  // - "Cannot connect to backend..." (Network error)
}
```

---

## 5. Session & Cookies

### ❌ We Do NOT Use Sessions or Cookies

**Why?**
- JWT tokens are **stateless** - no server-side session storage needed
- Mobile apps don't support cookies well
- Tokens stored in AsyncStorage (mobile) or localStorage (web)

---

### What We Use Instead: JWT + AsyncStorage

#### Token Storage (Frontend)

**File:** `FullStackMobile/src/utils/api.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
export const TOKEN_KEY = '@aqi_token';
export const USER_KEY = '@aqi_user';

// Save JWT token after login
export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

// Retrieve token for API calls
export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

// Clear token on logout
export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

// Save user data
export const saveUser = async (user: any) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get user data
export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
```

#### How Authentication Works:

**1. Login:**
```typescript
// User logs in
const response = await apiLogin({ email, password });

// Response contains:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@nashikaqi.in",
    "role": "admin"
  }
}

// Save token and user to AsyncStorage
await saveToken(response.access_token);
await saveUser(response.user);
```

**2. Authenticated Requests:**
```typescript
export async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Automatically attach JWT token
  if (auth) {
    const token = await getToken();  // ← Retrieve from AsyncStorage
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;  // ← Add to header
    }
  }

  const res = await fetch(url, { method, headers, body });
  // ...
}
```

**3. Backend Validates Token:**
```python
# FastAPI automatically extracts token from Authorization header
@router.get("/admin/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    # get_current_user:
    # 1. Extracts token from "Authorization: Bearer <token>"
    # 2. Decodes JWT
    # 3. Fetches user from database
    # 4. Returns user object
    return get_stats(current_user)
```

**4. Logout:**
```typescript
// Clear token from AsyncStorage
await clearToken();

// Navigate to login screen
navigation.navigate('Login');
```

---

### Comparison: Sessions vs JWT

| Feature | Sessions (Traditional) | JWT (Our Approach) |
|---------|----------------------|-------------------|
| **Storage** | Server-side (Redis, database) | Client-side (AsyncStorage) |
| **Scalability** | Requires shared session store | Stateless, works across servers |
| **Mobile Support** | Poor (cookies don't work well) | Excellent (tokens in storage) |
| **Expiration** | Server controls | Token has expiration time |
| **Logout** | Delete session on server | Delete token on client |
| **Security** | Session ID in cookie | Signed token, can't be tampered |

---

### Security Considerations

#### ✅ What We Do:

1. **HTTPS Only**: Tokens transmitted over encrypted connection
2. **Short Expiration**: Tokens expire after 30 minutes
3. **Secure Storage**: AsyncStorage is encrypted on device
4. **Token Validation**: Backend verifies signature on every request
5. **No Sensitive Data**: Token only contains email and role

#### ❌ What We Don't Do:

1. **No Cookies**: Not used at all
2. **No Session Storage**: No server-side session management
3. **No Refresh Tokens**: User must re-login after 30 minutes (can be added later)

---

### Token Flow Diagram:

```
┌─────────────┐                                    ┌─────────────┐
│   Mobile    │                                    │   Backend   │
│     App     │                                    │   (FastAPI) │
└─────────────┘                                    └─────────────┘
       │                                                   │
       │  1. POST /auth/login                             │
       │     { email, password }                          │
       ├─────────────────────────────────────────────────>│
       │                                                   │
       │                                    2. Verify     │
       │                                       password   │
       │                                       (bcrypt)   │
       │                                                   │
       │  3. Return JWT token                             │
       │     { access_token, user }                       │
       │<─────────────────────────────────────────────────┤
       │                                                   │
4. Save token                                             │
   to AsyncStorage                                        │
       │                                                   │
       │  5. GET /admin/dashboard                         │
       │     Authorization: Bearer <token>                │
       ├─────────────────────────────────────────────────>│
       │                                                   │
       │                                    6. Decode JWT │
       │                                       Verify     │
       │                                       signature  │
       │                                                   │
       │  7. Return dashboard data                        │
       │<─────────────────────────────────────────────────┤
       │                                                   │
```

---

## Summary

### Key Takeaways:

1. **Tech Stack**: FastAPI + PostgreSQL + React Native + TypeScript
   - Chosen for performance, scalability, and developer experience

2. **API Calls**: All in `FullStackMobile/src/utils/api.ts`
   - Single file for all API communication
   - Automatic JWT token attachment

3. **JWT & Bcrypt**: In `FullStackBackend/app/utils/security.py`
   - JWT for stateless authentication
   - Bcrypt for secure password hashing (12 rounds)

4. **Error Codes**: In `auth_service.py` and `security.py`
   - 401: Invalid credentials or token
   - 403: Insufficient permissions
   - 409: Email already exists
   - 422: Validation errors (automatic)

5. **Sessions & Cookies**: NOT USED
   - JWT tokens stored in AsyncStorage
   - Stateless authentication
   - Better for mobile apps

---

**Last Updated**: April 30, 2026  
**Version**: 1.0.0

For more information, see:
- [README.md](README.md) - Project overview
- [ML_MODEL_EXPLANATION.md](ML_MODEL_EXPLANATION.md) - ML system details
- [CREDENTIALS.md](CREDENTIALS.md) - Login credentials
