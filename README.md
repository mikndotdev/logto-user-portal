## Logto Self-service User Portal
- This webapp allows users to change their username and avatar in a [Logto](https://logto.io) instance.

### Screenshot
![Main Page](https://sukushocloud.mdusercontent.com/rms0e6ro8pps/09656d1c0ef8d7c427b6fc4e9c2ade15.png)

## Features
- Change basic profile information, such as username and profile picture without intervention
- Upload profile pictures to an S3 provider of your choice
- Users can instantly return to a previous page after changing their profile information (session initiation)
- Fully edge-compatible Next.js application (can be used on Cloudflare Pages)
- Fully responsive design

## Tech Stack
- Next.js v15
- Tailwind CSS w/ daisyui

## Installation

### Prerequisites
- Any server/PaaS that can deploy Next.js applications
- a [Logto](https://logto.io) instance (I use a selfhosted instance, but this should work with the cloud version as well)
- Any S3 compatible storage provider (required for profile pictures, can be disabled)

### Logto Setup
1. Create a new "Traditional Web" application in your Logto instance with:
    - Redirect URI: `(domain you want to deploy this app on)/api/auth/callback/logto`
    - Enable "Always issue refresh token"

![Always issue refresh token](https://sukushocloud.mdusercontent.com/rms0e6ro8pps/f903e77ce51491add3ee524d0b8c8ff8.png)

2. Create a machine-to-machine application. No extra settings are required.

### S3 setup
This isn't required if you don't require the changing of profile pictures. If you do, you can use any S3 compatible storage provider. If you're looking for one, try [Tigris](https://www.tigrisdata.com) :)
- Set your bucket to Public Access, and create a keypair with read/write access to the bucket.

### Application Setup
- Create a new repository from this template
- Style the application to your liking, such as the branding in `dashboard/page.tsx`. You might also like to look at the [theme setings](https://daisyui.com/docs/themes/) for daisyui.
- Set the following environment variables:
    - `APP_URL`: The URL of the application
    - `AUTH_SECRET`: A random string used for session encryption
    - `LOGTO_URL`: The URL of your Logto instance (note this is the URL of the login screen, not the Admin Console)
    - `LOGTO_CLIENT_ID`: The client ID of the "Traditional Web" application
    - `LOGTO_CLIENT_SECRET`: The client secret of the "Traditional Web" application
    - `LOGTO_M2M_ID`: The client ID of the machine-to-machine application
    - `LOGTO_M2M_SECRET`: The client secret of the machine-to-machine application
    - `NEXT_PUBLIC_ALLOW_AVATAR_UPLOAD`: Whether to allow users to upload profile pictures. If set to false, the variables below are not required.
    - `S3_BASE_URL`: The base URL of your S3 provider (Useful if you want to use a CDN)
    - `UPLOAD_DIR`: The directory to upload profile pictures to
    - `S3_ENDPOINT`: The endpoint of your S3 provider
    - `S3_BUCKET`: The bucket to upload profile pictures to
    - `S3_REGION`: The region of your S3 provider
    - `S3_ACCESS_KEY`: The access key of your S3 provider
    - `S3_SECRET_KEY`: The secret key of your S3 provider

## Deployment

### Vercel
- No extra configuration is required. Just deploy the application and set the environment variables in the Vercel dashboard.

### Self-hosting (VPS)
- Read the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying#self-hosting) for more information. This app cannot be used as a static site, as it requires server-side rendering.

### Cloudflare Pages
- Read [this guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/#existing-apps) and use `@cloudflare/next-on-pages` to deploy the application.
- Use this configuration in your `wrangler.toml`:
```toml
name = "changethis"
compatibility_date = "2024-11-11"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```
- Set the Node.js version to above 20, as this is required for Next.js 15. The easiest way to do this is add a `.node-version` file with the content `20.0.0`.

## Usage
- Visiting the root of the application will automatically log the user in and redirect them to the dashboard.
- If you want the user to be able to return to the previous page after changing their profile information, you can use the `/init` route, such as `/init?url=(previous-app-url)`. This will set a callback cookie and redirect the user back to the previous page.
