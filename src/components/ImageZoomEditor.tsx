import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageZoomEditorProps {
  imageFile: File;
  onSave: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageZoomEditor = ({ imageFile, onSave, onCancel }: ImageZoomEditorProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to desired output size (e.g., 400x400 for profile pictures)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate the source and destination dimensions for cropping
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const scaledSize = sourceSize * zoom;
    
    // Calculate source coordinates (center crop)
    const sourceX = (image.naturalWidth - sourceSize) / 2 - (position.x / zoom);
    const sourceY = (image.naturalHeight - sourceSize) / 2 - (position.y / zoom);

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize / zoom,
      sourceSize / zoom,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Adjust Your Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Zoom and position your image for the best fit
          </p>
        </div>

        <div 
          className="relative w-80 h-80 mx-auto border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={URL.createObjectURL(imageFile)}
            alt="Profile preview"
            className="absolute max-w-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            draggable={false}
          />
        </div>

        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default ImageZoomEditor;