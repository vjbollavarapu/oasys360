# Deploying Oasys360 to Fly.io

This guide details how to deploy the Oasys360 backend, frontend, and AI engine to Fly.io using the pre-configured `fly.toml` files.

## Prerequisites

1.  **Install `flyctl`**:
    - **macOS (Brew)**: `brew install flyctl`
    - **Curl**: `curl -L https://fly.io/install.sh | sh`
2.  **Login**:
    ```bash
    fly auth login
    ```

## 1. Deploying the Backend

The backend requires a PostgreSQL database and environment secrets.

### Initial Setup
1.  **Navigate to the directory**:
    ```bash
    cd apps/backend
    ```
2.  **Launch the app (First time only)**:
    ```bash
    # Use existing config, don't deploy yet
    fly launch --no-deploy --copy-config --name oasys360-backend-vcs --region sin --org vcs-182
    ```
    *Note: Replace `oasys360-backend-vcs` with a unique name if taken.*

3.  **Create Database**:
    ```bash
    fly postgres create --name oasys360-db-vcs --region sin --org vcs-182
    fly postgres attach oasys360-db-vcs --app oasys360-backend-vcs
    ```

4.  **Set Secrets**:
    ```bash
    fly secrets set \
      SECRET_KEY="your-prod-secret-key-here" \
      ALLOWED_HOSTS="oasys360-backend-vcs.fly.dev"
    ```

### Deploy
```bash
fly deploy
```

## 2. Deploying the AI Engine

1.  **Navigate**:
    ```bash
    cd ../ai_engine
    ```
2.  **Launch**:
    ```bash
    fly launch --no-deploy --copy-config --name oasys360-ai-engine-vcs --region sin --org vcs-182
    ```
3.  **Deploy**:
    ```bash
    fly deploy
    ```

## 3. Deploying the Frontend

The frontend needs to know where the backend API is.

1.  **Navigate**:
    ```bash
    cd ../frontend
    ```
2.  **Launch**:
    ```bash
    fly launch --no-deploy --copy-config --name oasys360-frontend-vcs --region sin --org vcs-182
    ```
3.  **Set Environment Variables**:
    Replace the URL below with your actual backend URL from step 1.
    ```bash
    fly secrets set NEXT_PUBLIC_API_URL="https://oasys360-backend-vcs.fly.dev/api/v1"
    ```
4.  **Deploy**:
    ```bash
    fly deploy
    ```

## Troubleshooting

- **Logs**: Run `fly logs -a <app-name>` to see what's happening.
- **SSH**: Run `fly ssh console -a <app-name>` to get into the VM.
