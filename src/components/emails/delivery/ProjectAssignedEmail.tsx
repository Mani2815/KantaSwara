import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function ProjectAssignedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="ProjectAssignedEmail">
      <Text>This is a placeholder for ProjectAssignedEmail</Text>
    </BaseEmailLayout>
  );
}
