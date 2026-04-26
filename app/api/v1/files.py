import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.file import File as FileModel

router = APIRouter(prefix="/api/v1/files", tags=["files"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.getcwd(), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # simple save to uploads folder and persist metadata
    filename = file.filename
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, "wb") as f:
        content = file.file.read()
        f.write(content)
    model = FileModel(owner_id=None, path=dest_path, filename=filename, mime=file.content_type, size=len(content))
    db.add(model)
    db.commit()
    db.refresh(model)
    return {"file_id": model.id, "url": f"/uploads/{filename}", "filename": filename, "mime": file.content_type, "size": model.size}
