"""Configuration management for OCI deployment."""

from pydantic import BaseSettings, Field
from typing import Optional
import os


class OCIConfig(BaseSettings):
    """OCI deployment configuration."""
    
    compartment_id: str = Field(..., env="OCI_COMPARTMENT_ID")
    availability_domain: str = Field(..., env="OCI_AVAILABILITY_DOMAIN") 
    region: str = Field(..., env="OCI_REGION")
    container_registry_url: str = Field(..., env="CONTAINER_REGISTRY_URL")
    environment: str = Field(..., env="ENVIRONMENT")
    
    # Blockchain API Configuration
    blockchain_api_endpoint: str = Field(..., env="BLOCKCHAIN_API_ENDPOINT")
    
    # CDN and Load Balancer Configuration
    cdn_enabled: bool = Field(True, env="CDN_ENABLED")
    load_balancer_shape: str = Field("100Mbps", env="LOAD_BALANCER_SHAPE")
    
    # Frontend Configuration
    frontend_bucket_name: str = Field(..., env="FRONTEND_BUCKET_NAME")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


def load_config(env: str = "dev") -> OCIConfig:
    """Load configuration for specified environment.
    
    Args:
        env: Environment name (dev, staging, prod)
        
    Returns:
        OCIConfig instance with loaded configuration
    """
    env_file = f"configs/{env}.env"
    if os.path.exists(env_file):
        return OCIConfig(_env_file=env_file)
    return OCIConfig()