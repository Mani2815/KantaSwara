import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function AnnouncementEmail(props: any) {
  return (
    <BaseEmailLayout previewText="AnnouncementEmail">
      <Text>This is a placeholder for AnnouncementEmail</Text>
    </BaseEmailLayout>
  );
}
