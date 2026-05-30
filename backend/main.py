import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.patient_router import router as patient_router
from presentation.clinic_router import router as clinic_router
from presentation.doctor_router import router as doctor_router
from presentation.appointment_router import router as appointment_router
from presentation.treatment_router import router as treatment_router
from presentation.user_router import router as user_router
from presentation.brushing_router import router as brushing_router
from presentation.tooth_treatment_router import router as tooth_treatment_router
from presentation.treatment_stage_router import router as treatment_stage_router
from presentation.post_op_router import router as post_op_router

# Initialize FastAPI App (Presentation Layer Entry Point)
app = FastAPI(
    title="DentsAI SaaS API Gateway",
    description="Dental Clinic Automation N-Tier Backend Architecture (No ORM, SP Only)",
    version="2.0.0"
)

# CORS Setup: Allow React frontend to consume the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Presentation Layer Routers
app.include_router(patient_router)
app.include_router(clinic_router)
app.include_router(doctor_router)
app.include_router(appointment_router)
app.include_router(treatment_router)
app.include_router(user_router)
app.include_router(brushing_router)
app.include_router(tooth_treatment_router)
app.include_router(treatment_stage_router)
app.include_router(post_op_router)

@app.on_event("startup")
def startup_event():
    try:
        from business.user_bll import UserBLL
        UserBLL.sync_existing_clinic_admins()
    except Exception as e:
        print(f"Startup clinic admin sync error: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "cluster": "production-node-1",
        "database": "connected (via pool)",
        "framework": "FastAPI (Python)"
    }

if __name__ == "__main__":
    # Start ASGI Server on Port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
