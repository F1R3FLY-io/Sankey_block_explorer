"""Tests for container deployment logic."""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from oci_deploy.containers import ContainerDeployer
from oci_deploy.config import OCIConfig


@pytest.fixture
def mock_config():
    """Create a mock OCIConfig for testing."""
    return OCIConfig(
        compartment_id="test-compartment",
        availability_domain="AD-1",
        region="us-ashburn-1",
        container_registry_url="test.ocir.io/test",
        environment="test",
        blockchain_api_endpoint="http://test.api.com",
        frontend_bucket_name="test-bucket"
    )


@pytest.fixture  
def container_deployer(mock_config):
    """Create a ContainerDeployer instance with mocked OCI client."""
    with patch('oci.config.from_file'), \
         patch('oci.container_instances.ContainerInstanceClient'):
        return ContainerDeployer(mock_config)


@pytest.mark.asyncio
async def test_deploy_frontend_container(container_deployer, mock_config):
    """Test deploying a frontend container."""
    # Mock the OCI response
    mock_response = Mock()
    mock_response.data.id = "test-container-id"
    
    container_deployer.container_client.create_container_instance.return_value = mock_response
    
    # Test deployment
    result = await container_deployer.deploy_frontend_container("v1.0.0")
    
    assert result == "test-container-id"
    
    # Verify the container client was called with correct parameters
    container_deployer.container_client.create_container_instance.assert_called_once()
    call_args = container_deployer.container_client.create_container_instance.call_args
    container_details = call_args[1]['create_container_instance_details']
    
    assert container_details.compartment_id == "test-compartment"
    assert container_details.availability_domain == "AD-1"
    assert container_details.shape == "CI.Standard.E4.Flex"
    assert len(container_details.containers) == 1
    
    container = container_details.containers[0]
    assert container.display_name == "sankey-explorer-frontend-test"
    assert "test.ocir.io/test/frontend:v1.0.0" in container.image_url


@pytest.mark.asyncio
async def test_deploy_frontend_container_with_custom_env_vars(container_deployer):
    """Test deploying with custom environment variables."""
    mock_response = Mock()
    mock_response.data.id = "test-container-id"
    
    container_deployer.container_client.create_container_instance.return_value = mock_response
    
    custom_env_vars = {
        "CUSTOM_VAR": "custom_value",
        "ANOTHER_VAR": "another_value"
    }
    
    result = await container_deployer.deploy_frontend_container("v1.0.0", custom_env_vars)
    
    assert result == "test-container-id"
    
    # Verify environment variables were passed correctly
    call_args = container_deployer.container_client.create_container_instance.call_args
    container_details = call_args[1]['create_container_instance_details']
    container = container_details.containers[0]
    
    assert container.environment_variables == custom_env_vars


def test_get_container_status(container_deployer):
    """Test getting container status."""
    # Mock the OCI response
    mock_response = Mock()
    mock_response.data.id = "test-container-id"
    mock_response.data.display_name = "test-container"
    mock_response.data.lifecycle_state = "ACTIVE"
    mock_response.data.time_created = "2023-01-01T00:00:00Z"
    
    # Mock containers
    mock_container = Mock()
    mock_container.display_name = "frontend-container"
    mock_container.lifecycle_state = "RUNNING"
    mock_response.data.containers = [mock_container]
    
    container_deployer.container_client.get_container_instance.return_value = mock_response
    
    result = container_deployer.get_container_status("test-container-id")
    
    assert result["id"] == "test-container-id"
    assert result["display_name"] == "test-container"
    assert result["lifecycle_state"] == "ACTIVE"
    assert result["time_created"] == "2023-01-01T00:00:00Z"
    assert len(result["containers"]) == 1
    assert result["containers"][0]["display_name"] == "frontend-container"
    assert result["containers"][0]["lifecycle_state"] == "RUNNING"


def test_delete_container_instance(container_deployer):
    """Test deleting a container instance."""
    container_deployer.container_client.delete_container_instance.return_value = None
    
    # Should not raise an exception
    container_deployer.delete_container_instance("test-container-id")
    
    container_deployer.container_client.delete_container_instance.assert_called_once_with("test-container-id")


def test_delete_container_instance_with_error(container_deployer):
    """Test deleting a container instance with error."""
    container_deployer.container_client.delete_container_instance.side_effect = Exception("Delete failed")
    
    with pytest.raises(Exception, match="Delete failed"):
        container_deployer.delete_container_instance("test-container-id")