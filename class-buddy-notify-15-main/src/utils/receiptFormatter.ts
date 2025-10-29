import { Receipt } from '@/types/pos';

export const formatReceiptId = (receipt: Receipt): string => {
  // Return invoice ID as is (INV-1281025 or MNL-1281025)
  return receipt.id;
};

export const formatReceiptDetailedInfo = (receipt: Receipt): string => {
  const formattedId = formatReceiptId(receipt);
  const date = receipt.timestamp.toLocaleDateString('id-ID');
  const time = receipt.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  return `${formattedId} - ${date} ${time}`;
};

export const formatReceiptForDisplay = (receipt: Receipt): {
  displayId: string;
  dateTime: string;
  shortDate: string;
  shortTime: string;
} => {
  const displayId = formatReceiptId(receipt);
  const date = receipt.timestamp.toLocaleDateString('id-ID');
  const time = receipt.timestamp.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return {
    displayId,
    dateTime: `${date} ${time}`,
    shortDate: date,
    shortTime: time
  };
};