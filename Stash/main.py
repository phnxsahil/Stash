import uvicorn
import os
from api.index import app

if __name__ == "__main__":
    # Railway provides the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
