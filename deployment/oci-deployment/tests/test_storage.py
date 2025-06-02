"""Tests for storage management."""

import pytest
from unittest.mock import Mock, patch, mock_open
from pathlib import Path
from oci_deploy.storage import StorageManager
from oci_deploy.config import OCIConfig
import oci.exceptions


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
def storage_manager(mock_config):
    """Create a StorageManager instance with mocked OCI client."""
    with patch('oci.config.from_file'), \
         patch('oci.object_storage.ObjectStorageClient') as mock_client:
        
        # Mock the namespace
        mock_client.return_value.get_namespace.return_value.data = "test-namespace"
        
        return StorageManager(mock_config)


def test_create_frontend_bucket_success(storage_manager, mock_config):
    """Test successful bucket creation."""
    mock_response = Mock()
    mock_response.data.name = "test-bucket"
    
    storage_manager.object_storage_client.create_bucket.return_value = mock_response
    
    result = storage_manager.create_frontend_bucket()
    
    assert result == "test-bucket"
    
    # Verify bucket creation was called with correct parameters
    storage_manager.object_storage_client.create_bucket.assert_called_once()
    call_args = storage_manager.object_storage_client.create_bucket.call_args
    
    assert call_args[1]['namespace_name'] == "test-namespace"
    bucket_details = call_args[1]['create_bucket_details']
    assert bucket_details.name == "test-bucket"
    assert bucket_details.compartment_id == "test-compartment"
    assert bucket_details.public_access_type == "ObjectRead"


def test_create_frontend_bucket_already_exists(storage_manager):
    """Test bucket creation when bucket already exists."""
    # Mock 409 Conflict error (bucket already exists)
    error = oci.exceptions.ServiceError(
        status=409,
        code="BucketAlreadyExists",
        headers={},
        message="Bucket already exists"
    )
    storage_manager.object_storage_client.create_bucket.side_effect = error
    
    result = storage_manager.create_frontend_bucket()
    
    assert result == "test-bucket"


def test_create_frontend_bucket_other_error(storage_manager):
    """Test bucket creation with unexpected error."""
    error = oci.exceptions.ServiceError(
        status=500,
        code="InternalError",
        headers={},
        message="Internal server error"
    )
    storage_manager.object_storage_client.create_bucket.side_effect = error
    
    with pytest.raises(oci.exceptions.ServiceError):
        storage_manager.create_frontend_bucket()


@patch('pathlib.Path.exists')
def test_upload_frontend_build_directory_not_found(mock_exists, storage_manager):
    """Test upload when build directory doesn't exist."""
    mock_exists.return_value = False
    
    # Should not raise an exception, just print a message
    storage_manager.upload_frontend_build("nonexistent/path")
    
    # Verify no upload operations were performed
    storage_manager.object_storage_client.put_object.assert_not_called()


@patch('pathlib.Path.rglob')
@patch('pathlib.Path.exists')
def test_upload_frontend_build_success(mock_exists, mock_rglob, storage_manager):
    """Test successful frontend build upload."""
    mock_exists.return_value = True
    
    # Mock file paths
    mock_file1 = Mock(spec=Path)
    mock_file1.is_file.return_value = True
    mock_file1.relative_to.return_value = Path("index.html")
    mock_file1.suffix = ".html"
    
    mock_file2 = Mock(spec=Path)
    mock_file2.is_file.return_value = True
    mock_file2.relative_to.return_value = Path("assets/main.js")
    mock_file2.suffix = ".js"
    
    mock_rglob.return_value = [mock_file1, mock_file2]
    
    # Mock file reading
    with patch('builtins.open', mock_open(read_data=b"file content")):
        storage_manager.upload_frontend_build("../../dist")
    
    # Verify files were uploaded
    assert storage_manager.object_storage_client.put_object.call_count == 2
    
    # Check first call (HTML file)
    first_call = storage_manager.object_storage_client.put_object.call_args_list[0]
    assert first_call[1]['namespace_name'] == "test-namespace"
    assert first_call[1]['bucket_name'] == "test-bucket"
    assert first_call[1]['object_name'] == "index.html"
    assert first_call[1]['content_type'] == "text/html"


def test_get_content_type(storage_manager):
    """Test content type detection."""
    assert storage_manager._get_content_type(".html") == "text/html"
    assert storage_manager._get_content_type(".css") == "text/css"
    assert storage_manager._get_content_type(".js") == "application/javascript"
    assert storage_manager._get_content_type(".json") == "application/json"
    assert storage_manager._get_content_type(".png") == "image/png"
    assert storage_manager._get_content_type(".jpg") == "image/jpeg"
    assert storage_manager._get_content_type(".svg") == "image/svg+xml"
    assert storage_manager._get_content_type(".woff2") == "font/woff2"
    assert storage_manager._get_content_type(".unknown") == "application/octet-stream"


def test_delete_bucket_contents(storage_manager):
    """Test deleting bucket contents."""
    # Mock list objects response
    mock_obj1 = Mock()
    mock_obj1.name = "index.html"
    mock_obj2 = Mock()
    mock_obj2.name = "assets/main.js"
    
    mock_response = Mock()
    mock_response.data.objects = [mock_obj1, mock_obj2]
    
    storage_manager.object_storage_client.list_objects.return_value = mock_response
    
    storage_manager.delete_bucket_contents()
    
    # Verify objects were deleted
    assert storage_manager.object_storage_client.delete_object.call_count == 2
    
    # Check delete calls
    delete_calls = storage_manager.object_storage_client.delete_object.call_args_list
    assert delete_calls[0][1]['object_name'] == "index.html"
    assert delete_calls[1][1]['object_name'] == "assets/main.js"


def test_delete_bucket_contents_empty_bucket(storage_manager):
    """Test deleting contents of empty bucket."""
    mock_response = Mock()
    mock_response.data.objects = []
    
    storage_manager.object_storage_client.list_objects.return_value = mock_response
    
    storage_manager.delete_bucket_contents()
    
    # Verify no delete operations were performed
    storage_manager.object_storage_client.delete_object.assert_not_called()


def test_delete_bucket(storage_manager):
    """Test deleting bucket after emptying it."""
    # Mock empty bucket
    mock_response = Mock()
    mock_response.data.objects = []
    storage_manager.object_storage_client.list_objects.return_value = mock_response
    
    storage_manager.delete_bucket()
    
    # Verify bucket was deleted
    storage_manager.object_storage_client.delete_bucket.assert_called_once_with(
        namespace_name="test-namespace",
        bucket_name="test-bucket"
    )