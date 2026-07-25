import { prisma } from '@/lib/prisma';

export async function logEmployeeAction(data: {
  employeeId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  targetId?: string;
  previousValue?: any;
  newValue?: any;
}) {
  try {
    await prisma.employeeAuditLog.create({
      data: {
        employeeId: data.employeeId,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        targetId: data.targetId,
        previousValue: data.previousValue ? (JSON.stringify(data.previousValue) as any) : undefined,
        newValue: data.newValue ? (JSON.stringify(data.newValue) as any) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log employee action:', error);
  }
}
