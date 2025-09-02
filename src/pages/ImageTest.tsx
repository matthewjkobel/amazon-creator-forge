import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageZoomEditor from "@/components/ImageZoomEditor";
import { toast } from "@/hooks/use-toast";

const ImageTest = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (15MB max)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 15MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setCroppedImage(null);
    }
  };

  const handleEditImage = () => {
    if (selectedFile) {
      setShowEditor(true);
    }
  };

  const handleSaveCrop = (croppedBlob: Blob) => {
    // Convert blob to URL for preview
    const url = URL.createObjectURL(croppedBlob);
    setCroppedImage(url);
    setShowEditor(false);
    
    toast({
      title: "Image cropped successfully!",
      description: "Your image has been cropped and is ready to use."
    });
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
  };

  const handleDownload = () => {
    if (croppedImage) {
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = 'cropped-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCroppedImage(null);
    setShowEditor(false);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (showEditor && selectedFile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ImageZoomEditor
          imageFile={selectedFile}
          onSave={handleSaveCrop}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Image Zoom & Crop Test</h1>
          <p className="text-muted-foreground">
            Test the image upload, zoom, and crop functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                  <Label htmlFor="image-upload">Select Image File</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Max file size: 15MB
                </p>
                {selectedFile ? (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ File selected: {selectedFile.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    No file selected
                  </p>
                )}
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Selected File:</h4>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleEditImage}>
                      Edit & Crop Image
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                  </div>

                  {/* Original Image Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Original Image:</h4>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Original"
                      className="max-w-full h-48 object-contain border rounded"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cropped Result</CardTitle>
            </CardHeader>
            <CardContent>
              {croppedImage ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Cropped Image (400x400):</h4>
                    <img
                      src={croppedImage}
                      alt="Cropped result"
                      className="w-72 h-72 object-cover border rounded-full mx-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleDownload}>
                      Download Cropped Image
                    </Button>
                    <Button variant="outline" onClick={handleEditImage}>
                      Edit Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No cropped image yet.</p>
                  <p className="text-sm">Upload and crop an image to see the result here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Upload an image file (max 15MB)</li>
              <li>Click "Edit & Crop Image" to open the zoom editor</li>
              <li>Use zoom in/out buttons to adjust the image size</li>
              <li>Click and drag to reposition the image</li>
              <li>Click "Save Changes" to crop the image to 400x400</li>
              <li>View the result and download if needed</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageTest;