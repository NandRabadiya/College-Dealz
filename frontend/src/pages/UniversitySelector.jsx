import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from './Api/api';

const UniversitySelector = ({ onUniversitySelect, isOpen, onOpenChange }) => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/universities`);
        if (!response.ok) throw new Error('Failed to fetch universities');
        const data = await response.json();
        setUniversities(data);
      } catch (err) {
        setError('Failed to load universities. Please try again later.');
        console.error('Error fetching universities:', err);
      }
    };

    if (isOpen) {
      fetchUniversities();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedUniversity) {
      onUniversitySelect(selectedUniversity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your University</DialogTitle>
          <DialogDescription>
            Please select your university to see relevant products
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <Select
              value={selectedUniversity}
              onValueChange={setSelectedUniversity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem 
                    key={university.id} 
                    value={university.id.toString()}
                  >
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            onClick={handleConfirm}
            disabled={!selectedUniversity}
            className="w-full"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversitySelector;