import { useState } from 'react';
import { Platform } from 'react-native';

type DateTimeMode = 'date' | 'time';

interface UseDateTimePickerResult {
  date: Date;
  setDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  toggleDatePicker: () => void;
  toggleTimePicker: () => void;
  onChangeDatePicker: (event: any, selectedDate?: Date) => void;
  onChangeTimePicker: (event: any, selectedTime?: Date) => void;
  getFormattedDate: () => string;
  getFormattedTime: () => string;
  getDateTimeString: () => string;
}

export function useDateTimePicker(initialDate?: Date): UseDateTimePickerResult {
  const [date, setDate] = useState<Date>(initialDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    if (Platform.OS === 'ios' && showTimePicker) {
      setShowTimePicker(false);
    }
  };

  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker);
    if (Platform.OS === 'ios' && showDatePicker) {
      setShowDatePicker(false);
    }
  };

  const onChangeDatePicker = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeTimePicker = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setDate((prevDate) => {
        const newDate = new Date(prevDate);
        newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        return newDate;
      });
    }
  };

  const getFormattedDate = (): string => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getFormattedTime = (): string => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getDateTimeString = (): string => {
    // Return ISO string for API consumption
    return date.toISOString();
  };

  return {
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    showTimePicker, 
    setShowTimePicker,
    toggleDatePicker,
    toggleTimePicker,
    onChangeDatePicker,
    onChangeTimePicker,
    getFormattedDate,
    getFormattedTime,
    getDateTimeString
  };
}
