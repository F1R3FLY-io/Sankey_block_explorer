"""Tests for CLI interface."""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from typer.testing import CliRunner
from oci_deploy.cli import app


@pytest.fixture
def runner():
    """Create a CLI test runner."""
    return CliRunner()


@pytest.fixture
def mock_config():
    """Mock configuration for testing."""
    config = Mock()
    config.environment = "test"
    config.region = "us-ashburn-1"
    config.compartment_id = "test-compartment"
    config.availability_domain = "AD-1"
    config.container_registry_url = "test.ocir.io/test"
    config.frontend_bucket_name = "test-bucket"
    config.blockchain_api_endpoint = "http://test.api.com"
    config.cdn_enabled = True
    config.load_balancer_shape = "100Mbps"
    return config


def test_cli_help(runner):
    """Test CLI help command."""
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "OCI Deployment CLI for Sankey Block Explorer" in result.stdout


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.StorageManager')
@patch('oci_deploy.cli.ContainerDeployer')
@patch('oci_deploy.cli.asyncio.run')
def test_deploy_command(mock_asyncio, mock_container_deployer, mock_storage_manager, mock_load_config, runner, mock_config):
    """Test deploy command."""
    mock_load_config.return_value = mock_config
    
    # Mock storage manager
    mock_storage = Mock()
    mock_storage_manager.return_value = mock_storage
    
    # Mock container deployer
    mock_deployer = Mock()
    mock_container_deployer.return_value = mock_deployer
    mock_asyncio.return_value = "test-instance-id"
    
    result = runner.invoke(app, ["deploy", "--environment", "test", "--image-tag", "v1.0.0"])
    
    assert result.exit_code == 0
    assert "Deploying Sankey Block Explorer to test environment" in result.stdout
    
    # Verify storage operations were called
    mock_storage.create_frontend_bucket.assert_called_once()
    mock_storage.upload_frontend_build.assert_called_once()
    
    # Verify container deployment was called
    mock_asyncio.assert_called_once()


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.StorageManager')
def test_deploy_static_only(mock_storage_manager, mock_load_config, runner, mock_config):
    """Test deploy command with static-only flag."""
    mock_load_config.return_value = mock_config
    
    mock_storage = Mock()
    mock_storage_manager.return_value = mock_storage
    
    result = runner.invoke(app, ["deploy", "--environment", "test", "--image-tag", "v1.0.0", "--static-only"])
    
    assert result.exit_code == 0
    
    # Verify only storage operations were called
    mock_storage.create_frontend_bucket.assert_called_once()
    mock_storage.upload_frontend_build.assert_called_once()


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.ContainerDeployer')
@patch('oci_deploy.cli.asyncio.run')
def test_deploy_container_only(mock_asyncio, mock_container_deployer, mock_load_config, runner, mock_config):
    """Test deploy command with container-only flag."""
    mock_load_config.return_value = mock_config
    
    mock_deployer = Mock()
    mock_container_deployer.return_value = mock_deployer
    mock_asyncio.return_value = "test-instance-id"
    
    result = runner.invoke(app, ["deploy", "--environment", "test", "--image-tag", "v1.0.0", "--container-only"])
    
    assert result.exit_code == 0
    
    # Verify container deployment was called
    mock_asyncio.assert_called_once()


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.ContainerDeployer')
def test_status_command_with_instance_id(mock_container_deployer, mock_load_config, runner, mock_config):
    """Test status command with instance ID."""
    mock_load_config.return_value = mock_config
    
    mock_deployer = Mock()
    mock_container_deployer.return_value = mock_deployer
    
    # Mock status response
    mock_status = {
        "id": "test-instance-id",
        "display_name": "test-container",
        "lifecycle_state": "ACTIVE",
        "time_created": "2023-01-01T00:00:00Z",
        "containers": [
            {
                "display_name": "frontend-container",
                "lifecycle_state": "RUNNING"
            }
        ]
    }
    mock_deployer.get_container_status.return_value = mock_status
    
    result = runner.invoke(app, ["status", "--environment", "test", "--instance-id", "test-instance-id"])
    
    assert result.exit_code == 0
    assert "Container Instance Status" in result.stdout
    mock_deployer.get_container_status.assert_called_once_with("test-instance-id")


