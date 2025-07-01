# Username Uniqueness Feature

This document describes the implementation of username uniqueness enforcement in the memecoin application.

## Overview

The application now enforces unique usernames across all user accounts. Each username can only be used by one wallet address, preventing conflicts and ensuring user identity uniqueness.

## Features

### 1. Real-time Username Validation
- **Client-side validation**: Username availability is checked in real-time as users type
- **Debounced checking**: Validation requests are debounced by 500ms to reduce API calls
- **Visual feedback**: Users see immediate feedback about username availability
- **Loading states**: Spinner animation shows when checking availability

### 2. Username Requirements
- **Length**: 2-20 characters
- **Characters**: Letters, numbers, underscores, and hyphens only
- **Uniqueness**: Must be unique across all users
- **Case sensitivity**: Usernames are case-sensitive

### 3. Validation Layers
- **Frontend validation**: Immediate feedback in the UI
- **Backend validation**: Server-side checks before saving
- **Database constraints**: Firestore queries ensure uniqueness

## Implementation Details

### Frontend Components

#### UserInfoForm Component
- Added `currentWalletAddress` prop to identify the current user
- Real-time username validation with debouncing
- Visual feedback with color-coded borders and messages
- Disabled submit button when username is invalid or being checked

#### Validation States
- **Empty**: No validation message
- **Checking**: Loading spinner with "Checking availability..." message
- **Available**: Green border with "Username is available" message
- **Taken**: Red border with "Username is already taken" message
- **Invalid**: Red border with specific validation error message

### Backend Functions

#### `isUsernameAvailable` (Firestore utility)
```typescript
export const isUsernameAvailable = async (
  username: string, 
  currentWalletAddress?: string
): Promise<boolean>
```

- Checks if username exists in Firestore
- Allows current user to keep their existing username
- Returns `true` if available, `false` if taken

#### `/api/check-username` (API endpoint)
- Server-side username validation
- Same validation rules as client-side
- Returns JSON response with availability status

### Database Changes

#### Firestore Index
Added index for username queries:
```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "username",
      "order": "ASCENDING"
    }
  ]
}
```

## Usage

### For Users
1. Enter a username in the account form
2. See real-time feedback about availability
3. Form submission is blocked if username is invalid or taken
4. Choose a different username if current one is unavailable

### For Developers
1. Import `isUsernameAvailable` from `src/utils/firestoreUser`
2. Pass current wallet address to allow users to keep existing usernames
3. Handle validation errors appropriately in UI

## Error Handling

### Common Error Messages
- "Username must be at least 2 characters long"
- "Username must be 20 characters or less"
- "Username can only contain letters, numbers, underscores, and hyphens"
- "Username is already taken"
- "Error checking username availability"

### Fallback Behavior
- On validation errors, assume username is not available
- Form submission is blocked until validation passes
- Users must choose a different username if current one is taken

## Security Considerations

1. **Server-side validation**: All username checks are validated server-side before saving
2. **Rate limiting**: Consider implementing rate limiting on the API endpoint
3. **Input sanitization**: Usernames are validated for allowed characters only
4. **Case sensitivity**: Usernames are case-sensitive to prevent confusion

## Future Enhancements

1. **Username reservation**: Allow users to reserve usernames temporarily
2. **Username suggestions**: Provide alternative suggestions when username is taken
3. **Username history**: Track username changes for audit purposes
4. **Premium usernames**: Reserved usernames for premium users
5. **Username transfer**: Allow username transfers between wallets (with verification) 