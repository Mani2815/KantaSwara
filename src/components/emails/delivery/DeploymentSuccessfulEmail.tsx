import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function DeploymentSuccessfulEmail(props: any) {
  return (
    <BaseEmailLayout previewText="DeploymentSuccessfulEmail">
      <Text>This is a placeholder for DeploymentSuccessfulEmail</Text>
    </BaseEmailLayout>
  );
}