@patch('oci_deploy.cli.load_config')
def test_status_command_without_ids(mock_load_config, runner, mock_config):
    """Test status command without instance or load balancer ID."""
    mock_load_config.return_value = mock_config
    
    result = runner.invoke(app, ["status", "--environment", "test"])
    
    assert result.exit_code == 0
    assert "Please specify --instance-id or --load-balancer-id" in result.stdout


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.ContainerDeployer')
@patch('oci_deploy.cli.typer.confirm')
def test_cleanup_command_with_confirmation(mock_confirm, mock_container_deployer, mock_load_config, runner, mock_config):
    """Test cleanup command with user confirmation."""
    mock_load_config.return_value = mock_config
    mock_confirm.return_value = True
    
    mock_deployer = Mock()
    mock_container_deployer.return_value = mock_deployer
    
    result = runner.invoke(app, ["cleanup", "--environment", "test", "--instance-id", "test-instance-id"])
    
    assert result.exit_code == 0
    assert "Cleanup completed" in result.stdout
    mock_deployer.delete_container_instance.assert_called_once_with("test-instance-id")


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.ContainerDeployer')
def test_cleanup_command_with_yes_flag(mock_container_deployer, mock_load_config, runner, mock_config):
    """Test cleanup command with --yes flag."""
    mock_load_config.return_value = mock_config
    
    mock_deployer = Mock()
    mock_container_deployer.return_value = mock_deployer
    
    result = runner.invoke(app, ["cleanup", "--environment", "test", "--instance-id", "test-instance-id", "--yes"])
    
    assert result.exit_code == 0
    assert "Cleanup completed" in result.stdout
    mock_deployer.delete_container_instance.assert_called_once_with("test-instance-id")


@patch('oci_deploy.cli.load_config')
def test_config_check_command(mock_load_config, runner, mock_config):
    """Test config-check command."""
    mock_load_config.return_value = mock_config
    
    result = runner.invoke(app, ["config-check", "--environment", "test"])
    
    assert result.exit_code == 0
    assert "Configuration - test" in result.stdout
    assert "Configuration loaded successfully" in result.stdout


@patch('oci_deploy.cli.load_config')
def test_config_check_command_with_error(mock_load_config, runner):
    """Test config-check command with configuration error."""
    mock_load_config.side_effect = Exception("Configuration error")
    
    result = runner.invoke(app, ["config-check", "--environment", "test"])
    
    assert result.exit_code == 0
    assert "Configuration error" in result.stdout


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.NetworkingManager')
def test_networking_create_lb(mock_networking_manager, mock_load_config, runner, mock_config):
    """Test networking command to create load balancer."""
    mock_load_config.return_value = mock_config
    
    mock_networking = Mock()
    mock_networking_manager.return_value = mock_networking
    mock_networking.create_load_balancer.return_value = "test-lb-id"
    
    result = runner.invoke(app, [
        "networking", 
        "--environment", "test", 
        "--action", "create-lb", 
        "--subnet-ids", "subnet1,subnet2"
    ])
    
    assert result.exit_code == 0
    assert "Load balancer created: test-lb-id" in result.stdout
    mock_networking.create_load_balancer.assert_called_once_with(["subnet1", "subnet2"])


@patch('oci_deploy.cli.load_config')
@patch('oci_deploy.cli.NetworkingManager')
def test_networking_setup_cdn(mock_networking_manager, mock_load_config, runner, mock_config):
    """Test networking command to setup CDN."""
    mock_load_config.return_value = mock_config
    
    mock_networking = Mock()
    mock_networking_manager.return_value = mock_networking
    mock_networking.setup_cdn_distribution.return_value = {"status": "configured"}
    
    result = runner.invoke(app, [
        "networking", 
        "--environment", "test", 
        "--action", "setup-cdn", 
        "--origin-hostname", "example.com"
    ])
    
    assert result.exit_code == 0
    assert "CDN setup result" in result.stdout
    mock_networking.setup_cdn_distribution.assert_called_once_with("example.com")


def test_networking_unknown_action(runner):
    """Test networking command with unknown action."""
    result = runner.invoke(app, [
        "networking", 
        "--environment", "test", 
        "--action", "unknown-action"
    ])
    
    assert result.exit_code == 0
    assert "Unknown action: unknown-action" in result.stdout