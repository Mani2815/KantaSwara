import { Text } from '@react-email/components';
import * as React from 'react';

interface EmailAlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}

export function EmailAlert({ type = 'info', children }: EmailAlertProps) {
  let style = alertInfo;
  if (type === 'warning') style = alertWarning;
  if (type === 'error') style = alertError;
  if (type === 'success') style = alertSuccess;

  return (
    <div style={{ ...alertBase, ...style }}>
      <Text style={alertText}>{children}</Text>
    </div>
  );
}

const alertBase = {
  padding: '12px 16px',
  borderRadius: '6px',
  marginTop: '16px',
  marginBottom: '16px',
};

const alertInfo = {
  backgroundColor: '#EFF6FF',
  borderLeft: '4px solid #3B82F6',
};

const alertWarning = {
  backgroundColor: '#FFFBEB',
  borderLeft: '4px solid #F59E0B',
};

const alertError = {
  backgroundColor: '#FEF2F2',
  borderLeft: '4px solid #EF4444',
};

const alertSuccess = {
  backgroundColor: '#F0FDF4',
  borderLeft: '4px solid #10B981',
};

const alertText = {
  margin: '0',
  fontSize: '14px',
  color: '#374151',
  lineHeight: '20px',
};
