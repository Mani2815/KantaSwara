import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function EmployeeInvitationEmail(props: any) {
  return (
    <BaseEmailLayout previewText="EmployeeInvitationEmail">
      <Text>This is a placeholder for EmployeeInvitationEmail</Text>
    </BaseEmailLayout>
  );
}
