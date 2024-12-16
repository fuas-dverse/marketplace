FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic

EXPOSE 5001

CMD ["uvicorn","app.main:app", "--host", "0.0.0.0", "--port", "5001"]
