# Firebase Functions Project

This project contains Firebase Cloud Functions with a simple hello endpoint and CI/CD pipeline for automatic deployment.

## Project Structure

- `functions/`: Contains the Firebase Functions code
  - `src/index.ts`: Main source file with function definitions
- `.github/workflows/`: Contains CI/CD pipeline configuration
  - `firebase-deploy.yml`: GitHub Actions workflow for automatic deployment

## Features

### Hello Endpoint

The project includes a simple GET endpoint that returns a hello message:

```
GET /hello
```

Response:
```json
{
  "message": "Hello from Firebase Functions!",
  "projectId": "your-project-id",
  "timestamp": "2025-05-06T02:53:40.000Z"
}
```

### Project Switching

This project is configured to work with multiple Firebase projects:

- **Default Project**: `chris-cole-test`
- **Live Project**: `structify-chris-cole`

You can switch between projects using Firebase CLI:

```bash
# Deploy to default project (chris-cole-test)
firebase deploy --only functions

# Deploy to live project (structify-chris-cole)
firebase use live
firebase deploy --only functions

# Switch back to default project
firebase use default
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically deploys:

- To `structify-chris-cole` when pushing to the `master` branch
- To `chris-cole-test` when pushing to the `testing` branch

## Local Development

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Run locally:
   ```bash
   npm run serve
   ```

3. Deploy manually:
   ```bash
   npm run deploy
   ```

## Environment Setup

Make sure to set up the following GitHub secrets for CI/CD:

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account credentials JSON

## Requirements

- Node.js 22
- Firebase CLI