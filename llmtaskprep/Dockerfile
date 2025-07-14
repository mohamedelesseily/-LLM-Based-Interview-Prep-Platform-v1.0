FROM python:3.9-slim

WORKDIR /app

# Copy requirements.txt first for better Docker caching
COPY requirements.txt .

RUN pip install -r requirements.txt

# Now copy the rest of your backend code
COPY . /app/llmtaskprep

# Set PYTHONPATH so 'llmtaskprep' is importable
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "llmtaskprep.main:app", "--host", "0.0.0.0", "--port", "8000"]