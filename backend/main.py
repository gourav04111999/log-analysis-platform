from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from db.connector import run_query
from parsers.pdf_parser import parse_pdf_logs
from parsers.text_parser import parse_text_logs
from nlp.nl2sql import natural_language_to_sql
import shutil, os

app = FastAPI(title="LogVault API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/logs")
def get_logs(level: str = None, service: str = None, limit: int = 100):
    conditions, params = ["1=1"], {}
    if level:
        conditions.append("level = :level")
        params["level"] = level
    if service:
        conditions.append("service = :service")
        params["service"] = service
    params["limit"] = limit
    sql = f"SELECT * FROM logs WHERE {'AND'.join(conditions)} ORDER BY ts DESC LIMIT :limit"
    return run_query(sql, params)
@app.post("/nl-query")
def nl_query(body: dict):
    result = natural_language_to_sql(body["query"])
    data = run_query(result["sql"])
    return {"sql": result["sql"], "explanation": result["explanation"], "data": data}
@app.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    tmp = f"/tmp/{file.filename}"
    with open(tmp, "wb") as f:
        shutil.copyfileobj(file.file, f)
        logs = parse_pdf_logs(tmp)
        os.remove(tmp)
        return {"parsed": len(logs), "logs": logs[20]}
@app.post("/upload/text")
async def upload_text(file: UploadFile =File(...)):
    tmp = f"/tmp/{file.filename}"
    with open(tmp, "wb") as f:
        shutil.copyfileobj(file.file, f)
        logs = parse_text_logs(tmp)
        os.remove(tmp)
        return {"parsed": len(logs), "logs": logs[20]}
@app.get("/compliance")
def compliance_summary():
    total = run_query("SELECT COUNT(*) as cnt FROM logs")[0]["cnt"]
    errors = run_query("SELECT COUNT(*) as cnt FROM logs WHERE level='ERROR'")[0]["cnt"]
    return {"total": total, "errors": errors, "error_rate": round(errors/max(total, 1) * 100, 2)}