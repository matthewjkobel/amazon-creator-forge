import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageZoomEditorProps {
  imageFile: File;
  onSave: (croppedBlob: Blob, preservedState?: { zoom: number; position: { x: number; y: number } }) => void;
  onCancel: () => void;
  initialZoom?: number;
  initialPosition?: { x: number; y: number };
}

const ImageZoomEditor = ({ imageFile, onSave, onCancel, initialZoom = 1, initialPosition = { x: 0, y: 0 } }: ImageZoomEditorProps) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState(initialPosition);
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
    
    e.preventDefault();
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

    // Fill with white background first (for transparent areas)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Calculate exact crop area based on preview positioning
    // Preview shows 320px circle in 384px container, so crop area is center 320px
    const previewSize = 384;
    const cropSize = 320;
    const cropOffset = (previewSize - cropSize) / 2; // 32px offset
    
    // Calculate source dimensions and position
    const scale = Math.min(image.naturalWidth / previewSize, image.naturalHeight / previewSize);
    const scaledImageWidth = image.naturalWidth / scale;
    const scaledImageHeight = image.naturalHeight / scale;
    
    // Calculate source coordinates for the crop circle
    const sourceX = (scaledImageWidth - cropSize) / 2 - (position.x / zoom);
    const sourceY = (scaledImageHeight - cropSize) / 2 - (position.y / zoom);
    const sourceSize = cropSize / zoom;

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX * scale,
      sourceY * scale,
      sourceSize * scale,
      sourceSize * scale,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob, { zoom, position });
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

        <div className="relative w-96 h-96 mx-auto">
          {/* Full image preview container - larger than crop circle */}
          <div 
            className="relative w-full h-full bg-muted cursor-move overflow-visible"
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
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center',
                width: '384px',
                height: '384px',
                objectFit: 'cover',
                left: '50%',
                top: '50%',
                marginLeft: '-192px',
                marginTop: '-192px'
              }}
              draggable={false}
            />
          </div>
          {/* Circular crop overlay - centered in the larger preview area */}
          <div className="absolute inset-8 pointer-events-none">
            <div className="w-80 h-80 border-2 border-dashed border-primary rounded-full"></div>
          </div>
          {/* Dimmed overlay with circular cutout */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 160px at center, transparent 160px, rgba(0,0,0,0.4) 160px)`
            }}
          ></div>
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