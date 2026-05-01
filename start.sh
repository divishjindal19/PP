#!/bin/bash
# UniAdvisor — Start both backend and frontend

echo "🎓 Starting UniAdvisor..."
echo ""

# Start backend
cd backend
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
echo "✅ Backend deps installed"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "✅ Backend started (PID $BACKEND_PID) → http://localhost:8000"
echo "   Swagger docs → http://localhost:8000/docs"
cd ..

# Start frontend
cd frontend
npm install --silent 2>/dev/null
echo "✅ Frontend deps installed"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID $FRONTEND_PID) → http://localhost:5173"

echo ""
echo "🚀 UniAdvisor is running!"
echo "   Open: http://localhost:5173"
echo "   Click: 'Continue as Demo Student'"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" SIGINT
wait
