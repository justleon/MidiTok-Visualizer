# Deploying the Application to Railway

The application can be successfully deployed using the [Railway](https://railway.app) platform. To do so, you'll need to use the files from the `railway` folder and make a few configuration changes.

> **Note**: Railway offers a free trial that allows deployments, but it is limited to 5$.

## Deployment Steps

1. **Sign Up and Connect GitHub Repository**  
   Register on [Railway](https://railway.app) and connect your GitHub repository.

2. **Create Two Services**  
   Set up two separate services — one for the frontend and one for the backend.

3. **Set Environment Variables**  
   For each service, add the environment variable `RAILWAY_DOCKERFILE_PATH`, pointing to the respective `Dockerfile` location inside the `railway` folder.

    ??? example "Dockerfile"

        ```Dockerfile
        --8<-- "railway/backend/Dockerfile"
        ```

4. **Configure Ports**  
   After deployment, set the following ports:  
      - Frontend: `3000`  
      - Backend: `8000`

5. **Add the `railway.json` File**  
   In the `Config as Code` section, add the `railway.json` file and update the service names by assigning the correct `RAILWAY_SERVICE_ID` variables.

    ??? example "railway.json"

        ```railway.json
        --8<-- "railway.json"
        ```

6. **Update Dockerfiles**  
   Once the services are deployed, update the Dockerfiles by replacing the environment variables for frontend and backend URLs with the ones provided by Railway.

7. **Enable Sleep Mode for Backend**  
   To reduce data transfer usage, consider enabling **sleep mode** for the backend service when it's idle.

