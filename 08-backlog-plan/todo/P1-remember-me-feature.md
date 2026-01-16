# P1: Remember Me Feature (Lưu mật khẩu đăng nhập)

**Priority**: P1 (Nice to have)
**Estimate**: 2 hours
**Status**: TODO
**Created**: 2026-01-17

---

## 📝 Description

Implement "Remember Me" functionality to allow users to stay logged in without re-entering credentials on every visit.

**User Request:**
> "add them tinh nang luu mat khau vao backlog xong trien khai de khong phai moi lan vao deu phai nhap password nhe"

---

## 🎯 Goals

1. Add "Remember Me" checkbox to login form
2. Store authentication token with longer expiration
3. Auto-login on return visits if "Remember Me" was checked
4. Provide option to logout/clear saved credentials

---

## 🔧 Technical Implementation

### Backend Changes

**1. Update JWT Token Settings** (`backend/config/settings.py`)
```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Regular session
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),    # Remember me duration
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

**2. Add Remember Me Endpoint** (`backend/users/views.py`)
```python
from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)

            # Extend token lifetime if remember_me is True
            if remember_me:
                refresh.access_token.set_exp(lifetime=timedelta(days=30))

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'remember_me': remember_me
            })
```

### Frontend Changes

**1. Update Login Form** (`frontend/src/pages/Login.tsx`)

Add checkbox:
```typescript
<Form.Item name="remember_me" valuePropName="checked">
  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
</Form.Item>
```

**2. Update Auth Service** (`frontend/src/services/auth.ts`)

```typescript
export const login = async (username: string, password: string, rememberMe: boolean) => {
  const response = await api.post('/users/login/', {
    username,
    password,
    remember_me: rememberMe
  });

  const { access, refresh, remember_me } = response.data;

  // Store in localStorage if remember_me
  const storage = remember_me ? localStorage : sessionStorage;
  storage.setItem('access_token', access);
  storage.setItem('refresh_token', refresh);
  storage.setItem('remember_me', String(remember_me));

  return response.data;
};

// Check for existing token on app load
export const checkAutoLogin = () => {
  const rememberMe = localStorage.getItem('remember_me') === 'true';
  if (rememberMe) {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
  }
  return false;
};
```

**3. Update App.tsx** - Add auto-login check

```typescript
useEffect(() => {
  const isLoggedIn = checkAutoLogin();
  if (isLoggedIn) {
    // Verify token is still valid
    verifyToken().then(valid => {
      if (valid) {
        navigate('/dashboard');
      }
    });
  }
}, []);
```

**4. Update Logout** - Clear both storages

```typescript
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('remember_me');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
};
```

---

## ✅ Acceptance Criteria

- [ ] Login form displays "Ghi nhớ đăng nhập" checkbox
- [ ] When checked, user stays logged in after closing browser
- [ ] When unchecked, user must login again after closing browser
- [ ] Token expires after 30 days (remember me) or 60 minutes (regular)
- [ ] User can manually logout to clear saved credentials
- [ ] Auto-login only happens if token is still valid
- [ ] Security: Use secure, httpOnly cookies in production (future improvement)

---

## 🧪 Testing Steps

1. **Test Remember Me = True**
   - Login with checkbox checked
   - Close browser completely
   - Open browser and navigate to site
   - ✅ Should auto-login without credentials

2. **Test Remember Me = False**
   - Login without checking checkbox
   - Close browser
   - Open browser and navigate to site
   - ✅ Should show login page

3. **Test Token Expiration**
   - Login with remember me
   - Wait for token to expire (or manually expire)
   - Refresh page
   - ✅ Should redirect to login

4. **Test Logout**
   - Login with remember me
   - Click logout
   - Close and reopen browser
   - ✅ Should show login page

---

## 🔒 Security Considerations

### Current Implementation (Phase 1)
- Store tokens in localStorage (remember me) or sessionStorage (regular)
- Tokens expire after 30 days max
- User must re-authenticate after expiration

### Future Improvements (Phase 2)
- Use httpOnly cookies instead of localStorage
- Implement refresh token rotation
- Add device fingerprinting
- Add "trusted devices" management page
- Add email notification for new device logins

---

## 📦 Dependencies

- No new dependencies required
- Uses existing JWT authentication system

---

## 📝 Notes

- This is a P1 feature (nice to have, not critical)
- Implement after P0 features are complete (P0-4: Organization Edit)
- Consider UX: Show "Logged in as..." indicator
- Consider security: Add option to "Logout from all devices"

---

**Created**: 2026-01-17
**Requested by**: User
**Priority**: P1
**Estimated effort**: 2 hours
