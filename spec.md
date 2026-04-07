# ProMart

## Current State
ProMart is a full-stack webshop with a React frontend. The admin panel is currently accessible to anyone without authentication.

## Requested Changes (Diff)

### Add
- Internet Identity login requirement to access the admin panel
- Login screen shown when unauthenticated user tries to access admin
- Logout button in the admin sidebar area

### Modify
- Admin button in sidebar: clicking while unauthenticated triggers II login flow
- Sidebar user info section: show real II principal/identity when logged in

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with authorization component (role-based access: admin role)
2. Wire II auth in frontend: use `useAuthClient` hook from authorization component
3. Gate admin panel behind authentication check
4. Show login prompt/button when user clicks admin while not authenticated
5. Show logout button in sidebar when authenticated
