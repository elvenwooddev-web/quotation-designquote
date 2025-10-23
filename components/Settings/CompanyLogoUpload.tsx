'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Crop, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CompanyLogoUploadProps {
  logoUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function CompanyLogoUpload({ logoUrl, onUpload, onRemove }: CompanyLogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<'square' | 'rectangle' | 'free'>('square');

  // Crop box state
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: 300, height: 300 });
  const [resizing, setResizing] = useState<string | null>(null);
  const [movingCrop, setMovingCrop] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Read the file and open crop modal
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setShowCropModal(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load image when crop modal opens
  useEffect(() => {
    if (showCropModal && originalImage) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Reset crop box to center when new image loads
        const initialSize = aspectRatio === 'square' ? 250 : 300;
        const initialHeight = aspectRatio === 'square' ? 250 : 180;
        setCropBox({
          x: (400 - initialSize) / 2,
          y: (400 - initialHeight) / 2,
          width: initialSize,
          height: initialHeight,
        });
        drawCanvas();
      };
      img.src = originalImage;
    }
  }, [showCropModal, originalImage]);

  // Redraw canvas when scale, position, or crop box changes
  useEffect(() => {
    if (showCropModal && imageRef.current) {
      drawCanvas();
    }
  }, [scale, position, aspectRatio, cropBox]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for workspace
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions to fit image in canvas
    const imgAspect = img.width / img.height;
    let drawWidth = 400 * scale;
    let drawHeight = drawWidth / imgAspect;

    if (drawHeight > 400 * scale) {
      drawHeight = 400 * scale;
      drawWidth = drawHeight * imgAspect;
    }

    // Center the image
    const x = (400 - drawWidth) / 2 + position.x;
    const y = (400 - drawHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    // Draw dark overlay outside crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, cropBox.y);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.height);
    ctx.fillRect(cropBox.x + cropBox.width, cropBox.y, canvas.width - (cropBox.x + cropBox.width), cropBox.height);
    ctx.fillRect(0, cropBox.y + cropBox.height, canvas.width, canvas.height - (cropBox.y + cropBox.height));

    // Draw crop box border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    // Draw resize handles (corners)
    const handleSize = 10;
    ctx.fillStyle = '#3b82f6';
    // Top-left
    ctx.fillRect(cropBox.x - handleSize / 2, cropBox.y - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropBox.x + cropBox.width - handleSize / 2, cropBox.y - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropBox.x - handleSize / 2, cropBox.y + cropBox.height - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(cropBox.x + cropBox.width - handleSize / 2, cropBox.y + cropBox.height - handleSize / 2, handleSize, handleSize);

    // Draw grid inside crop box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropBox.x + cropBox.width / 3, cropBox.y);
    ctx.lineTo(cropBox.x + cropBox.width / 3, cropBox.y + cropBox.height);
    ctx.moveTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y);
    ctx.lineTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y + cropBox.height);
    ctx.stroke();
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(cropBox.x, cropBox.y + cropBox.height / 3);
    ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height / 3);
    ctx.moveTo(cropBox.x, cropBox.y + (cropBox.height * 2) / 3);
    ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + (cropBox.height * 2) / 3);
    ctx.stroke();
  };

  const getHandleAt = (x: number, y: number): string | null => {
    const handleSize = 15;
    const handles = [
      { name: 'tl', x: cropBox.x, y: cropBox.y },
      { name: 'tr', x: cropBox.x + cropBox.width, y: cropBox.y },
      { name: 'bl', x: cropBox.x, y: cropBox.y + cropBox.height },
      { name: 'br', x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - handleSize / 2 &&
        x <= handle.x + handleSize / 2 &&
        y >= handle.y - handleSize / 2 &&
        y <= handle.y + handleSize / 2
      ) {
        return handle.name;
      }
    }

    // Check if inside crop box (for moving)
    if (x >= cropBox.x && x <= cropBox.x + cropBox.width && y >= cropBox.y && y <= cropBox.y + cropBox.height) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getHandleAt(x, y);

    if (handle && handle !== 'move') {
      setResizing(handle);
      setDragStart({ x, y });
    } else if (handle === 'move') {
      setMovingCrop(true);
      setDragStart({ x: x - cropBox.x, y: y - cropBox.y });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor based on position
    const handle = getHandleAt(x, y);
    if (handle === 'tl' || handle === 'br') {
      canvas.style.cursor = 'nwse-resize';
    } else if (handle === 'tr' || handle === 'bl') {
      canvas.style.cursor = 'nesw-resize';
    } else if (handle === 'move') {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'default';
    }

    if (resizing) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      setCropBox((prev) => {
        let newBox = { ...prev };

        if (resizing === 'tl') {
          newBox.x = prev.x + dx;
          newBox.y = prev.y + dy;
          newBox.width = prev.width - dx;
          newBox.height = prev.height - dy;
        } else if (resizing === 'tr') {
          newBox.y = prev.y + dy;
          newBox.width = prev.width + dx;
          newBox.height = prev.height - dy;
        } else if (resizing === 'bl') {
          newBox.x = prev.x + dx;
          newBox.width = prev.width - dx;
          newBox.height = prev.height + dy;
        } else if (resizing === 'br') {
          newBox.width = prev.width + dx;
          newBox.height = prev.height + dy;
        }

        // Maintain aspect ratio if not free
        if (aspectRatio === 'square') {
          const size = Math.min(newBox.width, newBox.height);
          newBox.width = size;
          newBox.height = size;
        } else if (aspectRatio === 'rectangle') {
          const ratio = 5 / 3;
          newBox.height = newBox.width / ratio;
        }

        // Enforce minimum size
        if (newBox.width < 50) newBox.width = 50;
        if (newBox.height < 50) newBox.height = 50;

        // Keep within canvas bounds
        if (newBox.x < 0) newBox.x = 0;
        if (newBox.y < 0) newBox.y = 0;
        if (newBox.x + newBox.width > 400) newBox.width = 400 - newBox.x;
        if (newBox.y + newBox.height > 400) newBox.height = 400 - newBox.y;

        return newBox;
      });

      setDragStart({ x, y });
    } else if (movingCrop) {
      const newX = Math.max(0, Math.min(x - dragStart.x, 400 - cropBox.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, 400 - cropBox.height));

      setCropBox((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    } else if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizing(null);
    setMovingCrop(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleSaveCrop = async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropBox.width;
    cropCanvas.height = cropBox.height;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Calculate the source image coordinates
    const imgAspect = img.width / img.height;
    let drawWidth = 400 * scale;
    let drawHeight = drawWidth / imgAspect;

    if (drawHeight > 400 * scale) {
      drawHeight = 400 * scale;
      drawWidth = drawHeight * imgAspect;
    }

    const imgX = (400 - drawWidth) / 2 + position.x;
    const imgY = (400 - drawHeight) / 2 + position.y;

    // Calculate source coordinates relative to the original image
    const scaleX = img.width / drawWidth;
    const scaleY = img.height / drawHeight;

    const sourceX = (cropBox.x - imgX) * scaleX;
    const sourceY = (cropBox.y - imgY) * scaleY;
    const sourceWidth = cropBox.width * scaleX;
    const sourceHeight = cropBox.height * scaleY;

    // Draw the cropped portion
    cropCtx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      cropBox.width,
      cropBox.height
    );

    // Convert to blob
    cropCanvas.toBlob(async (blob) => {
      if (blob) {
        // Create a file from the blob
        const file = new File([blob], 'logo.png', { type: 'image/png' });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Call onUpload
        onUpload(file);

        // Close modal
        setShowCropModal(false);
        setOriginalImage(null);
      }
    }, 'image/png', 0.95);
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Logo</h3>
        <p className="text-sm text-gray-600 mb-6">Upload your company's logo.</p>

        {/* Logo Preview */}
        <div className="flex flex-col items-center mb-6">
          {preview ? (
            <img src={preview} alt="Company logo" className="max-w-full max-h-48 object-contain" />
          ) : (
            <div className="w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex items-center justify-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            onClick={handleUploadClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          {preview && (
            <Button
              type="button"
              onClick={handleRemove}
              variant="ghost"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Crop & Resize Logo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Canvas */}
            <div className="flex justify-center bg-gray-100 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border-2 border-gray-300 rounded-lg cursor-move shadow-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={aspectRatio === 'square' ? 'default' : 'outline'}
                    onClick={() => setAspectRatio('square')}
                    className="flex-1"
                  >
                    Square (1:1)
                  </Button>
                  <Button
                    type="button"
                    variant={aspectRatio === 'rectangle' ? 'default' : 'outline'}
                    onClick={() => setAspectRatio('rectangle')}
                    className="flex-1"
                  >
                    Rectangle (5:3)
                  </Button>
                  <Button
                    type="button"
                    variant={aspectRatio === 'free' ? 'default' : 'outline'}
                    onClick={() => setAspectRatio('free')}
                    className="flex-1"
                  >
                    Free
                  </Button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Zoom: {Math.round(scale * 100)}%
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Crop className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to use:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Drag image background to reposition the photo</li>
                      <li>Drag corners of blue box to resize crop area</li>
                      <li>Drag inside blue box to move crop area</li>
                      <li>Use zoom slider to scale the image</li>
                      <li>Choose aspect ratio or use Free mode</li>
                      <li>Click "Save Logo" to apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancelCrop}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveCrop} className="bg-blue-600 hover:bg-blue-700">
                Save Logo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
