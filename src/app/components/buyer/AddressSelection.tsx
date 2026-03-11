import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

// Redirect component; address selection has been moved to DeliveryScreen.
export function AddressSelection() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/buyer/delivery');
  }, [navigate]);
  return null;
}
