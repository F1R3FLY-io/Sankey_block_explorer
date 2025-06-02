"""Tests for configuration management."""

import pytest
import os
from unittest.mock import patch, mock_open
from oci_deploy.config import OCIConfig, load_config


def test_oci_config_from_env():
    """Test OCIConfig creation from environment variables."""
    env_vars = {
        "OCI_COMPARTMENT_ID": "ocid1.compartment.test",
        "OCI_AVAILABILITY_DOMAIN": "AD-1",
        "OCI_REGION": "us-ashburn-1",
        "CONTAINER_REGISTRY_URL": "iad.ocir.io/test/app",
        "ENVIRONMENT": "test",
        "BLOCKCHAIN_API_ENDPOINT": "http://test.api.com",
        "FRONTEND_BUCKET_NAME": "test-bucket"
    }
    
    with patch.dict(os.environ, env_vars):
        config = OCIConfig()
        
        assert config.compartment_id == "ocid1.compartment.test"
        assert config.availability_domain == "AD-1"
        assert config.region == "us-ashburn-1"
        assert config.container_registry_url == "iad.ocir.io/test/app"
        assert config.environment == "test"
        assert config.blockchain_api_endpoint == "http://test.api.com"
        assert config.frontend_bucket_name == "test-bucket"
        assert config.cdn_enabled is True  # Default value
        assert config.load_balancer_shape == "100Mbps"  # Default value


def test_oci_config_defaults():
    """Test OCIConfig default values."""
    env_vars = {
        "OCI_COMPARTMENT_ID": "test",
        "OCI_AVAILABILITY_DOMAIN": "AD-1",
        "OCI_REGION": "us-ashburn-1",
        "CONTAINER_REGISTRY_URL": "test",
        "ENVIRONMENT": "test",
        "BLOCKCHAIN_API_ENDPOINT": "http://test.com",
        "FRONTEND_BUCKET_NAME": "test"
    }
    
    with patch.dict(os.environ, env_vars):
        config = OCIConfig()
        
        assert config.cdn_enabled is True
        assert config.load_balancer_shape == "100Mbps"


def test_load_config_with_env_file():
    """Test loading configuration from environment file."""
    env_content = """
OCI_COMPARTMENT_ID=ocid1.compartment.file
OCI_AVAILABILITY_DOMAIN=AD-2
OCI_REGION=us-phoenix-1
CONTAINER_REGISTRY_URL=phx.ocir.io/test/app
ENVIRONMENT=dev
BLOCKCHAIN_API_ENDPOINT=http://dev.api.com
FRONTEND_BUCKET_NAME=dev-bucket
CDN_ENABLED=false
LOAD_BALANCER_SHAPE=400Mbps
"""
    
    with patch("os.path.exists", return_value=True), \
         patch("builtins.open", mock_open(read_data=env_content)):
        
        config = load_config("dev")
        
        assert config.compartment_id == "ocid1.compartment.file"
        assert config.region == "us-phoenix-1"
        assert config.cdn_enabled is False
        assert config.load_balancer_shape == "400Mbps"


def test_load_config_without_env_file():
    """Test loading configuration when no environment file exists."""
    env_vars = {
        "OCI_COMPARTMENT_ID": "ocid1.compartment.env",
        "OCI_AVAILABILITY_DOMAIN": "AD-1",
        "OCI_REGION": "us-ashburn-1",
        "CONTAINER_REGISTRY_URL": "iad.ocir.io/test/app",
        "ENVIRONMENT": "test",
        "BLOCKCHAIN_API_ENDPOINT": "http://test.com",
        "FRONTEND_BUCKET_NAME": "test-bucket"
    }
    
    with patch("os.path.exists", return_value=False), \
         patch.dict(os.environ, env_vars):
        
        config = load_config("nonexistent")
        
        assert config.compartment_id == "ocid1.compartment.env"
        assert config.environment == "test"