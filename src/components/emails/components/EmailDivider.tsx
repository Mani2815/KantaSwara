import { Text } from '@react-email/components';
import * as React from 'react';

export function EmailDivider() {
  return (
    <div style={dividerContainer}>
      <div style={dividerLine} />
    </div>
  );
}

const dividerContainer = {
  width: '100%',
  padding: '24px 0',
};

const dividerLine = {
  borderTop: '1px solid #e5e7eb',
  width: '100%',
};
