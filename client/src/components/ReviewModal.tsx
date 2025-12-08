import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Upload, X, Accessibility } from "lucide-react";
import { toast } from "sonner";
import { storagePut } from "../../../server/storage";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  locationId: number;
  locationName: string;
}

export default function ReviewModal({ open, onClose, locationId, locationName }: ReviewModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [adaComplianceRating, setAdaComplianceRating] = useState(0);
  const [restroomType, setRestroomType] = useState<"male" | "female" | "unisex_family">("unisex_family");
  const [usedAdaStall, setUsedAdaStall] = useState(false);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  const resetForm = () => {
    setOverallRating(0);
    setCleanlinessRating(0);
    setSafetyRating(0);
    setAdaComplianceRating(0);
    setRestroomType("unisex_family");
    setUsedAdaStall(false);
    setComment("");
    setPhotos([]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        
        // Upload to S3 via tRPC
        const response = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename: file.name }),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await response.json();
        uploadedUrls.push(url);
      }

      setPhotos([...photos, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo(s) uploaded`);
    } catch (error) {
      toast.error("Failed to upload photos");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }
    if (cleanlinessRating === 0 || safetyRating === 0) {
      toast.error("Please rate cleanliness and safety");
      return;
    }

    createReviewMutation.mutate({
      locationId,
      overallRating,
      cleanlinessRating,
      safetyRating,
      adaComplianceRating: adaComplianceRating || undefined,
      restroomTypeUsed: restroomType,
      usedAdaStall,
      comment: comment.trim() || undefined,
      photoUrls: photos.length > 0 ? photos : undefined,
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-purple-700">{value}/10</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-700">
            Review: {locationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <StarRating
            value={overallRating}
            onChange={setOverallRating}
            label="Overall Rating ⭐"
          />

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRating
              value={cleanlinessRating}
              onChange={setCleanlinessRating}
              label="Cleanliness 🧼"
            />
            <StarRating
              value={safetyRating}
              onChange={setSafetyRating}
              label="Safety 🔒"
            />
          </div>

          <StarRating
            value={adaComplianceRating}
            onChange={setAdaComplianceRating}
            label="ADA Compliance ♿ (Optional)"
          />

          {/* Restroom Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Restroom Type Used</Label>
            <RadioGroup value={restroomType} onValueChange={(v: any) => setRestroomType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">Male 🚹</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">Female 🚺</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unisex_family" id="unisex" />
                <Label htmlFor="unisex" className="cursor-pointer">Unisex/Family 🚻</Label>
              </div>
            </RadioGroup>
          </div>

          {/* ADA Stall */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUsedAdaStall(!usedAdaStall)}
              className={`p-3 rounded-lg border-2 transition-all ${
                usedAdaStall
                  ? "bg-blue-100 border-blue-500"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <Accessibility className={`w-6 h-6 ${usedAdaStall ? "text-blue-600" : "text-gray-400"}`} />
            </button>
            <Label className="text-sm">I used an ADA-compliant stall</Label>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Comments (Optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Inappropriate language will be automatically filtered.
            </p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Photos (Optional, max 5)</Label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <Upload className="w-6 h-6 text-purple-500 mb-1" />
                  <span className="text-xs text-purple-600">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="text-sm text-purple-600">Uploading photos...</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createReviewMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-purple-300 text-purple-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
