
cd backend
docker build -t backend .
docker run -d -p 5000:5000 backend

docker build -t frontend .
docker run -d -p 3000:3000 frontend
