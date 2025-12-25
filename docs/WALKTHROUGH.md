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

## Next Steps
1. **Restart your servers**: If you have the frontend or backend running, please stop them and run `npm run dev` again in both folders to pick up the new changes.
2. **Verify Connectivity**: You can check if the database is connecting by looking for the "MongoDB connected" message in your backend console.
