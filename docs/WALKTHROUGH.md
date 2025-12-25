# Walkthrough - Credential Update

I have updated the project's environment variables with the new credentials you provided for MongoDB, Cloudinary, and Google OAuth.

## Changes Made

### Configuration Updates
- **[frontend/.env](file:///Users/swetapopatkadam/Desktop/new/frontend/.env)**: Updated `MONGO_URL`, `CLOUDINARY_*`, and `GOOGLE_*` variables.
- **[backend/.env](file:///Users/swetapopatkadam/Desktop/new/backend/.env)**: Created this file (as it was missing) and populated it with the same credentials to ensure the backend can connect to your new services.

### Credentials Applied
| Service | Variable | Value (Masked) |
| :--- | :--- | :--- |
| **MongoDB** | `MONGO_URL` | `mongodb+srv://perfectbites12_db_user:***@cluster0...` |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME` | `dkbbtz2uk` |
| **Cloudinary** | `CLOUDINARY_API_KEY` | `995223753273339` |
| **Google OAuth**| `GOOGLE_CLIENT_ID` | `728409072300-***.apps.googleusercontent.com` |

## Verification
- I checked the format of the `MONGO_URL` and other keys to ensure they were correctly copied from your message.
- I ensured the `backend/.env` file exists so the server-side logic can access these settings.

## Final Cleanup
As per your request, I have **removed the `frontend/` and `backend/` folders** from this repository since you are managing them in separate repos. 

The `Externship-Webapp` repository now contains:
- `docs/`: Setup guides and walkthroughs.
- `.gitignore`: Configured to keep your local `.env` files safe.

## Next Steps
1. **Verify your Repo**: Visit [Shweta-Tech-creator/Externship-Webapp](https://github.com/Shweta-Tech-creator/Externship-Webapp) to see the clean structure.
## Admin Authentication Changes
- **Registration Disabled**: The `/api/admin/register` endpoint is now commented out in the backend, and the "Register" option has been removed from the frontend Admin Login page.
- **Fixed Admin Seeding**: I've added logic to the database connection that automatically creates a default Admin account if one doesn't exist.
- **Predefined Credentials**: You can now use the following credentials to log in as an Admin:
    - **Email**: `admin@gmail.com`
    - **Password**: `admin123`

> [!TIP]
> You can change these default credentials at any time by updating the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in your `backend/.env` file and restarting the server.
