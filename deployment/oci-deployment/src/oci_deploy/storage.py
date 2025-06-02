"""Object storage operations for static assets."""

import oci
import os
from pathlib import Path
from rich.console import Console
from rich.progress import Progress
from .config import OCIConfig

console = Console()


class StorageManager:
    """Manages OCI Object Storage operations for static assets."""
    
    def __init__(self, config: OCIConfig):
        """Initialize storage manager.
        
        Args:
            config: OCI configuration instance
        """
        self.config = config
        self.oci_config = oci.config.from_file()
        self.object_storage_client = oci.object_storage.ObjectStorageClient(
            self.oci_config
        )
        self.namespace = self.object_storage_client.get_namespace().data
    
    def create_frontend_bucket(self) -> str:
        """Create bucket for React frontend static files.
        
        Returns:
            Bucket name
        """
        try:
            bucket_details = oci.object_storage.models.CreateBucketDetails(
                name=self.config.frontend_bucket_name,
                compartment_id=self.config.compartment_id,
                public_access_type="ObjectRead",
                storage_tier="Standard"
            )
            
            response = self.object_storage_client.create_bucket(
                namespace_name=self.namespace,
                create_bucket_details=bucket_details
            )
            
            console.print(f"[green]✓[/green] Frontend bucket created: {self.config.frontend_bucket_name}")
            return response.data.name
            
        except oci.exceptions.ServiceError as e:
            if e.status == 409:  # Bucket already exists
                console.print(f"[yellow]![/yellow] Bucket already exists: {self.config.frontend_bucket_name}")
                return self.config.frontend_bucket_name
            raise
    
    def upload_frontend_build(self, build_path: str = "../../dist") -> None:
        """Upload React Vite build files to Object Storage.
        
        Args:
            build_path: Path to the build directory
        """
        build_dir = Path(build_path)
        
        if not build_dir.exists():
            console.print(f"[red]✗[/red] Build directory not found: {build_path}")
            console.print(f"[yellow]![/yellow] Run 'pnpm build' first to generate the dist directory")
            return
        
        # Get all files to upload
        files_to_upload = list(build_dir.rglob("*"))
        files_to_upload = [f for f in files_to_upload if f.is_file()]
        
        with Progress() as progress:
            task = progress.add_task("Uploading frontend files...", total=len(files_to_upload))
            
            for file_path in files_to_upload:
                relative_path = file_path.relative_to(build_dir)
                object_name = str(relative_path).replace("\\", "/")
                
                # Determine content type
                content_type = self._get_content_type(file_path.suffix)
                
                with open(file_path, "rb") as file_data:
                    self.object_storage_client.put_object(
                        namespace_name=self.namespace,
                        bucket_name=self.config.frontend_bucket_name,
                        object_name=object_name,
                        put_object_body=file_data,
                        content_type=content_type
                    )
                
                progress.update(task, advance=1)
        
        console.print(f"[green]✓[/green] Uploaded {len(files_to_upload)} files to bucket")
    
    def _get_content_type(self, extension: str) -> str:
        """Get content type based on file extension.
        
        Args:
            extension: File extension
            
        Returns:
            MIME content type
        """
        content_types = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".txt": "text/plain",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
            ".eot": "application/vnd.ms-fontobject"
        }
        return content_types.get(extension.lower(), "application/octet-stream")
    
    def delete_bucket_contents(self) -> None:
        """Delete all objects in the frontend bucket."""
        try:
            # List all objects in the bucket
            objects = self.object_storage_client.list_objects(
                namespace_name=self.namespace,
                bucket_name=self.config.frontend_bucket_name
            )
            
            if not objects.data.objects:
                console.print("[yellow]![/yellow] Bucket is already empty")
                return
            
            with Progress() as progress:
                task = progress.add_task("Deleting objects...", total=len(objects.data.objects))
                
                for obj in objects.data.objects:
                    self.object_storage_client.delete_object(
                        namespace_name=self.namespace,
                        bucket_name=self.config.frontend_bucket_name,
                        object_name=obj.name
                    )
                    progress.update(task, advance=1)
            
            console.print(f"[green]✓[/green] Deleted {len(objects.data.objects)} objects from bucket")
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to delete bucket contents: {e}")
            raise
    
    def delete_bucket(self) -> None:
        """Delete the frontend bucket after emptying it."""
        try:
            # First delete all contents
            self.delete_bucket_contents()
            
            # Then delete the bucket
            self.object_storage_client.delete_bucket(
                namespace_name=self.namespace,
                bucket_name=self.config.frontend_bucket_name
            )
            
            console.print(f"[green]✓[/green] Bucket {self.config.frontend_bucket_name} deleted")
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to delete bucket: {e}")
            raise