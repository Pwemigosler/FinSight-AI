
# Auth Context

This directory contains the authentication context for the application. The code has been refactored into smaller, more maintainable modules:

- `AuthContext.tsx`: The main context provider that combines all services
- `UserService.ts`: Handles user-related operations like login, signup, profile updates
- `BankCardService.ts`: Manages bank card operations
- `types.ts`: Contains shared types for the auth context
- `index.ts`: Re-exports the main components for easier imports

## Usage

```tsx
// Import the AuthProvider
import { AuthProvider } from '@/contexts/auth';

// Wrap your app with the provider
const App = () => (
  <AuthProvider>
    <YourApp />
  </AuthProvider>
);

// Use the auth context in components
import { useAuth } from '@/contexts/auth';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    // Your component implementation
  );
};
```
