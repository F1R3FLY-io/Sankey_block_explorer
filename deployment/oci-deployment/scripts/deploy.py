#!/usr/bin/env python3
"""Main deployment script for Sankey Block Explorer."""

import sys
import argparse
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from oci_deploy.cli import app

if __name__ == "__main__":
    app()