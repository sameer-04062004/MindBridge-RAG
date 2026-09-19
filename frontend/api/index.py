import sys
from pathlib import Path

# Add project root and parent to Python path
CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent
ROOT_DIR = PARENT_DIR.parent

for p in [str(PARENT_DIR), str(ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.main import app
