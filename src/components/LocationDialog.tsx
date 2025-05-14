
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { LoaderCircle } from 'lucide-react';

interface LocationFormValues {
  location: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => void;
}

const LocationDialog = ({ open, onOpenChange, onSubmit }: LocationDialogProps) => {
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const form = useForm<LocationFormValues>({
    defaultValues: {
      location: ''
    }
  });

  const handleSubmit = (values: LocationFormValues) => {
    onSubmit(values);
    form.reset();
  };
  
  const getGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }
    
    setIsLoadingGeolocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Convert coordinates to city name using reverse geocoding API
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location: ", error);
        setIsLoadingGeolocation(false);
        alert("Không thể lấy vị trí. Vui lòng nhập thủ công.");
      }
    );
  };
  
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // This is a mock function since we're not using a real geocoding API
      // In production, you'd call a geocoding API like Google Maps or OpenStreetMap
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in reality, this would come from the geocoding API
      const city = "Thành phố tự động";
      
      // Set the form value and submit
      form.setValue('location', city);
      onSubmit({ location: city });
      setIsLoadingGeolocation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error in reverse geocoding: ", error);
      setIsLoadingGeolocation(false);
      alert("Không thể xác định thành phố. Vui lòng nhập thủ công.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập vị trí của bạn</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp thành phố hoặc tỉnh để nhận thông tin thời tiết và khuyến nghị điều trị phù hợp
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí (thành phố hoặc tỉnh)</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={getGeolocation}
            disabled={isLoadingGeolocation}
            className="w-full"
          >
            {isLoadingGeolocation ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Đang lấy vị trí...
              </>
            ) : (
              "Tự động xác định vị trí"
            )}
          </Button>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Xác nhận</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
